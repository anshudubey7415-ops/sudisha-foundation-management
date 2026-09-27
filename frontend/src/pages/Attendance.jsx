import { useState, useEffect, useMemo } from 'react';
import { Check, X, Loader2, Save } from 'lucide-react';
import API from '../api';
import Layout from '../components/Layout';
import { useToast } from '../context/ToastContext';

const Attendance = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/students');
      const list = Array.isArray(res.data) ? res.data : [];
      setStudents(list);
      // Initialize attendance map if needed
      const initial = {};
      list.forEach(s => { initial[s._id] = 'Present'; });
      setAttendance(initial);
    } catch (err) {
      console.error(err);
      showError('Failed to load students list');
    } finally {
      setLoading(false);
    }
  };

  const classes = useMemo(() => {
    const set = new Set(students.map(s => s.class).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = `${s.name || ''} ${s.rollNumber || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'All' || s.class === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, selectedClass]);

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;
    filteredStudents.forEach(s => {
      const status = attendance[s._id];
      if (status === 'Present') present++;
      else if (status === 'Absent') absent++;
      else unmarked++;
    });
    const total = filteredStudents.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, unmarked, total, rate };
  }, [filteredStudents, attendance]);

  const setAllStatus = (status) => {
    setAttendance(prev => {
      const updated = { ...prev };
      filteredStudents.forEach(s => {
        updated[s._id] = status;
      });
      return updated;
    });
  };

  const handleToggle = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSubmit = async () => {
    if (Object.keys(attendance).length === 0) {
      showWarning('Please mark attendance for at least one student.');
      return;
    }

    try {
      setSaving(true);
      const records = Object.keys(attendance).map(id => ({
        student: id,
        date,
        status: attendance[id]
      }));

      await API.post('/attendance/bulk', { records });
      showSuccess(`Attendance for ${records.length} students recorded successfully!`);
    } catch (err) {
      console.error(err);
      showError('Failed to submit attendance records.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout
      title="Student Attendance Tracker"
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setAllStatus('Present')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Check size={14} /> Mark All Present
          </button>
          <button
            onClick={() => setAllStatus('Absent')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <X size={14} /> Mark All Absent
          </button>
        </div>
      }
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Controls Bar */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Attendance Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Search Student</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Filter by Class</label>
              <select
                className="form-control"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Classes' : `Class ${c}`}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Realtime Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div className="card" style={{ padding: '16px', textAlign: 'center', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total}</div>
          </div>
          <div className="card" style={{ padding: '16px', textAlign: 'center', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Present</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981' }}>{stats.present}</div>
          </div>
          <div className="card" style={{ padding: '16px', textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Absent</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444' }}>{stats.absent}</div>
          </div>
          <div className="card" style={{ padding: '16px', textAlign: 'center', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b' }}>{stats.rate}%</div>
          </div>
        </div>

        {/* Student List */}
        {loading ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No students found matching the selected criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredStudents.map((student) => {
              const status = attendance[student._id] || 'Present';
              const isPresent = status === 'Present';
              const isAbsent = status === 'Absent';

              return (
                <div
                  key={student._id}
                  className="card"
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    transition: 'border-color 0.2s ease',
                    borderLeft: isPresent ? '4px solid #10b981' : isAbsent ? '4px solid #ef4444' : '4px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}>
                      {student.name ? student.name[0].toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                        <span>Roll: {student.rollNumber || 'N/A'}</span>
                        <span>•</span>
                        <span>Class: {student.class || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(student._id, 'Present')}
                      className={`btn btn-sm ${isPresent ? 'btn-success' : 'btn-secondary'}`}
                      style={{
                        minWidth: '85px',
                        boxShadow: isPresent ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={13} /> Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(student._id, 'Absent')}
                      className={`btn btn-sm ${isAbsent ? 'btn-danger' : 'btn-secondary'}`}
                      style={{
                        minWidth: '85px',
                        boxShadow: isAbsent ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <X size={13} /> Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Action */}
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={saving || filteredStudents.length === 0}
            style={{ padding: '12px 36px', fontSize: '1rem', width: '100%', maxWidth: '300px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving Records...
              </>
            ) : (
              <>
                <Save size={16} /> Save Attendance Records
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;
import { useState, useEffect } from 'react';
import API from '../api'; // <-- Yahan plain axios ki jagah apna custom API instance import kar

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Plain axios ki jagah API use kiya
        const res = await API.get('/students'); 
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error(err); }
    };
    fetchStudents();
  }, []);

  const styles = {
    container: { 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      padding: '40px 20px', 
      color: '#1e293b', 
      maxWidth: '900px', 
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif" 
    },
    headerSection: { marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' },
    card: { 
      backgroundColor: '#ffffff', 
      padding: '16px 24px', 
      borderRadius: '8px', 
      marginBottom: '10px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    btn: (isActive, color) => ({
      padding: '8px 16px', 
      borderRadius: '6px', 
      border: isActive ? `1px solid ${color}` : '1px solid #cbd5e1', 
      color: isActive ? color : '#64748b', 
      fontWeight: '600', 
      cursor: 'pointer',
      backgroundColor: isActive ? `${color}15` : 'transparent',
      transition: 'all 0.2s ease'
    }),
    submitBtn: { 
      marginTop: '20px',
      width: '100%', 
      padding: '12px', 
      background: '#1e3a8a', 
      border: 'none', 
      borderRadius: '6px', 
      color: 'white', 
      fontWeight: '600', 
      fontSize: '16px', 
      cursor: 'pointer' 
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Attendance Tracker</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} 
          style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
      </div>

      {students.map((student) => (
        <div key={student._id} style={styles.card}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>{student.name}</div>
            <div style={{ color: '#64748b', fontSize: '13px' }}>Roll: {student.rollNumber || 'N/A'}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={styles.btn(attendance[student._id] === 'Present', '#059669')} onClick={() => setAttendance(prev => ({...prev, [student._id]: 'Present'}))}>Present</button>
            <button style={styles.btn(attendance[student._id] === 'Absent', '#dc2626')} onClick={() => setAttendance(prev => ({...prev, [student._id]: 'Absent'}))}>Absent</button>
          </div>
        </div>
      ))}
      <button onClick={async () => { 
        try {
          // Yahan bhi API instance use kiya
          await API.post('/attendance/bulk', { records: Object.keys(attendance).map(id => ({student: id, date, status: attendance[id]})) }); 
          alert("Saved!"); 
        } catch {
          alert("Error saving attendance");
        }
      }} style={styles.submitBtn}>
        Submit Attendance Records
      </button>
    </div>
  );
};

export default Attendance;
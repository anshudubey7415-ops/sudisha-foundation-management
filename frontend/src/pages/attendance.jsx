import { useState, useEffect } from 'react';
import axios from 'axios';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('/api/students');
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error(err); }
    };
    fetchStudents();
  }, []);

  // Styles object
  const styles = {
    container: { backgroundColor: '#0f172a', minHeight: '100vh', padding: '20px', color: 'white', borderRadius: '20px' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' },
    btn: (isActive, color) => ({
      padding: '10px 20px', borderRadius: '10px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer',
      backgroundColor: isActive ? color : '#475569', boxShadow: isActive ? `0 0 15px ${color}` : 'none', transition: '0.3s'
    })
  };

  return (
    <div style={styles.container}>
      <h1 style={{ color: '#38bdf8', fontSize: '32px', marginBottom: '20px' }}>Attendance Tracker</h1>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '10px', borderRadius: '10px', marginBottom: '20px', background: '#334155', border: 'none', color: 'white' }} />

      {students.map((student) => (
        <div key={student._id} style={styles.card}>
          <div>
            <strong style={{ fontSize: '18px' }}>{student.name}</strong><br/>
            <span style={{ color: '#94a3b8' }}>Roll No: {student.rollNumber || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={styles.btn(attendance[student._id] === 'Present', '#10b981')} onClick={() => setAttendance(prev => ({...prev, [student._id]: 'Present'}))}>Present</button>
            <button style={styles.btn(attendance[student._id] === 'Absent', '#f43f5e')} onClick={() => setAttendance(prev => ({...prev, [student._id]: 'Absent'}))}>Absent</button>
          </div>
        </div>
      ))}
      <button onClick={async () => { await axios.post('/api/attendance/bulk', { records: Object.keys(attendance).map(id => ({student: id, date, status: attendance[id]})) }); alert("Saved!"); }} style={{ width: '100%', padding: '15px', background: '#6366f1', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>Submit Records</button>
    </div>
  );
};

export default Attendance;
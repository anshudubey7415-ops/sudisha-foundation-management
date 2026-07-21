import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Card = ({ title, count, color, onClick }) => (
  <div 
    onClick={onClick} 
    style={{ 
      background: "white", 
      borderLeft: `5px solid ${color}`, 
      padding: "20px", 
      borderRadius: "8px", 
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)", 
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.2s" 
    }} 
    onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")} 
    onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{title}</p>
    <h2 style={{ margin: "10px 0 0 0", color: "#1e3a8a" }}>{count}</h2>
  </div>
);

function ManagerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [todayRecords, setTodayRecords] = useState({ students: [], interns: [], volunteers: [] });
  const [myRequests, setMyRequests] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedList, setSelectedList] = useState([]);
  const [filterDate] = useState(new Date().toISOString().split("T")[0]);

  const loadData = useCallback(async () => {
    try {
      const [sRes, iRes, vRes, saRes, iaRes, vaRes, pRes, reqRes] = await Promise.all([
        API.get("/students"), API.get("/interns"), API.get("/volunteers"),
        API.get("/attendance"), API.get("/intern-attendance"), API.get("/volunteer-attendance"),
        API.get("/projects"), API.get("/requests/my-requests")
      ]);

      setProjects(pRes.data);
      setMyRequests(reqRes.data);

      const filteredS = saRes.data.filter(r => r.date === filterDate);
      const filteredI = iaRes.data.filter(r => r.date === filterDate);
      const filteredV = vaRes.data.filter(r => r.date === filterDate);

      setTodayRecords({ students: filteredS, interns: filteredI, volunteers: filteredV });
      setStats({
        students: { total: sRes.data.length, present: filteredS.filter(r => r.status === "Present").length, absent: filteredS.filter(r => r.status === "Absent").length },
        interns: { total: iRes.data.length, present: filteredI.filter(r => r.status === "Present").length, absent: filteredI.filter(r => r.status === "Absent").length },
        volunteers: { total: vRes.data.length, present: filteredV.filter(r => r.status === "Present").length, absent: filteredV.filter(r => r.status === "Absent").length }
      });
    } catch (err) { console.error("Error loading dashboard:", err); }
  }, [filterDate]);

  useEffect(() => {
    const userRole = localStorage.getItem("role") || "";
    if (userRole.toLowerCase() !== "manager" && userRole.toLowerCase() !== "admin") {
      alert("Access Denied");
      navigate("/login");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
  }, [navigate, loadData]);

  const btnStyle = { padding: "8px 12px", background: "#1e3a8a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };

  if (!stats) return <div style={{ padding: "50px", textAlign: "center" }}><h2>Loading...</h2></div>;

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <h1 style={{ color: "#1e3a8a", margin: 0 }}>Manager Dashboard Sudisha </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/all-announcements")} style={{ padding: "10px", background: "#8b5cf6", color: "white", border: "none", borderRadius: "5px" }}>Announcements</button>
          <button onClick={() => navigate("/settings")} style={{ padding: "10px", background: "#334155", color: "white", border: "none", borderRadius: "5px" }}>Settings</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        {[ {name: 'students', label: 'Student'}, {name: 'interns', label: 'Intern'}, {name: 'volunteers', label: 'Volunteer'} ].map((item) => (
          <div key={item.name} style={{ background: "white", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 10px 0" }}>{item.label} Module</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              <button style={btnStyle} onClick={() => navigate(`/${item.name}`)}>Details</button>
              <button style={btnStyle} onClick={() => navigate(`/add-${item.name.slice(0,-1)}`)}>Add</button>
              <button 
                style={btnStyle} 
                onClick={() => {
                  if (item.name === 'volunteers') {
                    navigate('/volunteer/bulk-attendance');
                  } else {
                    navigate(`/${item.name === 'students' ? '' : item.name.slice(0,-1) + '-'}attendance`);
                  }
                }}
              >
                Attendance
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", marginBottom: "30px", border: "1px solid #e2e8f0" }}>
        <h3 
          style={{ color: "#1e3a8a", marginTop: 0, cursor: "pointer", display: "inline-block" }} 
          onClick={() => navigate("/my-requests")}
        >
          My Recent Requests ({myRequests.length}) ➔
        </h3>
        {myRequests.map(req => (
          <div key={req._id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span><strong>{req.actionType}</strong> on {req.targetCollection}</span>
            <span style={{ fontWeight: "bold", color: req.status === 'APPROVED' ? '#166534' : req.status === 'REJECTED' ? '#991b1b' : '#854d0e' }}>{req.status}</span>
          </div>
        ))}
      </div>

      <h3 style={{ color: "#334155" }}>📚 Analytics Overview</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <Card title="Total Students" count={stats.students.total} color="#2563eb" />
        <Card title="Present Students" count={stats.students.present} color="#16a34a" onClick={() => { setSelectedTitle("Present Students"); setSelectedList(todayRecords.students.filter(r => r.status === "Present")); }} />
        <Card title="Absent Students" count={stats.students.absent} color="#dc2626" onClick={() => { setSelectedTitle("Absent Students"); setSelectedList(todayRecords.students.filter(r => r.status === "Absent")); }} />
        
        <Card title="Total Interns" count={stats.interns.total} color="#7c3aed" />
        <Card title="Present Interns" count={stats.interns.present} color="#16a34a" onClick={() => { setSelectedTitle("Present Interns"); setSelectedList(todayRecords.interns.filter(r => r.status === "Present")); }} />
        <Card title="Absent Interns" count={stats.interns.absent} color="#dc2626" onClick={() => { setSelectedTitle("Absent Interns"); setSelectedList(todayRecords.interns.filter(r => r.status === "Absent")); }} />
        
        <Card title="Total Volunteers" count={stats.volunteers.total} color="#d97706" />
        <Card title="Present Volunteers" count={stats.volunteers.present} color="#16a34a" onClick={() => { setSelectedTitle("Present Volunteers"); setSelectedList(todayRecords.volunteers.filter(r => r.status === "Present")); }} />
        <Card title="Absent Volunteers" count={stats.volunteers.absent} color="#dc2626" onClick={() => { setSelectedTitle("Absent Volunteers"); setSelectedList(todayRecords.volunteers.filter(r => r.status === "Absent")); }} />
      </div>

      {selectedList.length > 0 && (
        <div style={{ marginTop: "30px", padding: "20px", background: "white", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><h3>{selectedTitle}</h3><button onClick={() => setSelectedList([])}>Close</button></div>
          {selectedList.map((r) => (<div key={r._id} style={{ padding: "5px 0" }}>{r.student?.name || r.intern?.name || r.volunteer?.name || "N/A"}</div>))}
        </div>
      )}

      <h3 style={{ marginTop: "30px", color: "#334155" }}>📊 Visual Insights</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
          <h4>Project Status</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={[{name: "Active", value: projects.filter(p => p.status === "Active").length}, {name: "Completed", value: projects.filter(p => p.status === "Completed").length}]} dataKey="value" fill="#8884d8"><Cell fill="#2563eb" /><Cell fill="#16a34a" /></Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
          <h4>Member Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{name: 'Students', count: stats.students.total}, {name: 'Interns', count: stats.interns.total}, {name: 'Volunteers', count: stats.volunteers.total}]}>
              <XAxis dataKey="name" /><Tooltip /><Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
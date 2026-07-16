import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Card = ({ title, count, color, onClick, suffix = "" }) => (
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
    <h2 style={{ margin: "10px 0 0 0", color: "#1e3a8a" }}>{count}{suffix}</h2>
  </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]); // <-- Ye add kiya
  const [todayRecords, setTodayRecords] = useState({ students: [], interns: [], volunteers: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedList, setSelectedList] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [sRes, iRes, vRes, saRes, iaRes, vaRes, aRes, pRes] = await Promise.all([
          API.get("/students"),
          API.get("/interns"),
          API.get("/volunteers"),
          API.get("/attendance"),
          API.get("/intern-attendance"),
          API.get("/volunteer-attendance"),
          API.get("/announcements"),
          API.get("/projects") // <-- Ye add kiya
        ]);

        if (!isMounted) return;

        setAnnouncements(aRes.data);
        setProjects(pRes.data); // <-- Ye add kiya

        const filteredS = saRes.data.filter((r) => r.date === filterDate);
        const filteredI = iaRes.data.filter((r) => r.date === filterDate);
        const filteredV = vaRes.data.filter((r) => r.date === filterDate);

        const totalRecords = saRes.data.length + iaRes.data.length + vaRes.data.length;
        const totalPresent = 
          saRes.data.filter(r => r.status === "Present").length + 
          iaRes.data.filter(r => r.status === "Present").length +
          vaRes.data.filter(r => r.status === "Present").length;
        
        const pct = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : 0;

        setTodayRecords({ students: filteredS, interns: filteredI, volunteers: filteredV });
        setStats({
          students: { 
            total: sRes.data.length, 
            present: filteredS.filter(r => r.status === "Present").length, 
            absent: filteredS.filter(r => r.status === "Absent").length 
          },
          interns: { 
            total: iRes.data.length, 
            present: filteredI.filter(r => r.status === "Present").length, 
            absent: filteredI.filter(r => r.status === "Absent").length 
          },
          volunteers: { 
            total: vRes.data.length, 
            present: filteredV.filter(r => r.status === "Present").length, 
            absent: filteredV.filter(r => r.status === "Absent").length 
          },
          foundation: { 
            totalPeople: sRes.data.length + iRes.data.length + vRes.data.length, 
            totalRecords, 
            attendancePct: pct 
          }
        });
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [filterDate]);

  if (!stats) return <div style={{ padding: "50px", textAlign: "center" }}><h2>Loading Sudisha Foundation Data...</h2></div>;

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* ... (Baki purana code waise hi hai) ... */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <h1 style={{ color: "#1e3a8a", margin: 0 }}>Sudisha Foundation Dashboard</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ padding: "10px", borderRadius: "5px", border: "1px solid #cbd5e1" }} />
          <button onClick={() => navigate("/settings")} style={{ padding: "10px 15px", background: "#334155", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>⚙️ Settings</button>
        </div>
      </div>

      {announcements.length > 0 && (
        <div onClick={() => navigate("/all-announcements")} style={{ background: "#fffbeb", padding: "20px", border: "1px solid #f59e0b", borderRadius: "8px", marginBottom: "30px", cursor: "pointer" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#b45309" }}>📢 Latest Announcements</h3>
          <p style={{ margin: 0 }}><strong>{announcements[0].title}</strong>: {announcements[0].message}</p>
        </div>
      )}

      {/* Analytics Sections */}
      <h3 style={{ color: "#334155" }}>📚 Student Analytics</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <Card title="Total Students" count={stats.students.total} color="#2563eb" />
        <Card title="Present" count={stats.students.present} color="#16a34a" onClick={() => { setSelectedTitle("Present Students"); setSelectedList(todayRecords.students.filter(r => r.status === "Present")); }} />
        <Card title="Absent" count={stats.students.absent} color="#dc2626" onClick={() => { setSelectedTitle("Absent Students"); setSelectedList(todayRecords.students.filter(r => r.status === "Absent")); }} />
      </div>

      <h3 style={{ marginTop: "30px", color: "#334155" }}>🎓 Intern Analytics</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <Card title="Total Interns" count={stats.interns.total} color="#7c3aed" />
        <Card title="Present" count={stats.interns.present} color="#16a34a" onClick={() => { setSelectedTitle("Present Interns"); setSelectedList(todayRecords.interns.filter(r => r.status === "Present")); }} />
        <Card title="Absent" count={stats.interns.absent} color="#dc2626" onClick={() => { setSelectedTitle("Absent Interns"); setSelectedList(todayRecords.interns.filter(r => r.status === "Absent")); }} />
      </div>

      <h3 style={{ marginTop: "30px", color: "#334155" }}>🤝 Volunteer Analytics</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <Card title="Total Volunteers" count={stats.volunteers.total} color="#d97706" />
        <Card title="Present" count={stats.volunteers.present} color="#16a34a" onClick={() => { setSelectedTitle("Present Volunteers"); setSelectedList(todayRecords.volunteers.filter(r => r.status === "Present")); }} />
        <Card title="Absent" count={stats.volunteers.absent} color="#dc2626" onClick={() => { setSelectedTitle("Absent Volunteers"); setSelectedList(todayRecords.volunteers.filter(r => r.status === "Absent")); }} />
      </div>

      <h3 style={{ marginTop: "30px", color: "#334155" }}>🏢 Foundation Overview</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <Card title="Total People" count={stats.foundation.totalPeople} color="#0f766e" />
        <Card title="Total Records" count={stats.foundation.totalRecords} color="#9333ea" />
        <Card title="Attendance %" count={stats.foundation.attendancePct} color="#f59e0b" suffix="%" />
      </div>

      {selectedList.length > 0 && (
        <div style={{ marginTop: "30px", padding: "20px", background: "white", borderRadius: "8px" }}>
          <h3>{selectedTitle}</h3>
          {selectedList.map((r) => (
            <div key={r._id} style={{ padding: "10px", borderBottom: "1px solid #f1f5f9" }}>
              {r.student?.name || r.intern?.name || r.volunteer?.name || "N/A"}
            </div>
          ))}
        </div>
      )}

      {/* Visual Insights Section */}
      <h3 style={{ marginTop: "30px", color: "#334155" }}>📊 Visual Insights</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h4 style={{ textAlign: "center" }}>Project Status Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={[{name: "Active", value: projects.filter(p => p.status === "Active").length}, {name: "Completed", value: projects.filter(p => p.status === "Completed").length}]} innerRadius={60} outerRadius={80} dataKey="value">
                <Cell fill="#2563eb" /> <Cell fill="#16a34a" />
              </Pie>
              <Tooltip /> <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h4 style={{ textAlign: "center" }}>Member Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[{name: 'Students', count: stats.students.total}, {name: 'Interns', count: stats.interns.total}, {name: 'Volunteers', count: stats.volunteers.total}]}>
              <XAxis dataKey="name" /> <YAxis /> <Tooltip /> <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
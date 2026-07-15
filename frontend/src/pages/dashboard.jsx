import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [stats, setStats] = useState({
    students: { total: 0, present: 0, absent: 0 },
    interns: { total: 0, present: 0, absent: 0, active: 0, completed: 0 },
    volunteers: { total: 0, present: 0, absent: 0 },
    foundation: { totalPeople: 0, totalRecords: 0, attendancePct: 0 }
  });

  const [todayRecords, setTodayRecords] = useState({ students: [], interns: [], volunteers: [] });
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedList, setSelectedList] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const [sRes, iRes, vRes, saRes, iaRes, vaRes] = await Promise.all([
        API.get("/students"),
        API.get("/interns"),
        API.get("/volunteers"),
        API.get("/attendance"),
        API.get("/intern-attendance"),
        API.get("/volunteer-attendance")
      ]);

      const sData = sRes.data;
      const iData = iRes.data;
      const vData = vRes.data;

      const todayS = saRes.data.filter(r => r.date === today);
      const todayI = iaRes.data.filter(r => r.date === today);
      const todayV = vaRes.data.filter(r => r.date === today);

      // Foundation Stats Logic
      const totalRecords = saRes.data.length + iaRes.data.length + vaRes.data.length;
      const totalPresent = 
        saRes.data.filter(r => r.status === "Present").length + 
        iaRes.data.filter(r => r.status === "Present").length +
        vaRes.data.filter(r => r.status === "Present").length;
      
      const pct = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : 0;

      setTodayRecords({ students: todayS, interns: todayI, volunteers: todayV });

      setStats({
        students: { total: sData.length, present: todayS.filter(r => r.status === "Present").length, absent: todayS.filter(r => r.status === "Absent").length },
        interns: { total: iData.length, active: iData.filter(i => i.status === "Active").length, completed: iData.filter(i => i.status === "Completed").length, present: todayI.filter(r => r.status === "Present").length, absent: todayI.filter(r => r.status === "Absent").length },
        volunteers: { total: vData.length, present: todayV.filter(r => r.status === "Present").length, absent: todayV.filter(r => r.status === "Absent").length },
        foundation: { totalPeople: sData.length + iData.length + vData.length, totalRecords, attendancePct: pct }
      });
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    }
  };

  const handleShowList = (type, status) => {
    const list = todayRecords[type].filter(r => r.status === status);
    setSelectedTitle(`Today's ${status} ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    setSelectedList(list);
  };

  const Card = ({ title, count, color, onClick, suffix = "" }) => (
    <div onClick={onClick} style={{ color: "white", padding: "15px", borderRadius: "10px", width: "170px", textAlign: "center", cursor: onClick ? "pointer" : "default", background: color, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      <h3>{title}</h3>
      <h2>{count}{suffix}</h2>
    </div>
  );

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Sudisha Foundation Dashboard</h1>

      <h2>📚 Student Analytics</h2>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <Card title="Total" count={stats.students.total} color="#2563eb" />
        <Card title="Present" count={stats.students.present} color="#16a34a" onClick={() => handleShowList("students", "Present")} />
        <Card title="Absent" count={stats.students.absent} color="#dc2626" onClick={() => handleShowList("students", "Absent")} />
      </div>

      <h2 style={{ marginTop: "30px" }}>🎓 Intern Analytics</h2>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <Card title="Total" count={stats.interns.total} color="#7c3aed" />
        <Card title="Active" count={stats.interns.active} color="#0891b2" />
        <Card title="Completed" count={stats.interns.completed} color="#ea580c" />
        <Card title="Present" count={stats.interns.present} color="#16a34a" onClick={() => handleShowList("interns", "Present")} />
        <Card title="Absent" count={stats.interns.absent} color="#dc2626" onClick={() => handleShowList("interns", "Absent")} />
      </div>

      <h2 style={{ marginTop: "30px" }}>🤝 Volunteer Analytics</h2>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <Card title="Total" count={stats.volunteers.total} color="#d97706" />
        <Card title="Present" count={stats.volunteers.present} color="#16a34a" onClick={() => handleShowList("volunteers", "Present")} />
        <Card title="Absent" count={stats.volunteers.absent} color="#dc2626" onClick={() => handleShowList("volunteers", "Absent")} />
      </div>

      <h2 style={{ marginTop: "30px" }}>🏢 Foundation Overview</h2>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <Card title="Total People" count={stats.foundation.totalPeople} color="#0f766e" />
        <Card title="Records" count={stats.foundation.totalRecords} color="#9333ea" />
        <Card title="Overall %" count={stats.foundation.attendancePct} color="#f59e0b" suffix="%" />
      </div>

      {selectedList.length > 0 && (
        <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "10px" }}>
          <h2>{selectedTitle}</h2>
          {selectedList.map((r) => (
            <div key={r._id} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              <strong>{r.student?.name || r.intern?.name || r.volunteer?.name || "N/A"}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
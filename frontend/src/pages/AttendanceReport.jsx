import { useState } from "react";
import API from "../api";
import Layout from "../components/Layout";

const AttendanceReport = () => {
  const [dates, setDates] = useState({ start: "", end: "" });
  const [category, setCategory] = useState("all");
  const [report, setReport] = useState([]);

  const generateReport = async () => {
    try {
      let data = [];
      if (category === "students" || category === "all") {
        const res = await API.get("/attendance");
        data = [...data, ...res.data.map(r => ({ ...r, type: "Student" }))];
      }
      if (category === "interns" || category === "all") {
        const res = await API.get("/intern-attendance");
        data = [...data, ...res.data.map(r => ({ ...r, type: "Intern" }))];
      }
      if (category === "volunteers" || category === "all") {
        const res = await API.get("/volunteer-attendance");
        data = [...data, ...res.data.map(r => ({ ...r, type: "Volunteer" }))];
      }

      const filtered = data.filter(r => r.date >= dates.start && r.date <= dates.end);
      
      const formatted = filtered.map(r => ({
        Date: r.date,
        Name: r.student?.name || r.intern?.name || r.volunteer?.name || "N/A",
        Status: r.status,
        Category: r.type
      }));

      setReport(formatted);
    } catch (err) {
      console.error("Report Error", err);
    }
  };

  const downloadCSV = () => {
    const headers = ["Date", "Name", "Status", "Category"];
    
    // Excel-friendly CSV generation: 
    // 1. Double quotes around fields to handle special characters/formatting
    // 2. \uFEFF (BOM) to force UTF-8 so Excel displays correctly
    const csvRows = report.map(r => 
      [r.Date, r.Name, r.Status, r.Category]
        .map(val => `"${val}"`)
        .join(",")
    );

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${category}_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url); // Memory cleanup
  };

  return (
    <Layout title="Attendance Report">
      <div style={{ padding: "20px" }}>
        <h2 style={{ color: "#1e3a8a", marginBottom: "20px" }}>📅 Attendance Report</h2>
        
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <label>Start: <input type="date" onChange={(e) => setDates({...dates, start: e.target.value})} style={{ padding: "8px" }} /></label>
          <label>End: <input type="date" onChange={(e) => setDates({...dates, end: e.target.value})} style={{ padding: "8px" }} /></label>
          
          <select onChange={(e) => setCategory(e.target.value)} style={{ padding: "9px" }}>
            <option value="all">All Records</option>
            <option value="students">Students</option>
            <option value="interns">Interns</option>
            <option value="volunteers">Volunteers</option>
          </select>

          <button onClick={generateReport} style={{ padding: "9px 20px", background: "#1e3a8a", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Generate</button>
          
          {report.length > 0 && (
            <button onClick={downloadCSV} style={{ padding: "9px 20px", background: "#16a34a", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              ⬇️ Download CSV
            </button>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", color: "#334155" }}>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>Date</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>Name</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>Status</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{r.Date}</td>
                  <td style={{ padding: "10px" }}>{r.Name}</td>
                  <td style={{ padding: "10px" }}>{r.Status}</td>
                  <td style={{ padding: "10px" }}>{r.Category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceReport;
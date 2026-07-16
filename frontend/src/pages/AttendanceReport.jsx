import { useState } from "react";
import API from "../api";
import Layout from "../components/Layout";

const AttendanceReport = () => {
  const [dates, setDates] = useState({ start: "", end: "" });
  const [category, setCategory] = useState("all"); // Naya state: category ke liye
  const [report, setReport] = useState([]);

  const generateReport = async () => {
    try {
      // Sirf select ki gayi category ka data fetch karenge
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
    const csvContent = [headers.join(","), ...report.map(r => [r.Date, r.Name, r.Status, r.Category].join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${category}_Report.csv`;
    a.click();
  };

  return (
    <Layout title="Attendance Report">
      <div style={{ padding: "20px" }}>
        <h2>📅 Attendance Report</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <input type="date" onChange={(e) => setDates({...dates, start: e.target.value})} />
          <input type="date" onChange={(e) => setDates({...dates, end: e.target.value})} />
          
          {/* Dropdown for Category Selection */}
          <select onChange={(e) => setCategory(e.target.value)} style={{ padding: "10px" }}>
            <option value="all">All Records</option>
            <option value="students">Students Only</option>
            <option value="interns">Interns Only</option>
            <option value="volunteers">Volunteers Only</option>
          </select>

          <button onClick={generateReport} style={{ padding: "10px 15px" }}>Generate</button>
          
          {report.length > 0 && (
            <button onClick={downloadCSV} style={{ padding: "10px", background: "#16a34a", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              ⬇️ Download {category.toUpperCase()} CSV
            </button>
          )}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}><th>Date</th><th>Name</th><th>Status</th><th>Category</th></tr>
          </thead>
          <tbody>
            {report.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{r.Date}</td><td>{r.Name}</td><td>{r.Status}</td><td>{r.Category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AttendanceReport;
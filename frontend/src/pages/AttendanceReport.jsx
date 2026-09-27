import { useState, useMemo } from "react";
import { Download, FileBarChart, Loader2 } from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";

const AttendanceReport = () => {
  const { showError, showSuccess, showWarning } = useToast();
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = today.toISOString().split("T")[0];

  const [dates, setDates] = useState({ start: firstDay, end: lastDay });
  const [category, setCategory] = useState("all");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const generateReport = async () => {
    if (!dates.start || !dates.end) {
      showWarning("Please select both start and end dates.");
      return;
    }

    try {
      setLoading(true);
      let data = [];

      if (category === "students" || category === "all") {
        const res = await API.get("/attendance");
        data = [...data, ...(Array.isArray(res.data) ? res.data : []).map(r => ({ ...r, type: "Student" }))];
      }
      if (category === "interns" || category === "all") {
        const res = await API.get("/intern-attendance");
        data = [...data, ...(Array.isArray(res.data) ? res.data : []).map(r => ({ ...r, type: "Intern" }))];
      }
      if (category === "volunteers" || category === "all") {
        const res = await API.get("/volunteer-attendance");
        data = [...data, ...(Array.isArray(res.data) ? res.data : []).map(r => ({ ...r, type: "Volunteer" }))];
      }

      const filtered = data.filter(r => r.date >= dates.start && r.date <= dates.end);
      
      const formatted = filtered.map(r => ({
        Date: r.date,
        Name: r.student?.name || r.intern?.name || r.volunteer?.name || "N/A",
        Identifier: r.student?.rollNumber || r.intern?.internId || r.volunteer?.contactNumber || "N/A",
        Status: r.status || "Present",
        Category: r.type,
        Hours: r.hoursWorked ? `${r.hoursWorked} hrs` : "N/A",
        Remarks: r.remarks || "—"
      }));

      // Sort by date descending
      formatted.sort((a, b) => new Date(b.Date) - new Date(a.Date));

      setReport(formatted);
      showSuccess(`Generated report with ${formatted.length} records.`);
    } catch (err) {
      console.error("Report Error", err);
      showError("Failed to generate attendance report.");
    } finally {
      setLoading(false);
    }
  };

  const filteredReport = useMemo(() => {
    return report.filter(r => 
      `${r.Name} ${r.Identifier} ${r.Category} ${r.Status}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [report, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredReport.length;
    const present = filteredReport.filter(r => r.Status === "Present" || r.Status === "Work From Home").length;
    const absent = filteredReport.filter(r => r.Status === "Absent").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, rate };
  }, [filteredReport]);

  const downloadCSV = () => {
    if (filteredReport.length === 0) return;
    const headers = ["Date", "Name", "ID / Contact", "Category", "Status", "Hours Worked", "Remarks"];
    
    const csvRows = filteredReport.map(r => 
      [r.Date, r.Name, r.Identifier, r.Category, r.Status, r.Hours, r.Remarks]
        .map(val => `"${(val || "").toString().replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${category.toUpperCase()}_Report_${dates.start}_to_${dates.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout
      title="Attendance Reports & Analytics"
      actions={
        report.length > 0 && (
          <button onClick={downloadCSV} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Download size={14} /> Export Filtered CSV
          </button>
        )
      }
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Generator Controls */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={dates.start}
                onChange={(e) => setDates({ ...dates, start: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={dates.end}
                onChange={(e) => setDates({ ...dates, end: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All (Students, Interns, Volunteers)</option>
                <option value="students">Students Only</option>
                <option value="interns">Interns Only</option>
                <option value="volunteers">Volunteers Only</option>
              </select>
            </div>
            <div>
              <button
                onClick={generateReport}
                className="btn btn-primary"
                disabled={loading}
                style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : <><FileBarChart size={15} /> Generate Report</>}
              </button>
            </div>
          </div>
        </div>

        {/* Report Stats Summary (if records exist) */}
        {report.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            <div className="card" style={{ padding: "16px", textAlign: "center", borderLeft: "4px solid var(--primary)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Records</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)" }}>{stats.total}</div>
            </div>
            <div className="card" style={{ padding: "16px", textAlign: "center", borderLeft: "4px solid #10b981" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Present / Active</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#10b981" }}>{stats.present}</div>
            </div>
            <div className="card" style={{ padding: "16px", textAlign: "center", borderLeft: "4px solid #ef4444" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Absent</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ef4444" }}>{stats.absent}</div>
            </div>
            <div className="card" style={{ padding: "16px", textAlign: "center", borderLeft: "4px solid #f59e0b" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Present Rate</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f59e0b" }}>{stats.rate}%</div>
            </div>
          </div>
        )}

        {/* Search Bar for Results */}
        {report.length > 0 && (
          <div className="card" style={{ padding: "16px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search in generated records by name, ID, category, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Results Table */}
        {report.length > 0 ? (
          <div className="card" style={{ padding: "20px" }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>ID / Contact</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Hours</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReport.map((r, i) => {
                    const isPresent = r.Status === "Present" || r.Status === "Work From Home";
                    const isAbsent = r.Status === "Absent";
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.Date}</td>
                        <td style={{ fontWeight: 600 }}>{r.Name}</td>
                        <td style={{ color: "var(--text-muted)" }}>{r.Identifier}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background:
                                r.Category === "Student"
                                  ? "rgba(99, 102, 241, 0.12)"
                                  : r.Category === "Intern"
                                  ? "rgba(168, 85, 247, 0.12)"
                                  : "rgba(16, 185, 129, 0.12)",
                              color:
                                r.Category === "Student"
                                  ? "#6366f1"
                                  : r.Category === "Intern"
                                  ? "#a855f7"
                                  : "#10b981",
                            }}
                          >
                            {r.Category}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${isPresent ? "badge-success" : isAbsent ? "badge-danger" : "badge-warning"}`}>
                            {r.Status}
                          </span>
                        </td>
                        <td>{r.Hours}</td>
                        <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.Remarks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Select a date range and click <strong>Generate Report</strong> to inspect consolidated attendance records.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AttendanceReport;
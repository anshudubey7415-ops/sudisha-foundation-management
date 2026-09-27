import { useEffect, useState, useMemo } from "react";
import { Download } from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";

function InternAttendanceHistory() {
  const { showError } = useToast();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/intern-attendance");
      const list = Array.isArray(res.data) ? res.data : [];
      const sortedRecords = list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecords(sortedRecords);
    } catch (error) {
      console.error(error);
      showError("Failed to fetch intern attendance records");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const name = record.intern?.name || "";
      const internId = record.intern?.internId || "";
      const dept = record.intern?.department || "";
      const matchesSearch = `${name} ${internId} ${dept}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "All" || record.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, selectedStatus]);

  const exportCSV = () => {
    const headers = ["Intern ID", "Name", "Department", "Date", "Status"];
    const rows = filteredRecords.map((r) => [
      `"${r.intern?.internId || "N/A"}"`,
      `"${r.intern?.name || "N/A"}"`,
      `"${r.intern?.department || "General"}"`,
      `"${r.date}"`,
      `"${r.status}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Intern_Attendance_History_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout
      title="Intern Attendance Log"
      actions={
        <button onClick={exportCSV} className="btn btn-secondary btn-sm" disabled={filteredRecords.length === 0} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Download size={14} /> Export CSV
        </button>
      }
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Filter Card */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label className="form-label">Search Intern</label>
              <input
                type="text"
                placeholder="Search by name, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Status Filter</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-control"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present Only</option>
                <option value="Work From Home">Work From Home Only</option>
                <option value="Absent">Absent Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="card" style={{ padding: "20px" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading attendance records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              No intern attendance records found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Intern ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => {
                    const isPresent = record.status === "Present";
                    const isWFH = record.status === "Work From Home";
                    const isAbsent = record.status === "Absent";

                    return (
                      <tr key={record._id}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{record.date}</td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          {record.intern?.internId || "—"}
                        </td>
                        <td style={{ fontWeight: 600 }}>{record.intern?.name || "Unknown"}</td>
                        <td>
                          <span
                            className="badge"
                            style={{ background: "rgba(168, 85, 247, 0.12)", color: "#a855f7" }}
                          >
                            {record.intern?.department || "General"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isPresent ? "badge-success" : isWFH ? "badge-primary" : "badge-danger"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default InternAttendanceHistory;
import { useEffect, useState, useCallback, useMemo } from "react";
import { Download } from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";

function AttendanceHistory() {
  const { showError } = useToast();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance");
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      showError("Failed to fetch attendance history");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Group by student
  const groupedData = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      const studentName = record.student?.name || "Unknown Student";
      const studentId = record.student?._id || "unknown";
      const rollNumber = record.student?.rollNumber || "N/A";
      const studentClass = record.student?.class || "N/A";

      if (!map[studentName]) {
        map[studentName] = {
          studentId,
          name: studentName,
          rollNumber,
          studentClass,
          records: [],
        };
      }
      map[studentName].records.push(record);
    });

    return Object.values(map)
      .map((student) => {
        const total = student.records.length;
        const present = student.records.filter((r) => r.status === "Present").length;
        const absent = student.records.filter((r) => r.status === "Absent").length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        return {
          ...student,
          total,
          present,
          absent,
          percentage,
        };
      })
      .filter((student) => {
        const matchesSearch = `${student.name} ${student.rollNumber} ${student.studentClass}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [records, searchTerm]);

  const exportCSV = () => {
    const headers = ["Student Name", "Roll Number", "Class", "Date", "Status"];
    const rows = [];
    groupedData.forEach((student) => {
      student.records.forEach((r) => {
        rows.push([
          `"${student.name}"`,
          `"${student.rollNumber}"`,
          `"${student.studentClass}"`,
          `"${r.date}"`,
          `"${r.status}"`,
        ]);
      });
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Students_Attendance_History_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout
      title="Student Attendance Records"
      actions={
        <button onClick={exportCSV} className="btn btn-secondary btn-sm" disabled={records.length === 0} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Download size={14} /> Export CSV
        </button>
      }
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Filter Card */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label className="form-label">Search Student</label>
              <input
                type="text"
                placeholder="Search by name, roll, class..."
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
                <option value="Absent">Absent Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* List of Students with History Cards */}
        {loading ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading attendance records...
          </div>
        ) : groupedData.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No attendance records found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {groupedData.map((student) => {
              const filteredStudentRecords = student.records.filter((r) => {
                if (selectedStatus === "All") return true;
                return r.status === selectedStatus;
              });

              return (
                <div key={student.studentId + student.name} className="card" style={{ padding: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", color: "var(--text-primary)" }}>
                        {student.name}
                      </h3>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", gap: "12px" }}>
                        <span>Roll: {student.rollNumber}</span>
                        <span>•</span>
                        <span>Class: {student.studentClass}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span className="badge badge-success">{student.present} Present</span>
                      <span className="badge badge-danger">{student.absent} Absent</span>
                      <span className="badge badge-primary">{student.percentage}% Rate</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: "6px",
                      borderRadius: "999px",
                      background: "rgba(239, 68, 68, 0.2)",
                      overflow: "hidden",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${student.percentage}%`,
                        background:
                          student.percentage >= 75
                            ? "linear-gradient(90deg, #10b981, #059669)"
                            : student.percentage >= 50
                            ? "linear-gradient(90deg, #f59e0b, #d97706)"
                            : "linear-gradient(90deg, #ef4444, #dc2626)",
                        borderRadius: "999px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>

                  {/* Table of session dates */}
                  {filteredStudentRecords.length > 0 ? (
                    <div className="table-responsive" style={{ maxHeight: "220px", overflowY: "auto" }}>
                      <table className="table" style={{ margin: 0, fontSize: "0.88rem" }}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudentRecords
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((record) => (
                              <tr key={record._id}>
                                <td>{record.date}</td>
                                <td>
                                  <span
                                    className={`badge ${
                                      record.status === "Present" ? "badge-success" : "badge-danger"
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No matching records for selected status.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AttendanceHistory;
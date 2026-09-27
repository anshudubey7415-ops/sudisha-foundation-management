import { useEffect, useState, useMemo, useContext } from "react";
import { CalendarDays, Edit2, Check, X, Loader2, Send } from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";

function DateWiseAttendance() {
  const { showSuccess, showError } = useToast();
  const { user } = useContext(AuthContext);
  const userRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  const isManager = userRole === "manager";

  const [groupedRecords, setGroupedRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [editingDate, setEditingDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance");
      const list = Array.isArray(res.data) ? res.data : [];
      const grouped = {};
      list.forEach((record) => {
        const date = record.date;
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(record);
      });
      setGroupedRecords(grouped);
    } catch (err) {
      console.error(err);
      showError("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (date, recordIndex) => {
    setGroupedRecords((prev) => {
      const copy = { ...prev };
      const list = [...copy[date]];
      const current = list[recordIndex].status;
      list[recordIndex] = {
        ...list[recordIndex],
        status: current === "Present" ? "Absent" : "Present",
      };
      copy[date] = list;
      return copy;
    });
  };

  const saveChanges = async (date) => {
    try {
      setSaving(true);
      const records = (groupedRecords[date] || []).map((r) => ({
        student: r.student?._id || r.student,
        status: r.status,
        date: date,
      }));

      const res = await API.post("/attendance/bulk", { records, date });
      if (res.data?.pendingApproval) {
        showSuccess(`Attendance edit request for ${date} submitted to Admin for approval!`);
      } else {
        showSuccess(`Attendance for ${date} updated successfully!`);
      }
      setEditingDate(null);
    } catch (err) {
      console.error(err);
      showError("Failed to update attendance records");
    } finally {
      setSaving(false);
    }
  };

  const dates = useMemo(() => {
    return Object.keys(groupedRecords)
      .filter((date) => selectedDate === "" || date === selectedDate)
      .sort()
      .reverse();
  }, [groupedRecords, selectedDate]);

  return (
    <Layout title="Daily Attendance Logs">
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Controls */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 240px" }}>
              <label className="form-label">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-control"
              />
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="btn btn-secondary"
              >
                Clear Date Filter
              </button>
            )}
          </div>
        </div>

        {/* Date Blocks */}
        {loading ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading records...
          </div>
        ) : dates.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No attendance records found.
          </div>
        ) : (
          dates.map((date) => {
            const list = groupedRecords[date] || [];
            const isEditing = editingDate === date;
            const presentCount = list.filter((r) => r.status === "Present").length;
            const absentCount = list.filter((r) => r.status === "Absent").length;

            return (
              <div key={date} className="card" style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        padding: "6px 12px",
                        background: "var(--primary-light)",
                        borderRadius: "8px",
                        color: "var(--primary)",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <CalendarDays size={16} /> {date}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span className="badge badge-success">{presentCount} Present</span>
                      <span className="badge badge-danger">{absentCount} Absent</span>
                    </div>
                  </div>

                  <div>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setEditingDate(null)}
                          className="btn btn-secondary btn-sm"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveChanges(date)}
                          className="btn btn-primary btn-sm"
                          disabled={saving}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          {saving ? (
                            <>
                              <Loader2 size={14} className="animate-spin" /> Saving...
                            </>
                          ) : isManager ? (
                            <>
                              <Send size={14} /> Submit Changes to Admin
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingDate(date)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        <Edit2 size={14} /> Edit Records
                      </button>
                    )}
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Roll Number</th>
                        <th>Class</th>
                        <th style={{ textAlign: "right" }}>Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((record, index) => {
                        const isPresent = record.status === "Present";
                        return (
                          <tr key={record._id || index}>
                            <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                              {record.student?.name || "N/A"}
                            </td>
                            <td>{record.student?.rollNumber || "N/A"}</td>
                            <td>{record.student?.class ? `Class ${record.student.class}` : "N/A"}</td>
                            <td style={{ textAlign: "right" }}>
                              {isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => toggleStatus(date, index)}
                                  className={`btn btn-sm ${isPresent ? "btn-success" : "btn-danger"}`}
                                  style={{ minWidth: "90px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                                >
                                  {isPresent ? <><Check size={13} /> Present</> : <><X size={13} /> Absent</>}
                                </button>
                              ) : (
                                <span className={`badge ${isPresent ? "badge-success" : "badge-danger"}`}>
                                  {record.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}

export default DateWiseAttendance;
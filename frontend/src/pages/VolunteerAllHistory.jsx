import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, CalendarCheck, Loader2, Calendar } from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function VolunteerAllHistory() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    const fetchDateRecords = async () => {
      if (!selectedDate) return;
      setLoading(true);
      try {
        const res = await API.get(`/volunteers/attendance/date/${selectedDate}`);
        setAttendanceData(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching date-wise attendance:", error);
        showError("Failed to fetch records for selected date");
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDateRecords();
  }, [selectedDate, showError]);

  const presentCount = attendanceData.filter((r) => r.status === "Present").length;
  const totalHours = attendanceData.reduce((sum, r) => sum + (r.hours || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/volunteers" className="btn btn-secondary btn-icon" title="Back to Volunteers">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarDays size={24} style={{ color: "var(--primary)" }} /> Volunteer Date-Wise Attendance Log
              </h1>
              <p>View daily attendance and service hours across all volunteers</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <Link to="/volunteer/bulk-attendance" className="btn btn-success btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CalendarCheck size={14} /> Mark Bulk Attendance
          </Link>
        </div>
      </div>

      {/* Date Picker & Counter Card */}
      <div className="card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label className="form-label" style={{ margin: 0 }}>Select Date:</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: "auto" }}
            />
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>LOGGED ENTRIES</span>
              <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--primary)" }}>{attendanceData.length}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>PRESENT</span>
              <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--success)" }}>{presentCount}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>TOTAL SERVICE HOURS</span>
              <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#d97706" }}>{totalHours} hrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      {loading ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
          <h3>Loading Date Records...</h3>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Calendar size={40} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
          <h3>No Attendance Records Found</h3>
          <p style={{ marginTop: "4px" }}>No volunteers have logged attendance for <strong>{selectedDate}</strong>.</p>
          <Link to="/volunteer/bulk-attendance" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CalendarCheck size={14} /> Mark Attendance for this Date
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Volunteer ID</th>
                <th>Volunteer Name</th>
                <th>Status</th>
                <th>Hours Contributed</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr key={record._id}>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
                      {record.volunteerId || "N/A"}
                    </span>
                  </td>
                  <td>
                    <strong>{record.name}</strong>
                  </td>
                  <td>
                    <span className={`badge badge-${record.status?.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "#d97706" }}>
                      {record.hours || 0} hrs
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VolunteerAllHistory;
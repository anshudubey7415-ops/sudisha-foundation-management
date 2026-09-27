import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function VolunteerAttendanceHistory() {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [volRes, attRes] = await Promise.all([
          API.get(`/volunteers/${id}`).catch(() => null),
          API.get(`/volunteer-attendance/volunteer/${id}`).catch(() => ({ data: [] })),
        ]);

        if (volRes) setVolunteer(volRes.data);
        setRecords(Array.isArray(attRes.data) ? attRes.data : []);
      } catch (err) {
        console.error(err);
        showError("Failed to load attendance records");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showError]);

  const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  const presentCount = records.filter((r) => r.status === "Present").length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to={`/volunteer/${id}`} className="btn btn-secondary btn-icon" title="Back to Profile">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart3 size={24} style={{ color: "var(--primary)" }} /> Attendance Log: {volunteer?.name || "Volunteer"}
              </h1>
              <p>ID: {volunteer?.volunteerId} &bull; Total Entries: {records.length}</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <Link to={`/volunteer-attendance/${id}`} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Plus size={14} /> Log New Hours
          </Link>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card" style={{ "--card-accent": "#2563eb" }}>
          <div className="stat-top">
            <span className="stat-label">Total Logged Sessions</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#eff6ff", "--stat-icon-color": "#2563eb" }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value">{records.length}</div>
        </div>

        <div className="stat-card" style={{ "--card-accent": "#10b981" }}>
          <div className="stat-top">
            <span className="stat-label">Present Sessions</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#ecfdf5", "--stat-icon-color": "#10b981" }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "#10b981" }}>{presentCount}</div>
        </div>

        <div className="stat-card" style={{ "--card-accent": "#f59e0b" }}>
          <div className="stat-top">
            <span className="stat-label">Total Hours Contributed</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#fffbeb", "--stat-icon-color": "#f59e0b" }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "#d97706" }}>{totalHours} hrs</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
          <h3>Loading Attendance Log...</h3>
        </div>
      ) : records.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p>No attendance records found for this volunteer.</p>
          <Link to={`/volunteer-attendance/${id}`} className="btn btn-primary" style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Plus size={14} /> Log First Session
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td><strong>{r.date}</strong></td>
                  <td>
                    <span className={`badge badge-${r.status?.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{r.checkIn || "—"}</td>
                  <td>{r.checkOut || "—"}</td>
                  <td><strong>{r.hoursWorked || 0} hrs</strong></td>
                  <td>{r.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VolunteerAttendanceHistory;
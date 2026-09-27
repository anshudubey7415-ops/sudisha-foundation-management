import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function VolunteerAttendanceBulk() {
  const [volunteers, setVolunteers] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        const res = await API.get("/volunteers");
        const list = Array.isArray(res.data) ? res.data : [];
        setVolunteers(list);

        // Prepopulate all as Present
        const initial = {};
        list.forEach((v) => {
          initial[v._id] = "Present";
        });
        setAttendance(initial);
      } catch (err) {
        console.error(err);
        showError("Failed to fetch volunteers");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, [showError]);

  const setAllStatus = (status) => {
    const updated = {};
    volunteers.forEach((v) => {
      updated[v._id] = status;
    });
    setAttendance(updated);
    showSuccess(`Marked all volunteers as ${status}!`);
  };

  const handleToggle = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    const records = Object.keys(attendance).map((id) => ({
      volunteer: id,
      date,
      status: attendance[id],
    }));

    try {
      await API.post("/volunteer-attendance/bulk", { records });
      showSuccess(`Saved attendance records for ${records.length} volunteers!`);
    } catch (err) {
      console.error(err);
      showError("Error saving attendance: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const filtered = volunteers.filter((v) =>
    `${v.volunteerId || ""} ${v.name || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = Object.values(attendance).filter((s) => s === "Present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "Absent").length;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/volunteers" className="btn btn-secondary btn-icon" title="Back to Volunteers">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarCheck size={24} style={{ color: "var(--primary)" }} /> Volunteer Bulk Attendance
              </h1>
              <p>Quickly mark daily presence for all community volunteers</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <Link to="/volunteer-date-attendance" className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={14} /> View Date Records
          </Link>
        </div>
      </div>

      {/* Control Strip */}
      <div className="card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label className="form-label" style={{ margin: 0 }}>Attendance Date:</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "auto" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={() => setAllStatus("Present")} className="btn btn-success btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={14} /> Mark All Present
            </button>
            <button type="button" onClick={() => setAllStatus("Absent")} className="btn btn-danger btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <XCircle size={14} /> Mark All Absent
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div style={{ display: "flex", gap: "16px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>
            Total: <span style={{ color: "var(--primary)" }}>{volunteers.length}</span>
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>
            Present: <span style={{ color: "var(--success)" }}>{presentCount}</span>
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>
            Absent: <span style={{ color: "var(--danger)" }}>{absentCount}</span>
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "16px" }}>
        <div className="search-input-wrapper" style={{ maxWidth: "100%" }}>
          <span className="search-icon" style={{ display: "flex", alignItems: "center" }}><Search size={16} /></span>
          <input
            type="text"
            className="form-input"
            placeholder="Search volunteers by ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Volunteer Attendance Cards */}
      {loading ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
          <h3>Loading Volunteers...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p>No volunteers found matching your search.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {filtered.map((volunteer) => {
            const currentStatus = attendance[volunteer._id] || "Present";
            const isPresent = currentStatus === "Present";

            return (
              <div
                key={volunteer._id}
                className="card"
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: `4px solid ${isPresent ? "var(--success)" : "var(--danger)"}`
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>{volunteer.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    ID: {volunteer.volunteerId} &bull; Badge: {volunteer.badge || "Beginner"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleToggle(volunteer._id, "Present")}
                    className={`btn btn-sm ${isPresent ? "btn-success" : "btn-outline"}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Check size={14} /> Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(volunteer._id, "Absent")}
                    className={`btn btn-sm ${!isPresent ? "btn-danger" : "btn-outline"}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <X size={14} /> Absent
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || volunteers.length === 0}
        className="btn btn-primary btn-lg"
        style={{ width: "100%", marginBottom: "40px", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
      >
        {saving ? (
          <>
            <Loader2 size={18} className="spin" /> Saving Attendance...
          </>
        ) : (
          <>
            <CheckCircle2 size={18} /> Save Attendance for {volunteers.length} Volunteers
          </>
        )}
      </button>
    </div>
  );
}

export default VolunteerAttendanceBulk;
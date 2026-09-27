import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, Loader2, Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function VolunteerAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "Present",
    checkIn: "09:00",
    checkOut: "17:00",
    remarks: "Regular volunteer activity session",
  });

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/volunteers/${id}`);
        setVolunteer(res.data);
      } catch (err) {
        console.error(err);
        showError("Failed to fetch volunteer data");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [id, showError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/volunteer-attendance/mark", {
        volunteer: id,
        ...formData,
      });
      showSuccess(`Attendance logged for ${volunteer?.name || 'Volunteer'}!`);
      navigate(`/volunteer/${id}`);
    } catch (err) {
      console.error(err);
      showError("Failed to log attendance: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
        <h3>Loading Volunteer...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to={`/volunteer/${id}`} className="btn btn-secondary btn-icon" title="Back to Profile">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={24} style={{ color: "var(--primary)" }} /> Log Volunteer Hours: {volunteer?.name}
              </h1>
              <p>ID: {volunteer?.volunteerId} &bull; Total Hours: {volunteer?.totalHours || 0} hrs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Activity Date *</label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Attendance Status *</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange} required>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Work From Home">Work From Home</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Check-In Time</label>
              <input
                type="time"
                name="checkIn"
                className="form-input"
                value={formData.checkIn}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Check-Out Time</label>
              <input
                type="time"
                name="checkOut"
                className="form-input"
                value={formData.checkOut}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Remarks / Contribution Summary</label>
            <textarea
              name="remarks"
              className="form-textarea"
              placeholder="e.g. Conducted mathematics session for Class 4, coordinated event logistics..."
              rows="3"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {saving ? (
                <>
                  <Loader2 size={18} className="spin" /> Logging Session...
                </>
              ) : (
                <>
                  <Check size={18} /> Record Volunteering Hours
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VolunteerAttendance;
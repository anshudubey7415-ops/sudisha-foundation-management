import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  HeartHandshake,
  CreditCard,
  Clock,
  Edit2,
  Upload,
  Loader2,
  Award,
  FileSpreadsheet,
  CalendarDays,
  Plus,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import API, { getUploadUrl } from "../api";

function VolunteerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [volunteer, setVolunteer] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVolunteer = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/volunteers/${id}`);
      setVolunteer(res.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load volunteer profile");
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await API.get(`/volunteer-attendance/volunteer/${id}`);
      setAttendance(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchVolunteer();
    fetchAttendance();
  }, [fetchVolunteer, fetchAttendance]);

  const uploadPhoto = async () => {
    if (!photo) {
      showError("Please select a photo file");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("photo", photo);

      await API.post(`/volunteers/upload/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Volunteer photo uploaded successfully!");
      setPhoto(null);
      fetchVolunteer();
    } catch (error) {
      console.error(error);
      showError("Failed to upload photo: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
        <h3>Loading Volunteer Profile...</h3>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Volunteer Not Found</h2>
        <Link to="/volunteers" className="btn btn-primary" style={{ marginTop: "16px" }}>
          Return to Volunteer Directory
        </Link>
      </div>
    );
  }

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
                <HeartHandshake size={24} style={{ color: "var(--primary)" }} /> Volunteer Profile: {volunteer.name}
              </h1>
              <p>ID: {volunteer.volunteerId} &bull; Badge: {volunteer.badge || "Beginner"}</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <Link to={`/volunteer-id/${volunteer._id}`} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CreditCard size={14} /> ID Card
          </Link>
          <Link to={`/volunteer-attendance/${volunteer._id}`} className="btn btn-warning btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Clock size={14} /> Log Hours
          </Link>
          <Link to={`/edit-volunteer/${volunteer._id}`} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Edit2 size={14} /> Edit
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        {/* Profile Card */}
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 16px" }}>
            {volunteer.photo ? (
              <img
                src={getUploadUrl(volunteer.photo)}
                alt={volunteer.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "var(--radius-full)",
                  objectFit: "cover",
                  border: "4px solid #f59e0b",
                  boxShadow: "var(--shadow-md)"
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  fontWeight: 800,
                  border: "4px solid var(--border-color)"
                }}
              >
                {volunteer.name?.charAt(0) || "V"}
              </div>
            )}
          </div>

          <h2 style={{ margin: "0 0 6px 0" }}>{volunteer.name}</h2>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
            <span className="badge badge-role-volunteer" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Award size={13} /> {volunteer.badge || "Beginner"}
            </span>
            <span className={`badge ${volunteer.status === "Active" ? "badge-active" : "badge-inactive"}`}>
              {volunteer.status || "Active"}
            </span>
          </div>

          <div style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "8px", textAlign: "left" }}>
              Upload Volunteer Photo
            </label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              style={{ marginBottom: "10px", padding: "6px" }}
              onChange={(e) => setPhoto(e.target.files[0])}
            />
            <button
              onClick={uploadPhoto}
              disabled={uploading || !photo}
              className="btn btn-primary btn-sm"
              style={{ width: "100%", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} /> Upload Photo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FileSpreadsheet size={18} style={{ color: "var(--primary)" }} /> Volunteer Overview
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>PHONE</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{volunteer.phone || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>EMAIL</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{volunteer.email || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>EDUCATION</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{volunteer.education || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>JOINING DATE</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{volunteer.joiningDate ? volunteer.joiningDate.split("T")[0] : "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>GENDER</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{volunteer.gender || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>TOTAL HOURS</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--primary)" }}>{volunteer.totalHours || 0} hrs</div>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>ADDRESS</div>
            <div style={{ fontWeight: 500, fontSize: "0.9375rem", marginTop: "2px" }}>{volunteer.address || "No address provided"}</div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={18} style={{ color: "var(--primary)" }} /> Volunteering Sessions Log ({attendance.length} Records)
          </h3>
          <Link to={`/volunteer-attendance/${volunteer._id}`} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Plus size={14} /> Log New Session
          </Link>
        </div>

        {attendance.length === 0 ? (
          <p style={{ margin: 0, textAlign: "center", padding: "20px" }}>No volunteering sessions recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours Worked</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td><strong>{record.date}</strong></td>
                    <td>
                      <span className={`badge badge-${record.status?.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.checkIn || "—"}</td>
                    <td>{record.checkOut || "—"}</td>
                    <td><strong>{record.hoursWorked || 0} hrs</strong></td>
                    <td>{record.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default VolunteerProfile;
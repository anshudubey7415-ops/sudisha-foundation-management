import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  CreditCard,
  Edit2,
  Upload,
  FileText,
  Activity,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  CalendarCheck,
  Loader2
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import API, { getUploadUrl } from "../api";

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/students/${id}`);
      setStudent(res.data);
    } catch (error) {
      console.error("Error fetching student:", error);
      showError("Error loading student profile");
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await API.get("/attendance");
      const studentRecords = (res.data || []).filter(
        (record) => record.student?._id === id || record.student === id
      );
      studentRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendance(studentRecords);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
    fetchAttendance();
  }, [fetchStudent, fetchAttendance]);

  const uploadPhoto = async () => {
    if (!photo) {
      showError("Please choose a photo file to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("photo", photo);

      await API.post(`/students/upload/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Photo uploaded successfully!");
      setPhoto(null);
      fetchStudent();
    } catch (error) {
      console.error(error);
      showError("Failed to upload photo: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "12px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "50%", marginBottom: "12px" }}>
          <Loader2 size={24} className="animate-spin" />
        </div>
        <h3>Loading Student Profile...</h3>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Student Not Found</h2>
        <Link to="/students" className="btn btn-primary" style={{ marginTop: "16px" }}>
          Return to Student Directory
        </Link>
      </div>
    );
  }

  const rate = parseFloat(student.attendancePercentage || 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/students" className="btn btn-secondary btn-icon" title="Back to Students">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <User size={22} color="var(--primary)" /> Student Profile: {student.name}
              </h1>
              <p>Roll No: {student.rollNumber} &bull; Class: {student.class}</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <Link to={`/student/id-card/${student._id}`} className="btn btn-secondary btn-sm">
            <CreditCard size={14} /> ID Card
          </Link>
          <Link to={`/edit-student/${student._id}`} className="btn btn-primary btn-sm">
            <Edit2 size={14} /> Edit Student
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        {/* Profile Card & Photo Upload */}
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 16px" }}>
            {student.photo ? (
              <img
                src={getUploadUrl(student.photo)}
                alt={student.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "var(--radius-full)",
                  objectFit: "cover",
                  border: "4px solid var(--primary)",
                  boxShadow: "var(--shadow-md)"
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "var(--radius-full)",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  fontWeight: 800,
                  border: "4px solid var(--border-color)"
                }}
              >
                {student.name?.charAt(0) || "S"}
              </div>
            )}
          </div>

          <h2 style={{ margin: "0 0 4px 0" }}>{student.name}</h2>
          <span className="badge badge-role-student" style={{ marginBottom: "16px" }}>
            Roll No: {student.rollNumber}
          </span>

          <div style={{ marginTop: "16px", padding: "16px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "8px", textAlign: "left" }}>
              Update Student Photo
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
              style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} /> Upload New Photo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Details Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} /> Student Information
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>CLASS</div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{student.class}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>ADMISSION DATE</div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{student.admissionDate || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>AGE / GENDER</div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{student.age ? `${student.age} yrs` : "—"} / {student.gender || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>PHONE</div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{student.phone || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>FATHER'S NAME</div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{student.fatherName || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>MOTHER'S NAME</div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{student.motherName || "—"}</div>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>RESIDENTIAL ADDRESS</div>
            <div style={{ fontWeight: 500, fontSize: "0.9375rem", marginTop: "2px" }}>{student.address || "No address provided"}</div>
          </div>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <h3 style={{ marginBottom: "16px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <Activity size={18} color="var(--primary)" /> Attendance Analytics
      </h3>
      <div className="stats-grid" style={{ marginBottom: "28px" }}>
        <div className="stat-card" style={{ "--card-accent": "#2563eb" }}>
          <div className="stat-top">
            <span className="stat-label">Total Days Tracked</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#eff6ff", "--stat-icon-color": "#2563eb" }}>
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="stat-value">{student.totalAttendanceDays || attendance.length}</div>
        </div>

        <div className="stat-card" style={{ "--card-accent": "#10b981" }}>
          <div className="stat-top">
            <span className="stat-label">Present Days</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#ecfdf5", "--stat-icon-color": "#10b981" }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "#10b981" }}>{student.presentDays || attendance.filter(r => r.status === 'Present').length}</div>
        </div>

        <div className="stat-card" style={{ "--card-accent": rate >= 75 ? "#10b981" : "#f59e0b" }}>
          <div className="stat-top">
            <span className="stat-label">Attendance Rate</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#fffbeb", "--stat-icon-color": "#f59e0b" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value">{rate}%</div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <CalendarCheck size={18} /> Detailed Attendance History ({attendance.length} Records)
          </h3>
        </div>

        {attendance.length === 0 ? (
          <p style={{ margin: 0, textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No attendance records found for this student.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Attendance Status</th>
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

export default StudentProfile;
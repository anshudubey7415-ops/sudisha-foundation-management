import { useEffect, useState, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  FolderKanban,
  FileText,
  CreditCard,
  Award,
  Bell,
  Mail,
  Phone,
  GraduationCap,
  TrendingUp,
  Clock,
  Shield,
  Loader2,
  AlertCircle,
  ExternalLink,
  Info,
  Lock
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API, { getUploadUrl } from "../api";

function InternPortal() {
  const { user } = useContext(AuthContext);
  const { showError } = useToast();

  const [intern, setIntern] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [projects, setProjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchPortalData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fetch personal intern profile
      const profileRes = await API.get("/interns/my/profile");
      const internData = profileRes.data;
      setIntern(internData);

      // 2. Fetch attendance log for this intern
      try {
        const attRes = await API.get("/intern-attendance/my/attendance");
        setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
      } catch (attErr) {
        console.warn("Could not fetch attendance log:", attErr);
      }

      // 3. Fetch assigned projects
      try {
        const projRes = await API.get("/projects/my/projects");
        setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      } catch (projErr) {
        console.warn("Could not fetch projects:", projErr);
      }

      // 4. Fetch announcements
      try {
        const annRes = await API.get("/announcements");
        setAnnouncements(Array.isArray(annRes.data) ? annRes.data.slice(0, 5) : []);
      } catch (annErr) {
        console.warn("Could not fetch announcements:", annErr);
      }

    } catch (err) {
      console.error("Portal Data Fetch Error:", err);
      const msg = err.response?.data?.message || "Unable to load intern portal data";
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <Loader2 size={36} className="spin" style={{ color: "var(--primary)" }} />
        <h3 style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>Loading Intern Portal...</h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>Fetching your personal records and attendance details</p>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="card" style={{ maxWidth: "600px", margin: "40px auto", padding: "36px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "16px", background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", borderRadius: "50%", marginBottom: "16px" }}>
          <AlertCircle size={40} />
        </div>
        <h2 style={{ margin: "0 0 8px 0" }}>Intern Profile Not Linked</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "20px" }}>
          We could not find an intern profile registered under your account email (<strong>{user?.email}</strong>).
          Please contact the Sudisha Foundation Admin to verify your profile email.
        </p>
        <button onClick={fetchPortalData} className="btn btn-secondary">
          Retry Loading
        </button>
      </div>
    );
  }

  const today = new Date();
  const isCompleted = intern.endDate ? today > new Date(intern.endDate) : intern.status === "Completed";
  const rate = parseFloat(intern.attendancePercentage || 0);
  const presentDays = intern.presentDays || attendance.filter(r => r.status === 'Present').length;
  const totalDays = intern.totalAttendanceDays || attendance.length;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <Briefcase size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800 }}>
                Intern Portal: Welcome, {intern.name}!
              </h1>
              <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Intern ID: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{intern.internId}</strong> &bull; {intern.department}
              </p>
            </div>
          </div>
        </div>

        {/* Read-Only Badge */}
        <div className="page-actions">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "9999px",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            <Shield size={14} /> Read-Only Access
          </span>
        </div>
      </div>

      {/* Profile Overview & Quick Docs Card */}
      <div
        className="card"
        style={{
          padding: "24px",
          marginBottom: "24px",
          background: "linear-gradient(to right, var(--bg-card), var(--bg-surface))",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
          {/* Photo */}
          <div style={{ position: "relative", width: "110px", height: "110px", flexShrink: 0 }}>
            {intern.photo ? (
              <img
                src={getUploadUrl(intern.photo)}
                alt={intern.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--primary)",
                  boxShadow: "var(--shadow-md)"
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "rgba(99, 102, 241, 0.12)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.4rem",
                  fontWeight: 800,
                  border: "3px solid var(--border-color)"
                }}
              >
                {intern.name?.charAt(0) || "I"}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div style={{ flex: "1 1 300px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {intern.name}
              </h2>
              <span className="badge badge-role-intern">{intern.department}</span>
              <span className={`badge ${isCompleted ? "badge-completed-chip" : "badge-active"}`}>
                {isCompleted ? "Completed" : "Active"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px", marginTop: "10px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>{intern.email || "No email"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>{intern.phone || "No phone"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <GraduationCap size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>{intern.college || "University"} {intern.course ? `(${intern.course})` : ""}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>{intern.startDate} to {intern.endDate}</span>
              </div>
            </div>
          </div>

          {/* Document Access Buttons (Admin Controlled) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "205px", flexShrink: 0 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              My Official Documents
            </span>

            {/* 1. ID Card Button */}
            {intern.allowIdCard ? (
              <Link
                to={`/intern-id/${intern._id}`}
                className="btn btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CreditCard size={14} /> ID Card
                </span>
                <ExternalLink size={12} />
              </Link>
            ) : (
              <div
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: 0.55,
                  cursor: "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  background: "var(--bg-surface)",
                  borderStyle: "dashed"
                }}
                title="ID Card viewing is not approved yet by administrator"
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CreditCard size={14} /> ID Card
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  <Lock size={11} /> Locked
                </span>
              </div>
            )}

            {/* 2. Offer Letter Button */}
            {intern.allowOfferLetter ? (
              <Link
                to={`/offer-letter/${intern._id}`}
                className="btn btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={14} /> Offer Letter
                </span>
                <ExternalLink size={12} />
              </Link>
            ) : (
              <div
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: 0.55,
                  cursor: "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  background: "var(--bg-surface)",
                  borderStyle: "dashed"
                }}
                title="Offer Letter viewing is not approved yet by administrator"
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={14} /> Offer Letter
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  <Lock size={11} /> Locked
                </span>
              </div>
            )}

            {/* 3. Certificate Button */}
            {intern.allowCertificate ? (
              <Link
                to={`/intern-certificate/${intern._id}`}
                className="btn btn-primary btn-sm"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Award size={14} /> Certificate
                </span>
                <ExternalLink size={12} />
              </Link>
            ) : (
              <div
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: 0.55,
                  cursor: "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  background: "var(--bg-surface)",
                  borderStyle: "dashed"
                }}
                title="Certificate viewing is not approved yet by administrator"
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Award size={14} /> Certificate
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  <Lock size={11} /> Locked
                </span>
              </div>
            )}

            {(!intern.allowIdCard || !intern.allowOfferLetter || !intern.allowCertificate) && (
              <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "2px", textAlign: "center" }}>
                🔒 Documents unlock upon Admin approval
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card" style={{ "--card-accent": "var(--primary)" }}>
          <div className="stat-top">
            <span className="stat-label">Total Days Tracked</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "rgba(99, 102, 241, 0.1)", "--stat-icon-color": "var(--primary)" }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value">{totalDays}</div>
        </div>

        <div className="stat-card" style={{ "--card-accent": "#10b981" }}>
          <div className="stat-top">
            <span className="stat-label">Days Present</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#ecfdf5", "--stat-icon-color": "#10b981" }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "#10b981" }}>{presentDays}</div>
        </div>

        <div className="stat-card" style={{ "--card-accent": rate >= 75 ? "#10b981" : "#f59e0b" }}>
          <div className="stat-top">
            <span className="stat-label">Attendance Rate</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#fffbeb", "--stat-icon-color": "#f59e0b" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: rate >= 75 ? "#10b981" : "#f59e0b" }}>
            {rate}%
          </div>
        </div>

        <div className="stat-card" style={{ "--card-accent": "#8b5cf6" }}>
          <div className="stat-top">
            <span className="stat-label">Assigned Projects</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "rgba(139, 92, 246, 0.1)", "--stat-icon-color": "#8b5cf6" }}>
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="stat-value">{projects.length}</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("overview")}
          className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", borderBottom: "none" }}
        >
          <Info size={15} /> Overview & Profile
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`btn ${activeTab === "attendance" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", borderBottom: "none" }}
        >
          <Calendar size={15} /> Attendance History ({attendance.length})
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`btn ${activeTab === "projects" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", borderBottom: "none" }}
        >
          <FolderKanban size={15} /> Assigned Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`btn ${activeTab === "announcements" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", borderBottom: "none" }}
        >
          <Bell size={15} /> Announcements ({announcements.length})
        </button>
      </div>

      {/* Tab 1: Overview & Profile */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Detailed Info Card */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} style={{ color: "var(--primary)" }} /> Internship Specifications
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>INTERN ID</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{intern.internId}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>DEPARTMENT</span>
                <span style={{ fontWeight: 600 }}>{intern.department}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>ASSIGNED MENTOR</span>
                <span style={{ fontWeight: 600 }}>{intern.mentor || "Sudisha Admin"}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>PROGRAM STATUS</span>
                <span className={`badge ${isCompleted ? "badge-completed-chip" : "badge-active"}`}>
                  {isCompleted ? "Completed" : "Active"}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>START DATE</span>
                <span style={{ fontWeight: 600 }}>{intern.startDate || "—"}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>END DATE</span>
                <span style={{ fontWeight: 600 }}>{intern.endDate || "—"}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>COLLEGE / UNIVERSITY</span>
                <span style={{ fontWeight: 600 }}>{intern.college || "—"}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>DEGREE / COURSE</span>
                <span style={{ fontWeight: 600 }}>{intern.course || "—"}</span>
              </div>
            </div>

            <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>CERTIFICATE SERIAL NO</span>
              <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--primary)", fontSize: "1rem" }}>
                {intern.certificateNumber || "SF-CERT-PENDING"}
              </span>
            </div>
          </div>

          {/* Notice / Policy Card */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={18} style={{ color: "var(--primary)" }} /> Portal Guidelines & Security
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <div style={{ padding: "12px 14px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--primary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>🔒 View-Only Permissions:</strong> You can review your verified personal data, attendance logs, and download official documents at any time. Modifications can only be performed by Foundation administrators.
              </div>

              <div style={{ padding: "12px 14px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid #10b981" }}>
                <strong style={{ color: "var(--text-primary)" }}>📈 Attendance Requirement:</strong> Regular attendance is logged daily by coordinators. A minimum 75% attendance record is recommended for certificate issuance.
              </div>

              <div style={{ padding: "12px 14px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid #f59e0b" }}>
                <strong style={{ color: "var(--text-primary)" }}>🔑 Account Settings:</strong> You can update your password or switch themes anytime from <Link to="/settings" style={{ color: "var(--primary)", fontWeight: 700 }}>Settings</Link>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance History */}
      {activeTab === "attendance" && (
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} style={{ color: "var(--primary)" }} /> Daily Attendance Log ({attendance.length} Total Records)
            </h3>
            <div style={{ display: "flex", gap: "12px", fontSize: "0.85rem", fontWeight: 600 }}>
              <span style={{ color: "#10b981" }}>Present: {presentDays} days</span>
              <span style={{ color: "var(--text-muted)" }}>|</span>
              <span style={{ color: "#ef4444" }}>Absent: {totalDays - presentDays} days</span>
            </div>
          </div>

          {attendance.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <Calendar size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ margin: 0 }}>No attendance records logged for your profile yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => {
                    const recordDate = new Date(record.date);
                    const dayName = !isNaN(recordDate.getTime())
                      ? recordDate.toLocaleDateString("en-US", { weekday: "long" })
                      : "—";

                    return (
                      <tr key={record._id}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{record.date}</td>
                        <td style={{ color: "var(--text-muted)" }}>{dayName}</td>
                        <td>
                          <span
                            className={`badge badge-${record.status?.toLowerCase()}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            {record.status === "Present" ? (
                              <>
                                <CheckCircle2 size={13} /> Present
                              </>
                            ) : (
                              <>
                                <XCircle size={13} /> Absent
                              </>
                            )}
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
      )}

      {/* Tab 3: Assigned Projects */}
      {activeTab === "projects" && (
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <FolderKanban size={18} style={{ color: "var(--primary)" }} /> My Assigned Projects & Initiatives
          </h3>

          {projects.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <FolderKanban size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No projects currently assigned to you.</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>When your coordinator assigns you to a foundation initiative, it will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  style={{
                    padding: "18px",
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                      <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {proj.title}
                      </h4>
                      <span className={`badge ${proj.status === "Completed" ? "badge-completed-chip" : "badge-active"}`}>
                        {proj.status || "Active"}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {proj.description || "No project description provided."}
                    </p>
                  </div>

                  <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                    <span>Start: {proj.startDate ? new Date(proj.startDate).toISOString().split("T")[0] : "—"}</span>
                    <span>End: {proj.endDate ? new Date(proj.endDate).toISOString().split("T")[0] : "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Announcements Feed */}
      {activeTab === "announcements" && (
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} style={{ color: "var(--primary)" }} /> Foundation Announcements & Circulars
          </h3>

          {announcements.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <Bell size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ margin: 0 }}>No announcements posted yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {announcements.map((item) => (
                <div
                  key={item._id}
                  style={{
                    padding: "16px 18px",
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    borderLeft: "4px solid var(--primary)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {item.date ? new Date(item.date).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InternPortal;

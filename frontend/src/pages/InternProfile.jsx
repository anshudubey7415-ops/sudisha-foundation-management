import { useEffect, useState, useCallback, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CreditCard,
  FileText,
  Award,
  Edit2,
  Upload,
  Loader2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  CalendarDays,
  XCircle,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Lock
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";
import API, { getUploadUrl } from "../api";

function InternProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const { user: authUser } = useContext(AuthContext);
  const isAdminUser = authUser?.role?.toLowerCase() === "admin";

  const [intern, setIntern] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Intern Login Credentials State
  const [userAccount, setUserAccount] = useState(null);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [showCredModal, setShowCredModal] = useState(false);
  const [credPassword, setCredPassword] = useState("");
  const [savingCred, setSavingCred] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchIntern = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/interns/${id}`);
      setIntern(res.data);
    } catch (error) {
      console.error("Error fetching intern:", error);
      showError("Failed to load intern profile");
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await API.get("/intern-attendance");
      const records = (res.data || []).filter(
        (record) => record.intern?._id === id || record.intern === id
      );
      records.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendance(records);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  }, [id]);

  const checkUserAccount = useCallback(async (email) => {
    if (!email || !isAdminUser) return;
    try {
      setCheckingAccount(true);
      const res = await API.get(`/users/by-email/${encodeURIComponent(email.trim())}`);
      setUserAccount(res.data);
    } catch (err) {
      // 404 means no account created yet
      setUserAccount(null);
    } finally {
      setCheckingAccount(false);
    }
  }, [isAdminUser]);

  useEffect(() => {
    fetchIntern();
    fetchAttendance();
  }, [fetchIntern, fetchAttendance]);

  useEffect(() => {
    if (intern?.email) {
      checkUserAccount(intern.email);
    }
  }, [intern?.email, checkUserAccount]);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
    let pass = "SF@" + intern?.internId?.replace(/[^0-9]/g, "") + "";
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCredPassword(pass);
  };

  const openCredModal = () => {
    setCredPassword("");
    if (!userAccount) {
      generateRandomPassword();
    }
    setShowCredModal(true);
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!intern.email || !intern.email.trim()) {
      showError("Intern does not have an email registered in their profile. Please edit profile first.");
      return;
    }
    if (!credPassword || credPassword.trim().length < 6) {
      showWarning("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSavingCred(true);
      if (userAccount) {
        // Update existing user password
        await API.put(`/users/${userAccount._id}`, {
          name: intern.name,
          email: intern.email.trim(),
          role: "intern",
          password: credPassword.trim()
        });
        showSuccess(`Login credentials updated for ${intern.name}!`);
      } else {
        // Create new user account
        await API.post("/users", {
          name: intern.name,
          email: intern.email.trim(),
          role: "intern",
          password: credPassword.trim()
        });
        showSuccess(`Login account created successfully for ${intern.name}!`);
      }

      setShowCredModal(false);
      checkUserAccount(intern.email);
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to save login credentials.");
    } finally {
      setSavingCred(false);
    }
  };

  const copyLoginDetails = () => {
    const text = `Sudisha Foundation Intern Portal Login:\nURL: ${window.location.origin}/login\nEmail: ${intern.email}\nPassword: ${credPassword}\nRole: Intern`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showSuccess("Login credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  // Document Permissions Toggle Handler
  const [togglingPerm, setTogglingPerm] = useState(false);

  const handleTogglePermission = async (permKey, currentValue) => {
    try {
      setTogglingPerm(true);
      const nextValue = !currentValue;
      const res = await API.patch(`/interns/${id}/document-permissions`, {
        [permKey]: nextValue,
      });

      setIntern((prev) => ({
        ...prev,
        [permKey]: nextValue,
      }));

      const docName =
        permKey === "allowIdCard"
          ? "Digital ID Card"
          : permKey === "allowOfferLetter"
          ? "Offer Letter"
          : "Internship Certificate";

      if (nextValue) {
        showSuccess(`${docName} access approved for ${intern.name}!`);
      } else {
        showSuccess(`${docName} access locked for ${intern.name}.`);
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to update document permission");
    } finally {
      setTogglingPerm(false);
    }
  };

  const handleBulkPermissions = async (grantAll) => {
    try {
      setTogglingPerm(true);
      await API.patch(`/interns/${id}/document-permissions`, {
        allowIdCard: grantAll,
        allowOfferLetter: grantAll,
        allowCertificate: grantAll,
      });

      setIntern((prev) => ({
        ...prev,
        allowIdCard: grantAll,
        allowOfferLetter: grantAll,
        allowCertificate: grantAll,
      }));

      if (grantAll) {
        showSuccess(`All official documents approved for ${intern.name}!`);
      } else {
        showSuccess(`All official documents locked for ${intern.name}.`);
      }
    } catch (err) {
      console.error(err);
      showError("Failed to update document permissions");
    } finally {
      setTogglingPerm(false);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) {
      showError("Please select an image file to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("photo", photo);

      await API.post(`/interns/upload/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Photo uploaded successfully!");
      setPhoto(null);
      fetchIntern();
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
        <h3>Loading Intern Profile...</h3>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Intern Not Found</h2>
        <Link to="/interns" className="btn btn-primary" style={{ marginTop: "16px" }}>
          Return to Intern Directory
        </Link>
      </div>
    );
  }

  const today = new Date();
  const isCompleted = intern.endDate ? today > new Date(intern.endDate) : intern.status === "Completed";
  const rate = parseFloat(intern.attendancePercentage || 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/interns" className="btn btn-secondary btn-icon" title="Back to Interns">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Briefcase size={24} style={{ color: "var(--primary)" }} /> Intern Profile: {intern.name}
              </h1>
              <p>ID: {intern.internId} &bull; {intern.department}</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          {isAdminUser && (
            <button
              onClick={openCredModal}
              className={`btn btn-sm ${userAccount ? "btn-secondary" : "btn-primary"}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              title={userAccount ? "Manage login password for this intern" : "Create login credentials for this intern"}
            >
              {checkingAccount ? (
                <Loader2 size={14} className="spin" />
              ) : userAccount ? (
                <>
                  <ShieldCheck size={14} style={{ color: "#10b981" }} /> Login Active
                </>
              ) : (
                <>
                  <KeyRound size={14} /> Create Login Account
                </>
              )}
            </button>
          )}

          <Link to={`/intern-id/${intern._id}`} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CreditCard size={14} /> ID Card
          </Link>
          <Link to={`/offer-letter/${intern._id}`} className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <FileText size={14} /> Offer Letter
          </Link>
          <Link to={`/intern-certificate/${intern._id}`} className="btn btn-warning btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Award size={14} /> Certificate
          </Link>
          <Link to={`/edit-intern/${intern._id}`} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Edit2 size={14} /> Edit
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        {/* Profile Card */}
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 16px" }}>
            {intern.photo ? (
              <img
                src={getUploadUrl(intern.photo)}
                alt={intern.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "var(--radius-full)",
                  objectFit: "cover",
                  border: "4px solid #7c3aed",
                  boxShadow: "var(--shadow-md)"
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(124, 58, 237, 0.1)",
                  color: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  fontWeight: 800,
                  border: "4px solid var(--border-color)"
                }}
              >
                {intern.name?.charAt(0) || "I"}
              </div>
            )}
          </div>

          <h2 style={{ margin: "0 0 6px 0" }}>{intern.name}</h2>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
            <span className="badge badge-role-intern">{intern.department}</span>
            <span className={`badge ${isCompleted ? "badge-completed-chip" : "badge-active"}`}>
              {isCompleted ? "Completed" : "Active"}
            </span>
          </div>

          <div style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "8px", textAlign: "left" }}>
              Upload Profile Photo
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
              <FileText size={18} style={{ color: "var(--primary)" }} /> Internship Overview
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>COLLEGE / UNIVERSITY</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{intern.college || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>COURSE / DEGREE</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{intern.course || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>TENURE DURATION</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{intern.startDate} to {intern.endDate}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>ASSIGNED MENTOR</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{intern.mentor || "Sudisha Admin"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>EMAIL</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{intern.email || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>PHONE</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{intern.phone || "—"}</div>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>CERTIFICATE SERIAL NO</div>
            <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--primary)", marginTop: "2px" }}>
              {intern.certificateNumber || "SF-CERT-PENDING"}
            </div>
          </div>
        </div>
      </div>

      {/* Document Permissions Control Card (Admin & Manager) */}
      {(isAdminUser || authUser?.role?.toLowerCase() === "manager") && (
        <div className="card" style={{ padding: "24px", marginBottom: "28px", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={20} style={{ color: "var(--primary)" }} /> Intern Portal Document Approvals
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Control which official documents <strong>{intern.name}</strong> can view and download in their personal portal.
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleBulkPermissions(true)}
                disabled={togglingPerm}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.8rem", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}
              >
                <Check size={14} /> Approve All
              </button>
              <button
                type="button"
                onClick={() => handleBulkPermissions(false)}
                disabled={togglingPerm}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.8rem", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}
              >
                <XCircle size={14} /> Revoke All
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {/* 1. ID Card Toggle Card */}
            <div
              style={{
                padding: "16px",
                background: intern.allowIdCard ? "rgba(16, 185, 129, 0.05)" : "var(--bg-surface)",
                border: `1px solid ${intern.allowIdCard ? "rgba(16, 185, 129, 0.3)" : "var(--border-color)"}`,
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={18} style={{ color: intern.allowIdCard ? "#10b981" : "var(--text-muted)" }} />
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Digital ID Card</span>
                </div>
                <span className={`badge ${intern.allowIdCard ? "badge-active" : "badge-completed-chip"}`}>
                  {intern.allowIdCard ? "Approved / Visible" : "Locked / Hidden"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Allows the intern to view and download their official digital identity badge.
              </p>
              <button
                type="button"
                onClick={() => handleTogglePermission("allowIdCard", !!intern.allowIdCard)}
                disabled={togglingPerm}
                className={`btn btn-sm ${intern.allowIdCard ? "btn-danger" : "btn-primary"}`}
                style={{ width: "100%", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
              >
                {intern.allowIdCard ? "Revoke ID Card Access" : "Approve ID Card Access"}
              </button>
            </div>

            {/* 2. Offer Letter Toggle Card */}
            <div
              style={{
                padding: "16px",
                background: intern.allowOfferLetter ? "rgba(16, 185, 129, 0.05)" : "var(--bg-surface)",
                border: `1px solid ${intern.allowOfferLetter ? "rgba(16, 185, 129, 0.3)" : "var(--border-color)"}`,
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={18} style={{ color: intern.allowOfferLetter ? "#10b981" : "var(--text-muted)" }} />
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Offer Letter</span>
                </div>
                <span className={`badge ${intern.allowOfferLetter ? "badge-active" : "badge-completed-chip"}`}>
                  {intern.allowOfferLetter ? "Approved / Visible" : "Locked / Hidden"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Allows the intern to view and download their verified internship appointment letter.
              </p>
              <button
                type="button"
                onClick={() => handleTogglePermission("allowOfferLetter", !!intern.allowOfferLetter)}
                disabled={togglingPerm}
                className={`btn btn-sm ${intern.allowOfferLetter ? "btn-danger" : "btn-primary"}`}
                style={{ width: "100%", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
              >
                {intern.allowOfferLetter ? "Revoke Offer Letter Access" : "Approve Offer Letter Access"}
              </button>
            </div>

            {/* 3. Certificate Toggle Card */}
            <div
              style={{
                padding: "16px",
                background: intern.allowCertificate ? "rgba(16, 185, 129, 0.05)" : "var(--bg-surface)",
                border: `1px solid ${intern.allowCertificate ? "rgba(16, 185, 129, 0.3)" : "var(--border-color)"}`,
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={18} style={{ color: intern.allowCertificate ? "#10b981" : "var(--text-muted)" }} />
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Certificate</span>
                </div>
                <span className={`badge ${intern.allowCertificate ? "badge-active" : "badge-completed-chip"}`}>
                  {intern.allowCertificate ? "Approved / Visible" : "Locked / Hidden"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Allows the intern to view, verify, and download their official Certificate of Internship.
              </p>
              <button
                type="button"
                onClick={() => handleTogglePermission("allowCertificate", !!intern.allowCertificate)}
                disabled={togglingPerm}
                className={`btn btn-sm ${intern.allowCertificate ? "btn-danger" : "btn-primary"}`}
                style={{ width: "100%", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
              >
                {intern.allowCertificate ? "Revoke Certificate Access" : "Approve Certificate Access"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <TrendingUp size={20} style={{ color: "var(--primary)" }} /> Performance & Attendance
      </h3>
      <div className="stats-grid" style={{ marginBottom: "28px" }}>
        <div className="stat-card" style={{ "--card-accent": "#7c3aed" }}>
          <div className="stat-top">
            <span className="stat-label">Total Days Tracked</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "rgba(124,58,237,0.1)", "--stat-icon-color": "#7c3aed" }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value">{intern.totalAttendanceDays || attendance.length}</div>
        </div>

        <div className="stat-card" style={{ "--card-accent": "#10b981" }}>
          <div className="stat-top">
            <span className="stat-label">Present Days</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#ecfdf5", "--stat-icon-color": "#10b981" }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "#10b981" }}>{intern.presentDays || attendance.filter(r => r.status === 'Present').length}</div>
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

      {/* Attendance History */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={18} style={{ color: "var(--primary)" }} /> Detailed Attendance Log ({attendance.length} Records)
          </h3>
        </div>

        {attendance.length === 0 ? (
          <p style={{ margin: 0, textAlign: "center", padding: "20px" }}>No attendance entries logged for this intern.</p>
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
                      <span className={`badge badge-${record.status?.toLowerCase()}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {record.status === "Present" ? (
                          <>
                            <CheckCircle2 size={12} /> Present
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Absent
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credential Management Modal */}
      {showCredModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div className="card" style={{ maxWidth: "480px", width: "100%", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ padding: "8px", background: "rgba(99, 102, 241, 0.12)", color: "var(--primary)", borderRadius: "8px" }}>
                <KeyRound size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {userAccount ? "Reset Intern Login Password" : "Create Intern Login Credentials"}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Role-Based Access Control for Intern Portal
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCredentials} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Intern Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={intern.name}
                  disabled
                  style={{ background: "var(--bg-surface)", cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Registered Profile Email * <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "normal" }}>(Used for Intern Login)</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={intern.email || ""}
                  disabled
                  placeholder="No email in profile"
                  style={{ background: "var(--bg-surface)", cursor: "not-allowed", fontFamily: "var(--font-mono)" }}
                />
                {!intern.email && (
                  <div style={{ fontSize: "0.8rem", color: "#ef4444", marginTop: "4px" }}>
                    ⚠️ This intern does not have an email in their profile. Please edit the profile to add an email first.
                  </div>
                )}
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    {userAccount ? "New Password *" : "Set Password * (min 6 chars)"}
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <RefreshCw size={11} /> Generate
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Enter password (e.g. Intern@2024)"
                    minLength={6}
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    style={{ fontFamily: "var(--font-mono)", paddingRight: "40px" }}
                  />
                  <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                    <Lock size={15} />
                  </div>
                </div>
              </div>

              {credPassword && credPassword.length >= 6 && intern.email && (
                <div style={{ padding: "10px 14px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <div><strong>Email:</strong> {intern.email}</div>
                    <div><strong>Password:</strong> {credPassword}</div>
                  </div>
                  <button
                    type="button"
                    onClick={copyLoginDetails}
                    className="btn btn-secondary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}
                  >
                    {copied ? <Check size={13} style={{ color: "#10b981" }} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCredModal(false)}
                  disabled={savingCred}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingCred || !intern.email}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {savingCred ? (
                    <>
                      <Loader2 size={14} className="spin" /> Saving...
                    </>
                  ) : userAccount ? (
                    "Update Password"
                  ) : (
                    "Create Intern Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InternProfile;
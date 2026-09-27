import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Loader2,
  Trash2,
  Edit2,
  CalendarCheck,
  User,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  AlertTriangle,
  FileText,
  KeyRound,
  Sparkles,
  Send,
  Copy
} from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";

function AdminRequests() {
  const { showSuccess, showError, showWarning } = useToast();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Password Approval Modal State
  const [passwordModalReq, setPasswordModalReq] = useState(null);
  const [customPassword, setCustomPassword] = useState("");
  const [issuedPasswordResult, setIssuedPasswordResult] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/requests");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      showError("Failed to fetch approval requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action, extraPayload = {}) => {
    try {
      setProcessingId(requestId);
      const res = await API.put(`/requests/${requestId}/${action}`, extraPayload);
      
      const newPass = res.data?.newPasswordIssued;
      if (newPass) {
        setIssuedPasswordResult({
          password: newPass,
          email: res.data?.request?.changes?.email || "User Email"
        });
      }

      showSuccess(
        action === "approve"
          ? (newPass ? `Password reset & approved! Credentials sent to user.` : "Request approved and changes applied!")
          : "Request rejected."
      );

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r._id === requestId
            ? { 
                ...r, 
                status: action === "approve" ? "approved" : "rejected",
                changes: {
                  ...(r.changes || {}),
                  ...(newPass ? { newPasswordIssued: newPass } : {})
                }
              }
            : r
        )
      );

      setPasswordModalReq(null);
      setCustomPassword("");
    } catch (err) {
      console.error("Error:", err);
      showError(err.response?.data?.message || "Failed to process request action.");
    } finally {
      setProcessingId(null);
    }
  };

  const openPasswordApprovalModal = (req) => {
    setPasswordModalReq(req);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
    let pass = "SF@";
    for (let i = 0; i < 7; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCustomPassword(pass);
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === "all") return true;
    return (r.status || "pending").toLowerCase() === statusFilter.toLowerCase();
  });

  const getRequestBadge = (changeType, targetCollection) => {
    if (changeType.includes("password") || targetCollection === "users" || targetCollection === "passwords") {
      return {
        label: "Password Reset Request",
        badgeClass: "badge-purple",
        icon: <KeyRound size={13} />,
      };
    }
    if (changeType.includes("delete")) {
      return {
        label: "Record Deletion Request",
        badgeClass: "badge-danger",
        icon: <Trash2 size={13} />,
      };
    }
    if (changeType.includes("attendance")) {
      return {
        label: "Past Attendance Modification",
        badgeClass: "badge-primary",
        icon: <CalendarCheck size={13} />,
      };
    }
    if (changeType.includes("profile") || changeType.includes("edit")) {
      return {
        label: "Profile Information Update",
        badgeClass: "badge-warning",
        icon: <Edit2 size={13} />,
      };
    }
    return {
      label: changeType || "Change Request",
      badgeClass: "badge-secondary",
      icon: <FileText size={13} />,
    };
  };

  const getTargetIcon = (targetCollection) => {
    if (targetCollection?.includes("student")) return <GraduationCap size={15} style={{ color: "#3b82f6" }} />;
    if (targetCollection?.includes("intern")) return <Briefcase size={15} style={{ color: "#8b5cf6" }} />;
    if (targetCollection?.includes("volunteer")) return <HeartHandshake size={15} style={{ color: "#ec4899" }} />;
    return <User size={15} />;
  };

  return (
    <Layout title="Change & Approval Requests">
      <div style={{ maxWidth: "950px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Filter Bar */}
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} style={{ color: "var(--primary)" }} /> Filter by Request Status:
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`btn btn-sm ${statusFilter === "pending" ? "btn-primary" : "btn-secondary"}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Clock size={13} /> Pending ({requests.filter((r) => (r.status || "pending").toLowerCase() === "pending").length})
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`btn btn-sm ${statusFilter === "approved" ? "btn-primary" : "btn-secondary"}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <CheckCircle2 size={13} /> Approved ({requests.filter((r) => (r.status || "").toLowerCase() === "approved").length})
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`btn btn-sm ${statusFilter === "rejected" ? "btn-primary" : "btn-secondary"}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <XCircle size={13} /> Rejected ({requests.filter((r) => (r.status || "").toLowerCase() === "rejected").length})
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-secondary"}`}
              >
                All ({requests.length})
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
            <span>Loading approval requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <Clock size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No requests found in this view.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredRequests.map((req) => {
              const currentStatus = (req.status || "pending").toLowerCase();
              const isPending = currentStatus === "pending";
              const isApproved = currentStatus === "approved";
              const isProcessing = processingId === req._id;
              const requester = req.managerId || req.requester;
              const badgeInfo = getRequestBadge(req.changeType || "", req.targetCollection || "");
              const isPasswordReset = req.changeType === 'password_reset_request' || req.targetCollection === 'users' || req.targetCollection === 'passwords';

              return (
                <div
                  key={req._id}
                  className="card"
                  style={{
                    padding: "24px",
                    borderLeft: `5px solid ${
                      isPending ? (isPasswordReset ? "#a855f7" : "#f59e0b") : isApproved ? "#10b981" : "#ef4444"
                    }`,
                    background: "var(--bg-card)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                        <span 
                          className="badge" 
                          style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "5px",
                            background: isPasswordReset ? "rgba(168, 85, 247, 0.15)" : undefined,
                            color: isPasswordReset ? "#c084fc" : undefined
                          }}
                        >
                          {badgeInfo.icon} {badgeInfo.label}
                        </span>
                        <span className="badge badge-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          {getTargetIcon(req.targetCollection)} {req.targetCollection}
                        </span>
                        {req.targetName && (
                          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                            Target: {req.targetName}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span>
                          Submitted by: <strong>{requester?.name || requester?.email || "Manager / Portal User"}</strong>
                          {requester?.email && (
                            <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>({requester.email})</span>
                          )}
                        </span>
                        <span>&bull;</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {req.createdAt ? new Date(req.createdAt).toLocaleString() : "Recently"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`badge ${
                        isPending ? "badge-warning" : isApproved ? "badge-success" : "badge-danger"
                      }`}
                      style={{ textTransform: "capitalize", fontSize: "0.85rem", padding: "4px 12px" }}
                    >
                      {req.status || "pending"}
                    </span>
                  </div>

                  {req.reason && (
                    <div style={{ marginBottom: "14px", padding: "10px 14px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.9rem" }}>
                      <strong style={{ color: "var(--text-primary)" }}>Reason / Details: </strong>
                      <span style={{ color: "var(--text-secondary)" }}>{req.reason}</span>
                    </div>
                  )}

                  {/* Changes Inspection Display */}
                  {req.changes && (
                    <div style={{ marginBottom: "16px" }}>
                      {/* Password Reset Request Details */}
                      {isPasswordReset ? (
                        <div style={{ padding: "14px 18px", background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: "var(--radius-sm)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#c084fc", marginBottom: "8px" }}>
                            <KeyRound size={16} /> User Account Credentials Recovery
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px", fontSize: "0.88rem" }}>
                            <div><span style={{ color: "var(--text-muted)" }}>Name:</span> <strong style={{ color: "var(--text-primary)" }}>{req.targetName || req.changes.name}</strong></div>
                            <div><span style={{ color: "var(--text-muted)" }}>Email:</span> <strong style={{ color: "var(--text-primary)" }}>{req.changes.email}</strong></div>
                            <div><span style={{ color: "var(--text-muted)" }}>Role:</span> <span className="badge" style={{ textTransform: "capitalize", background: "rgba(168,85,247,0.2)", color: "#c084fc" }}>{req.changes.role || "intern"}</span></div>
                          </div>

                          {req.changes.newPasswordIssued && (
                            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed rgba(168, 85, 247, 0.3)", display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>New Password Issued:</span>
                              <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: "4px", color: "#4ade80", fontWeight: 700 }}>
                                {req.changes.newPasswordIssued}
                              </code>
                            </div>
                          )}
                        </div>
                      ) : req.changeType?.includes("delete") ? (
                        /* Deletion Details */
                        <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "var(--radius-sm)", color: "#ef4444", fontSize: "0.875rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, marginBottom: "4px" }}>
                            <AlertTriangle size={15} /> Permanent Deletion Request
                          </div>
                          <div>Target: <strong>{req.targetName || req.changes.name || "Entity"}</strong> ({req.targetCollection})</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            Approving will permanently delete this record and associated attendance history from the database.
                          </div>
                        </div>
                      ) : req.changes.records && Array.isArray(req.changes.records) ? (
                        /* Bulk Attendance List */
                        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "10px", maxHeight: "200px", overflowY: "auto" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                            Date: {req.changes.date || "Selected Date"} ({req.changes.records.length} Total Records Modified)
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "6px" }}>
                            {req.changes.records.map((rec, i) => (
                              <div key={i} style={{ padding: "6px 10px", background: "var(--bg-card)", borderRadius: "4px", fontSize: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "var(--text-primary)" }}>{rec.student?.name || rec.student || `Entry #${i+1}`}</span>
                                <span className={`badge ${rec.status === 'Present' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                                  {rec.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Standard Field-by-Field Key-Value View */
                        <div
                          style={{
                            background: "var(--bg-surface)",
                            borderRadius: "var(--radius-sm)",
                            padding: "12px",
                            border: "1px solid var(--border-color)",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "8px",
                          }}
                        >
                          {typeof req.changes === "object" ? (
                            Object.entries(req.changes)
                              .filter(([k]) => k !== "action" && k !== "_id" && k !== "__v" && k !== "newPasswordIssued")
                              .map(([k, v]) => (
                                <div key={k} style={{ fontSize: "0.85rem" }}>
                                  <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{k}: </span>
                                  <strong style={{ color: "var(--text-primary)" }}>{String(v)}</strong>
                                </div>
                              ))
                          ) : (
                            <pre style={{ margin: 0, fontSize: "0.82rem" }}>{String(req.changes)}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Controls */}
                  {isPending && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
                      <button
                        onClick={() => handleAction(req._id, "reject")}
                        className="btn btn-outline btn-sm"
                        disabled={isProcessing}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--danger)", borderColor: "rgba(239,68,68,0.3)" }}
                      >
                        {isProcessing ? <Loader2 size={13} className="spin" /> : <X size={14} />} Reject Request
                      </button>

                      {isPasswordReset ? (
                        <button
                          onClick={() => openPasswordApprovalModal(req)}
                          className="btn btn-primary btn-sm"
                          disabled={isProcessing}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", border: "none" }}
                        >
                          <KeyRound size={14} /> Set Password &amp; Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(req._id, "approve")}
                          className="btn btn-primary btn-sm"
                          disabled={isProcessing}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          {isProcessing ? <Loader2 size={13} className="spin" /> : <Check size={14} />} Approve &amp; Apply Changes
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Set Password and Approve */}
      {passwordModalReq && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 15, 29, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
            padding: "20px"
          }}
        >
          <div className="card" style={{ maxWidth: "460px", width: "100%", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Assign New Password
                </h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  For {passwordModalReq.targetName || passwordModalReq.changes?.name} ({passwordModalReq.changes?.email})
                </p>
              </div>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "18px" }}>
              Enter a new password or auto-generate one. Once approved, the new credentials will be updated in the system and emailed to the user.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customPassword.trim() || customPassword.trim().length < 6) {
                  showWarning("Password must be at least 6 characters.");
                  return;
                }
                handleAction(passwordModalReq._id, "approve", { newPassword: customPassword.trim() });
              }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label className="form-label" style={{ margin: 0 }}>New Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
                      let pass = "SF@";
                      for (let i = 0; i < 7; i++) {
                        pass += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setCustomPassword(pass);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Sparkles size={12} /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPasswordModalReq(null)}
                  disabled={Boolean(processingId)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={Boolean(processingId)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", border: "none" }}
                >
                  {processingId ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                  <span>Approve &amp; Send Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL WITH COPY PASSWORD */}
      {issuedPasswordResult && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 15, 29, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1060,
            padding: "20px"
          }}
        >
          <div className="card" style={{ maxWidth: "440px", width: "100%", padding: "28px", textAlign: "center" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.15)",
              border: "2px solid #10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10b981",
              margin: "0 auto 16px"
            }}>
              <CheckCircle2 size={30} />
            </div>

            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Password Reset Approved!
            </h3>
            
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "18px" }}>
              New password credentials have been generated and dispatched to <strong>{issuedPasswordResult.email}</strong>.
            </p>

            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px"
            }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Issued Password:</div>
                <div style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: "#4ade80" }}>
                  {issuedPasswordResult.password}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(issuedPasswordResult.password);
                  showSuccess("Password copied to clipboard!");
                }}
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <Copy size={13} /> Copy
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIssuedPasswordResult(null)}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AdminRequests;
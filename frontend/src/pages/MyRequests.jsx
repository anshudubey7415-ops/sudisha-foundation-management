import { useEffect, useState } from "react";
import {
  Clock,
  Loader2,
  Trash2,
  Edit2,
  CalendarCheck,
  User,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  FileText
} from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";

function MyRequests() {
  const { showError } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/requests/my-requests");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching my requests:", err);
      showError("Failed to fetch your requests history.");
    } finally {
      setLoading(false);
    }
  };

  const getRequestBadge = (changeType) => {
    if (changeType?.includes("delete")) {
      return {
        label: "Record Deletion Request",
        badgeClass: "badge-danger",
        icon: <Trash2 size={13} />,
      };
    }
    if (changeType?.includes("attendance")) {
      return {
        label: "Past Attendance Modification",
        badgeClass: "badge-primary",
        icon: <CalendarCheck size={13} />,
      };
    }
    if (changeType?.includes("profile") || changeType?.includes("edit")) {
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
    <Layout title="My Modification Requests">
      <div style={{ maxWidth: "850px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
            <span>Loading your requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <Clock size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>You have not submitted any modification requests yet.</p>
            <p style={{ margin: "6px 0 0", fontSize: "0.85rem" }}>When you request to delete records, edit student profiles, or change past attendance, your requests will be tracked here.</p>
          </div>
        ) : (
          requests.map((req) => {
            const currentStatus = (req.status || "Pending").toLowerCase();
            const isPending = currentStatus === "pending";
            const isApproved = currentStatus === "approved";
            const badgeInfo = getRequestBadge(req.changeType || "");

            return (
              <div
                key={req._id}
                className="card"
                style={{
                  padding: "20px 24px",
                  borderLeft: `5px solid ${
                    isPending ? "#f59e0b" : isApproved ? "#10b981" : "#ef4444"
                  }`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span className={`badge ${badgeInfo.badgeClass}`} style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
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

                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Submitted on {req.createdAt ? new Date(req.createdAt).toLocaleString() : "Recent"}
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      isPending ? "badge-warning" : isApproved ? "badge-success" : "badge-danger"
                    }`}
                    style={{ textTransform: "capitalize", fontSize: "0.85rem", padding: "4px 12px" }}
                  >
                    {req.status || "Pending"}
                  </span>
                </div>

                {req.reason && (
                  <div style={{ marginBottom: "12px", padding: "8px 12px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.875rem" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Reason: </strong>
                    <span style={{ color: "var(--text-secondary)" }}>{req.reason}</span>
                  </div>
                )}

                {req.changes && (
                  <div>
                    {req.changeType?.includes("delete") ? (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Action: Request to permanently delete record for <strong>{req.targetName || "Target"}</strong>
                      </div>
                    ) : req.changes.records && Array.isArray(req.changes.records) ? (
                      <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", padding: "10px", fontSize: "0.85rem", border: "1px solid var(--border-color)" }}>
                        <span style={{ color: "var(--text-muted)" }}>Modified {req.changes.records.length} attendance record(s) for Date: {req.changes.date || "Selected"}</span>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "var(--bg-surface)",
                          borderRadius: "var(--radius-sm)",
                          padding: "10px 14px",
                          fontSize: "0.85rem",
                          border: "1px solid var(--border-color)",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "6px",
                        }}
                      >
                        {typeof req.changes === "object" ? (
                          Object.entries(req.changes)
                            .filter(([k]) => k !== "action" && k !== "_id" && k !== "__v")
                            .map(([k, v]) => (
                              <div key={k}>
                                <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{k}: </span>
                                <strong style={{ color: "var(--text-primary)" }}>{String(v)}</strong>
                              </div>
                            ))
                        ) : (
                          <div>{String(req.changes)}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}

export default MyRequests;
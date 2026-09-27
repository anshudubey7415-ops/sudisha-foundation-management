import { useState } from "react";
import { X } from "lucide-react";
import API from "../api";
import { useToast } from "../context/ToastContext";

const RequestForm = ({ targetUserId, targetCollection, currentData, onClose }) => {
  const { showSuccess, showError } = useToast();
  const [changes, setChanges] = useState({ ...currentData });
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Restricted/Internal fields that should not be edited
  const restrictedFields = [
    "_id",
    "password",
    "__v",
    "role",
    "email",
    "createdAt",
    "updatedAt",
    "presentDays",
    "totalAttendanceDays",
    "attendancePercentage",
    "totalHours",
    "photo"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showError("Please enter a reason for this change request.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/requests", {
        targetUserId,
        targetCollection,
        changeType: "update_profile",
        changes,
        reason: reason.trim()
      });
      showSuccess("Change request submitted to Admin for approval!");
      onClose();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>
              Request Update
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Submitting for: <strong>{currentData?.name || "Record"}</strong> ({targetCollection})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {Object.keys(changes).map((key) => {
              if (restrictedFields.includes(key)) return null;
              if (typeof changes[key] === "object" && changes[key] !== null) return null;

              return (
                <div key={key} style={{ gridColumn: key === "address" || key === "remarks" ? "1 / -1" : "auto" }}>
                  <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    {formatLabel(key)}
                  </label>
                  <input
                    className="form-control"
                    value={changes[key] || ""}
                    onChange={(e) => setChanges({ ...changes, [key]: e.target.value })}
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>
              );
            })}
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
              Reason for Modification <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              className="form-control"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this profile update is required..."
              required
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Submitting..." : "Send Request to Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
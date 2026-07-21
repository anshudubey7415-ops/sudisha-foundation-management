import { useState } from "react";
import API from "../api";

const RequestForm = ({ targetUserId, targetCollection, currentData, onClose }) => {
  const [changes, setChanges] = useState({ ...currentData });
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Jin fields ko edit nahi karne dena
  const restrictedFields = ["_id", "password", "__v", "role", "email", "createdAt", "updatedAt"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Yahan ab 'targetCollection' bhi bheja ja raha hai
      await API.post("/requests", {
        targetUserId,
        targetCollection, // Prop se aaya hua dynamic value (students/interns/volunteers)
        changeType: "update_profile",
        changes,
        reason
      });
      alert("Request sent to Admin successfully!");
      onClose();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ padding: "20px", background: "#fff", borderRadius: "8px", border: "1px solid #ccc", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000, width: "400px" }}>
      <form onSubmit={handleSubmit} className="request-form">
        <h3>Request Update for {currentData.name || "User"}</h3>
        
        {Object.keys(changes).map((key) => {
          if (restrictedFields.includes(key)) return null;

          return (
            <div key={key} style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666" }}>{key.toUpperCase()}: </label>
              <input 
                value={changes[key] || ""} 
                onChange={(e) => setChanges({...changes, [key]: e.target.value})} 
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
            </div>
          );
        })}

        <div style={{ marginTop: "15px" }}>
          <label>Reason for change: </label>
          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            required
            style={{ width: "100%", height: "60px", marginTop: "5px" }}
          />
        </div>
        
        <div style={{ marginTop: "15px" }}>
          <button type="submit" disabled={loading} style={{ background: "#2563eb", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            {loading ? "Sending..." : "Send to Admin"}
          </button>
          <button type="button" onClick={onClose} style={{ marginLeft: "10px", padding: "10px 20px", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
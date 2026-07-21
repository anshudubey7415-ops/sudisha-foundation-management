import { useEffect, useState } from "react";
import API from "../api";

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sirf pending requests fetch karo
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      // Backend route jo saari pending request layega
      const res = await API.get("/requests/pending"); 
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      // action = 'approve' ya 'reject'
      await API.put(`/requests/${requestId}/${action}`);
      alert(`Request ${action}d successfully!`);
      // UI se us request ko hata do jo approve/reject ho gayi
      setRequests(requests.filter(req => req._id !== requestId));
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong!");
    }
  };

  if (loading) return <div>Loading requests...</div>;

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      <h2 style={{ color: "#1e3a8a", marginBottom: "20px" }}>Pending Approval Requests</h2>
      
      {requests.length === 0 ? (
        <p>No pending requests at the moment.</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {requests.map((req) => (
            <div key={req._id} style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <p><strong>Action:</strong> {req.changeType}</p>
              <p><strong>Reason:</strong> {req.reason}</p>
              <p><strong>Changes Requested:</strong></p>
              <pre style={{ background: "#f1f5f9", padding: "10px", borderRadius: "5px" }}>
                {JSON.stringify(req.changes, null, 2)}
              </pre>
              
              <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                <button 
                  onClick={() => handleAction(req._id, 'approve')} 
                  style={{ background: "#16a34a", color: "white", padding: "8px 15px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleAction(req._id, 'reject')} 
                  style={{ background: "#dc2626", color: "white", padding: "8px 15px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminRequests;
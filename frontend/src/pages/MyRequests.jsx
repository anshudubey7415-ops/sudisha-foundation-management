import { useEffect, useState } from "react";
import API from "../api";

function MyRequests() {
  const [requests, setRequests] = useState([]); // Ye variable ab use hoga

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await API.get("/requests/my-requests");
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching my requests:", err);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Requests</h1>
      {/* Yahan 'requests' variable ko map kar diya, warning chali jayegi */}
      <ul>
        {requests.map((req) => (
          <li key={req._id}>
            {req.changeType} - Status: {req.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyRequests;
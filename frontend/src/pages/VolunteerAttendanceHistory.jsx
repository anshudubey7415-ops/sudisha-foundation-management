import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function VolunteerAttendanceHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/volunteer-attendance/volunteer/${id}`);
        setRecords(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load records.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer" }}
      >
        Back
      </button>

      <h2>Attendance History</h2>
      <p>Total Records: {records.length}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && records.length > 0 ? (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {records.map((record) => (
            <li 
              key={record._id} 
              style={{ 
                border: "1px solid #ddd", 
                padding: "10px", 
                marginBottom: "8px", 
                borderRadius: "4px" 
              }}
            >
              <strong>Date:</strong> {new Date(record.date).toLocaleDateString()} | 
              <strong> Status:</strong> {record.status} | 
              <strong> In:</strong> {record.checkIn || "N/A"} | 
              <strong> Out:</strong> {record.checkOut || "N/A"}
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No attendance records found.</p>
      )}
    </div>
  );
}

export default VolunteerAttendanceHistory;
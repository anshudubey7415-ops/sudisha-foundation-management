import { useState, useEffect } from "react";
import API from "../api";

function VolunteerAllHistory() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // IIFE ka use kar rahe hain taaki koi warning na aaye
    (async () => {
      if (!selectedDate) return;

      setLoading(true);
      try {
        const res = await API.get(`/volunteers/attendance/date/${selectedDate}`);
        setAttendanceData(res.data || []);
      } catch (error) {
        console.error("Error fetching date-wise attendance:", error);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate]); // Sirf selectedDate change hone par chalega

  return (
    <div style={{ padding: "20px" }}>
      <h2>Volunteers Date-Wise Attendance History</h2>
      <p style={{ color: "#666" }}>Select a date to view attendance for all volunteers.</p>

      <div style={{ marginBottom: "25px", marginTop: "15px" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>Select Date: </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
      </div>

      {loading ? (
        <h3>Loading attendance records...</h3>
      ) : attendanceData.length === 0 ? (
        <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #ddd" }}>
          <p style={{ margin: 0, color: "#666" }}>
            No attendance records found for <strong>{selectedDate}</strong>.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              maxWidth: "900px",
              borderCollapse: "collapse",
              marginTop: "10px",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            <thead>
              <tr style={{ background: "#2563eb", color: "#fff", textAlign: "left" }}>
                <th style={{ padding: "12px 15px" }}>Volunteer ID</th>
                <th style={{ padding: "12px 15px" }}>Name</th>
                <th style={{ padding: "12px 15px" }}>Status</th>
                <th style={{ padding: "12px 15px" }}>Hours Worked</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record, index) => (
                <tr
                  key={record._id || index}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb",
                  }}
                >
                  <td style={{ padding: "12px 15px" }}>{record.volunteerId}</td>
                  <td style={{ padding: "12px 15px", fontWeight: "500" }}>{record.name}</td>
                  <td style={{ padding: "12px 15px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        background: record.status === "Present" ? "#d1fae5" : "#fee2e2",
                        color: record.status === "Present" ? "#065f46" : "#991b1b",
                      }}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    {record.status === "Present" ? `${record.hours || 0} hrs` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VolunteerAllHistory;
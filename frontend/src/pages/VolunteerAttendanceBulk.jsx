import { useEffect, useState } from "react";
import API from "../api";

const VolunteerAttendanceBulk = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    // Load all volunteers
    API.get("/volunteers").then((res) => setVolunteers(res.data));
  }, []);

  const handleToggle = (id) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present",
    }));
  };

  const submitAttendance = async () => {
    const date = new Date().toISOString().split("T")[0];
    const records = volunteers.map((v) => ({
      volunteer: v._id,
      status: attendance[v._id] || "Absent", // Defaults to Absent if never toggled
      date,
    }));

    try {
      await API.post("/volunteer-attendance/bulk", { records });
      alert("Attendance saved successfully!");
    } catch (err) {
      alert("Failed to save. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manual Volunteer Attendance List</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: "10px" }}>Volunteer Name</th>
            <th style={{ padding: "10px" }}>Action</th>
            <th style={{ padding: "10px" }}>Current Status</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((v) => (
            <tr key={v._id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>{v.name}</td>
              <td style={{ padding: "10px" }}>
                <button 
                  onClick={() => handleToggle(v._id)}
                  style={{ padding: "5px 10px", cursor: "pointer" }}
                >
                  Toggle Status
                </button>
              </td>
              <td style={{ padding: "10px", fontWeight: "bold", color: attendance[v._id] === "Present" ? "green" : "red" }}>
                {attendance[v._id] || "Absent"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button 
        onClick={submitAttendance} 
        style={{ marginTop: "20px", padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        Save All Attendance
      </button>
    </div>
  );
};

export default VolunteerAttendanceBulk;
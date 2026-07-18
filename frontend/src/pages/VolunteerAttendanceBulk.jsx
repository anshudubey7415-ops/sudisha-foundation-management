import { useEffect, useState } from "react";
import API from "../api";

const VolunteerAttendanceBulk = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [attendance, setAttendance] = useState({});
  // Aaj ki date default mein select kar li
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await API.get("/volunteers");
      setVolunteers(res.data);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
    }
  };

  // Logic: Sirf wahi volunteers dikhayein jo selected date se pehle join hue hain
  const filteredVolunteers = volunteers.filter((v) => {
    // Assuming v.joiningDate format "YYYY-MM-DD" hai
    return v.joiningDate <= selectedDate;
  });

  const handleToggle = (id) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present",
    }));
  };

  const submitAttendance = async () => {
    const records = filteredVolunteers.map((v) => ({
      volunteer: v._id,
      status: attendance[v._id] || "Absent",
      date: selectedDate, // Ab selected date use hogi
    }));

    try {
      await API.post("/volunteer-attendance/bulk", { records });
      alert(`Attendance saved successfully for ${selectedDate}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to save. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manual Volunteer Attendance</h1>
      
      {/* Date Selector */}
      <div style={{ marginBottom: "20px" }}>
        <label>Select Date: </label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: "5px", marginLeft: "10px" }}
        />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: "10px" }}>Volunteer Name</th>
            <th style={{ padding: "10px" }}>Joining Date</th>
            <th style={{ padding: "10px" }}>Action</th>
            <th style={{ padding: "10px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredVolunteers.map((v) => (
            <tr key={v._id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>{v.name}</td>
              <td style={{ padding: "10px" }}>{v.joiningDate}</td>
              <td style={{ padding: "10px" }}>
                <button onClick={() => handleToggle(v._id)} style={{ padding: "5px 10px", cursor: "pointer" }}>
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

      <button onClick={submitAttendance} style={{ marginTop: "20px", padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
        Save Attendance for {selectedDate}
      </button>
    </div>
  );
};

export default VolunteerAttendanceBulk;
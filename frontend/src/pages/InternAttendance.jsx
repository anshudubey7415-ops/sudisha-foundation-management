import { useEffect, useState } from "react";
import API from "../api";

function InternAttendance() {
  const [interns, setInterns] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const res = await API.get("/interns");
        setInterns(res.data);
      } catch (err) { // err naam rakho aur niche use kar lo
        console.error("Error fetching interns:", err); 
      }
    };
    fetchInterns();
  }, []);

  const handleToggle = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const saveAllAttendance = async () => {
    try {
      for (const [internId, status] of Object.entries(attendance)) {
        await API.post("/intern-attendance/mark", {
          intern: internId,
          status,
          date: selectedDate,
        });
      }
      alert("Attendance Saved Successfully!");
    } catch (err) { // err naam rakho aur niche use kar lo
      console.error("Error saving attendance:", err);
      alert("Error saving attendance");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Intern Attendance</h1>
      <input 
        type="date" 
        value={selectedDate} 
        onChange={(e) => setSelectedDate(e.target.value)} 
        style={{ marginBottom: "20px", padding: "8px" }} 
      />

      {interns.map((intern) => {
        const isActive = intern.joiningDate ? (selectedDate >= intern.joiningDate && selectedDate <= intern.endDate) : (selectedDate <= intern.endDate);
        if (!isActive) return null;

        const status = attendance[intern._id];

        return (
          <div key={intern._id} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "10px", borderRadius: "10px" }}>
            <h3>{intern.name}</h3>
            
            <button 
              onClick={() => handleToggle(intern._id, "Present")}
              style={{ 
                background: status === "Present" ? "green" : "#ccc", 
                color: "white", padding: "8px 15px", border: "none", cursor: "pointer", marginRight: "10px" 
              }}
            >
              Present
            </button>

            <button 
              onClick={() => handleToggle(intern._id, "Absent")}
              style={{ 
                background: status === "Absent" ? "red" : "#ccc", 
                color: "white", padding: "8px 15px", border: "none", cursor: "pointer" 
              }}
            >
              Absent
            </button>
          </div>
        );
      })}

      <button 
        onClick={saveAllAttendance}
        style={{ 
          marginTop: "20px", padding: "15px 30px", background: "#007bff", 
          color: "white", border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer" 
        }}
      >
        Save All Attendance
      </button>
    </div>
  );
}

export default InternAttendance;
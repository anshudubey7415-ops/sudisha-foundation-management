import { useEffect, useState } from "react";
import API from "../api";

function DateWiseAttendance() {
  const [groupedRecords, setGroupedRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await API.get("/attendance");
        const grouped = {};
        res.data.forEach((record) => {
          const date = record.date;
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(record);
        });
        setGroupedRecords(grouped);
      } catch {
        console.error("Error fetching data");
      }
    };
    fetchAttendance();
  }, []);

  const toggleStatus = (date, recordIndex) => {
    const newGrouped = { ...groupedRecords };
    const record = newGrouped[date][recordIndex];
    record.status = record.status === "Present" ? "Absent" : "Present";
    setGroupedRecords(newGrouped);
  };

  const saveChanges = async (date) => {
    const records = groupedRecords[date].map((r) => ({
      student: r.student?._id,
      status: r.status,
      date: date,
    }));

    try {
      await API.post("/attendance/bulk", { records });
      alert("Attendance Updated!");
      setIsEditing(false);
    } catch {
      alert("Error saving changes");
    }
  };

  const dates = Object.keys(groupedRecords)
    .filter((date) => selectedDate === "" || date === selectedDate)
    .sort()
    .reverse();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Date Wise Attendance</h1>
      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: "10px" }} />
      <button onClick={() => setIsEditing(!isEditing)} style={{ marginLeft: "10px", padding: "10px" }}>
        {isEditing ? "Cancel" : "Edit Mode"}
      </button>

      {dates.map((date) => (
        <div key={date} style={{ marginTop: "20px", border: "1px solid #ddd", padding: "15px" }}>
          <h2>📅 {date}</h2>
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {groupedRecords[date].map((record, index) => (
                <tr key={record._id}>
                  <td>{record.student?.name}</td>
                  <td>
                    {isEditing ? (
                      <button onClick={() => toggleStatus(date, index)} style={{ color: record.status === "Present" ? "green" : "red" }}>
                        {record.status}
                      </button>
                    ) : (
                      <span style={{ color: record.status === "Present" ? "green" : "red" }}>{record.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isEditing && <button onClick={() => saveChanges(date)} style={{ marginTop: "10px" }}>Save</button>}
        </div>
      ))}
    </div>
  );
}

export default DateWiseAttendance;
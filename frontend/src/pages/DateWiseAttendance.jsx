import { useEffect, useState } from "react";
import API from "../api";

function DateWiseAttendance() {
const [groupedRecords, setGroupedRecords] = useState({});
const [selectedDate, setSelectedDate] = useState("");

useEffect(() => {
fetchAttendance();
}, []);

const fetchAttendance = async () => {
try {
const res = await API.get("/attendance");


  const grouped = {};

  res.data.forEach((record) => {
    const date = record.date;

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(record);
  });

  setGroupedRecords(grouped);
} catch (error) {
  console.error(error);
}


};

const dates = Object.keys(groupedRecords)
.filter(
(date) =>
selectedDate === "" ||
date === selectedDate
)
.sort()
.reverse();

return (
<div style={{ padding: "20px" }}> <h1>Date Wise Attendance</h1>


  <div style={{ marginTop: "20px" }}>
    <input
      type="date"
      value={selectedDate}
      onChange={(e) =>
        setSelectedDate(e.target.value)
      }
      style={{
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
      }}
    />
  </div>

  {dates.length === 0 && (
    <p style={{ marginTop: "20px" }}>
      No Attendance Records Found
    </p>
  )}

  {dates.map((date) => {
    const records = groupedRecords[date];

    const presentCount = records.filter(
      (r) => r.status === "Present"
    ).length;

    const absentCount = records.filter(
      (r) => r.status === "Absent"
    ).length;

    const totalStudents = records.length;

    const attendancePercentage =
      totalStudents > 0
        ? (
            (presentCount / totalStudents) *
            100
          ).toFixed(1)
        : 0;

    return (
      <div
        key={date}
        style={{
          marginTop: "25px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "15px",
          background: "#f9fafb",
        }}
      >
        <h2>📅 {date}</h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "15px",
            marginTop: "10px",
          }}
        >
          <strong>
            Total Students: {totalStudents}
          </strong>

          <strong style={{ color: "green" }}>
            Present: {presentCount}
          </strong>

          <strong style={{ color: "red" }}>
            Absent: {absentCount}
          </strong>

          <strong style={{ color: "#2563eb" }}>
            Attendance %: {attendancePercentage}%
          </strong>
        </div>

        <table
          border="1"
          cellPadding="10"
          style={{
            borderCollapse: "collapse",
            width: "100%",
            background: "white",
          }}
        >
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record._id}>
                <td>
                  {record.student?.rollNumber ||
                    "-"}
                </td>

                <td>
                  {record.student?.name ||
                    "Unknown Student"}
                </td>

                <td
                  style={{
                    color:
                      record.status === "Present"
                        ? "green"
                        : "red",
                    fontWeight: "bold",
                  }}
                >
                  {record.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  })}
</div>


);
}

export default DateWiseAttendance;

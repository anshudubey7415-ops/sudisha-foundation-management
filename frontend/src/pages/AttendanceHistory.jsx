import { useEffect, useState } from "react";
import API from "../api";

function AttendanceHistory() {
  const [groupedRecords, setGroupedRecords] = useState({});

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance");

      const grouped = {};

      res.data.forEach((record) => {
        const studentName =
          record.student?.name || "Unknown Student";

        if (!grouped[studentName]) {
          grouped[studentName] = [];
        }

        grouped[studentName].push(record);
      });

      setGroupedRecords(grouped);
    } catch (error) {
      console.error(error);
    }
  };

  const students = Object.keys(groupedRecords).sort();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Student Attendance Report</h1>

      {students.map((student) => {
        const records = groupedRecords[student];

        const presentCount = records.filter(
          (r) => r.status === "Present"
        ).length;

        const absentCount = records.filter(
          (r) => r.status === "Absent"
        ).length;

        const totalDays = records.length;

        const percentage =
          totalDays > 0
            ? ((presentCount / totalDays) * 100).toFixed(1)
            : 0;

        return (
          <div
            key={student}
            style={{
              marginTop: "25px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
            }}
          >
            <h2>{student}</h2>

            <div
              style={{
                display: "flex",
                gap: "20px",
                marginBottom: "15px",
                flexWrap: "wrap",
              }}
            >
              <p>
                <strong>Present:</strong> {presentCount}
              </p>

              <p>
                <strong>Absent:</strong> {absentCount}
              </p>

              <p>
                <strong>Total Days:</strong> {totalDays}
              </p>

              <p>
                <strong>Attendance %:</strong>{" "}
                {percentage}%
              </p>
            </div>

            <table
              border="1"
              cellPadding="10"
              style={{
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.date}</td>

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

export default AttendanceHistory;
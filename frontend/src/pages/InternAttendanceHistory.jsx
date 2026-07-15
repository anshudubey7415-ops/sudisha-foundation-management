import { useEffect, useState } from "react";
import API from "../api";

function InternAttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Function ko useEffect ke andar move kiya
    const fetchAttendance = async () => {
      try {
        const res = await API.get("/intern-attendance");

        const sortedRecords = res.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setRecords(sortedRecords);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAttendance();
  }, []); // Ab koi error nahi aayega

  const filteredRecords = records.filter(
    (record) =>
      `${record.intern?.name || ""} ${record.intern?.internId || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Intern Attendance History</h1>

      <input
        type="text"
        placeholder="Search Intern..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Intern ID</th>
            <th>Name</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredRecords.map((record) => (
            <tr key={record._id}>
              <td>{record.intern?.internId}</td>
              <td>{record.intern?.name}</td>
              <td>{record.date}</td>
              <td
                style={{
                  color: record.status === "Present" ? "green" : "red",
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
}

export default InternAttendanceHistory;
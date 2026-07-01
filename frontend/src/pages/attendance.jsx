import { useEffect, useState } from "react";
import API from "../api";

function Attendance() {
const [students, setStudents] = useState([]);

useEffect(() => {
fetchStudents();
}, []);

const fetchStudents = async () => {
try {
const res = await API.get("/students");
setStudents(res.data);
} catch (error) {
console.error(error);
}
};

const markAttendance = async (studentId, status) => {
try {
await API.post("/attendance/mark", {
student: studentId,
status,
});


  alert(`Attendance Marked: ${status}`);
} catch (error) {
  console.error(error);
  alert("Error marking attendance");
}


};

return (
<div style={{ padding: "20px" }}> <h1>Attendance Page</h1>


  <table
    border="1"
    cellPadding="10"
    style={{
      borderCollapse: "collapse",
      width: "100%",
      marginTop: "20px",
    }}
  >
    <thead>
      <tr>
        <th>Roll No.</th>
        <th>Student Name</th>
        <th>Class</th>
        <th>Attendance</th>
      </tr>
    </thead>

    <tbody>
      {students.map((student) => (
        <tr key={student._id}>
          <td>{student.rollNumber}</td>

          <td>{student.name}</td>

          <td>{student.class}</td>

          <td>
            <button
              onClick={() =>
                markAttendance(
                  student._id,
                  "Present"
                )
              }
              style={{
                backgroundColor: "green",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Present
            </button>

            <button
              onClick={() =>
                markAttendance(
                  student._id,
                  "Absent"
                )
              }
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
                cursor: "pointer",
                marginLeft: "10px",
              }}
            >
              Absent
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


);
}

export default Attendance;

import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
const [totalStudents, setTotalStudents] = useState(0);
const [totalInterns, setTotalInterns] = useState(0);

const [studentPresent, setStudentPresent] = useState(0);
const [studentAbsent, setStudentAbsent] = useState(0);

const [internPresent, setInternPresent] = useState(0);
const [internAbsent, setInternAbsent] = useState(0);

const [activeInterns, setActiveInterns] = useState(0);
const [completedInterns, setCompletedInterns] = useState(0);

const [overallAttendance, setOverallAttendance] = useState(0);
const [totalAttendanceRecords, setTotalAttendanceRecords] = useState(0);

const [selectedTitle, setSelectedTitle] = useState("");
const [selectedList, setSelectedList] = useState([]);

const [todayStudentRecords, setTodayStudentRecords] = useState([]);
const [todayInternRecords, setTodayInternRecords] = useState([]);

useEffect(() => {
loadDashboard();
}, []);

const loadDashboard = async () => {
try {
const today =
new Date().toISOString().split("T")[0];


  /* Students */

  const studentsRes =
    await API.get("/students");

  setTotalStudents(
    studentsRes.data.length
  );

  /* Student Attendance */

  const attendanceRes =
    await API.get("/attendance");

  const studentAttendance =
    attendanceRes.data;

  const todayStudents =
    studentAttendance.filter(
      (record) =>
        record.date === today
    );

  setTodayStudentRecords(todayStudents);

  const presentStudents =
    todayStudents.filter(
      (record) =>
        record.status === "Present"
    );

  const absentStudents =
    todayStudents.filter(
      (record) =>
        record.status === "Absent"
    );

  setStudentPresent(
    presentStudents.length
  );

  setStudentAbsent(
    absentStudents.length
  );

  /* Interns */

  const internsRes =
    await API.get("/interns");

  const interns =
    internsRes.data;

  setTotalInterns(
    interns.length
  );

  setActiveInterns(
    interns.filter(
      (i) =>
        i.status === "Active"
    ).length
  );

  setCompletedInterns(
    interns.filter(
      (i) =>
        i.status === "Completed"
    ).length
  );

  /* Intern Attendance */

  const internAttendanceRes =
    await API.get(
      "/intern-attendance"
    );

  const internAttendance =
    internAttendanceRes.data;

  const todayInterns =
    internAttendance.filter(
      (record) =>
        record.date === today
    );

  setTodayInternRecords(
    todayInterns
  );

  const presentInterns =
    todayInterns.filter(
      (record) =>
        record.status === "Present"
    );

  const absentInterns =
    todayInterns.filter(
      (record) =>
        record.status === "Absent"
    );

  setInternPresent(
    presentInterns.length
  );

  setInternAbsent(
    absentInterns.length
  );

  /* Foundation Stats */

  const totalRecords =
    studentAttendance.length +
    internAttendance.length;

  const totalPresent =
    studentAttendance.filter(
      (r) =>
        r.status === "Present"
    ).length +
    internAttendance.filter(
      (r) =>
        r.status === "Present"
    ).length;

  setTotalAttendanceRecords(
    totalRecords
  );

  const percentage =
    totalRecords > 0
      ? (
          (totalPresent /
            totalRecords) *
          100
        ).toFixed(1)
      : 0;

  setOverallAttendance(
    percentage
  );
} catch (error) {
  console.error(error);
}


};

const showStudentPresent = () => {
setSelectedTitle(
"Today's Present Students"
);


setSelectedList(
  todayStudentRecords.filter(
    (r) =>
      r.status === "Present"
  )
);


};

const showStudentAbsent = () => {
setSelectedTitle(
"Today's Absent Students"
);


setSelectedList(
  todayStudentRecords.filter(
    (r) =>
      r.status === "Absent"
  )
);


};

const showInternPresent = () => {
setSelectedTitle(
"Today's Present Interns"
);


setSelectedList(
  todayInternRecords.filter(
    (r) =>
      r.status === "Present"
  )
);


};

const showInternAbsent = () => {
setSelectedTitle(
"Today's Absent Interns"
);


setSelectedList(
  todayInternRecords.filter(
    (r) =>
      r.status === "Absent"
  )
);


};

const cardStyle = {
color: "white",
padding: "15px",
borderRadius: "10px",
width: "180px",
textAlign: "center",
cursor: "pointer",
};

return (
<div style={{ padding: "20px" }}> <h1>
Sudisha Foundation Dashboard </h1>


  <h2>
    📚 Student Analytics
  </h2>

  <div
    style={{
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
    }}
  >
    <div
      style={{
        ...cardStyle,
        background: "#2563eb",
      }}
    >
      <h3>
        Total Students
      </h3>

      <h2>
        {totalStudents}
      </h2>
    </div>

    <div
      onClick={
        showStudentPresent
      }
      style={{
        ...cardStyle,
        background: "#16a34a",
      }}
    >
      <h3>
        Present Today
      </h3>

      <h2>
        {studentPresent}
      </h2>
    </div>

    <div
      onClick={
        showStudentAbsent
      }
      style={{
        ...cardStyle,
        background: "#dc2626",
      }}
    >
      <h3>
        Absent Today
      </h3>

      <h2>
        {studentAbsent}
      </h2>
    </div>
  </div>

  <h2
    style={{
      marginTop: "30px",
    }}
  >
    🎓 Intern Analytics
  </h2>

  <div
    style={{
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
    }}
  >
    <div
      style={{
        ...cardStyle,
        background: "#7c3aed",
      }}
    >
      <h3>
        Total Interns
      </h3>

      <h2>
        {totalInterns}
      </h2>
    </div>

    <div
      style={{
        ...cardStyle,
        background: "#0891b2",
      }}
    >
      <h3>
        Active
      </h3>

      <h2>
        {activeInterns}
      </h2>
    </div>

    <div
      style={{
        ...cardStyle,
        background: "#ea580c",
      }}
    >
      <h3>
        Completed
      </h3>

      <h2>
        {completedInterns}
      </h2>
    </div>

    <div
      onClick={
        showInternPresent
      }
      style={{
        ...cardStyle,
        background: "#16a34a",
      }}
    >
      <h3>
        Present Today
      </h3>

      <h2>
        {internPresent}
      </h2>
    </div>

    <div
      onClick={
        showInternAbsent
      }
      style={{
        ...cardStyle,
        background: "#dc2626",
      }}
    >
      <h3>
        Absent Today
      </h3>

      <h2>
        {internAbsent}
      </h2>
    </div>
  </div>

  <h2
    style={{
      marginTop: "30px",
    }}
  >
    🏢 Foundation Overview
  </h2>

  <div
    style={{
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
    }}
  >
    <div
      style={{
        ...cardStyle,
        background: "#0f766e",
      }}
    >
      <h3>
        Total People
      </h3>

      <h2>
        {totalStudents +
          totalInterns}
      </h2>
    </div>

    <div
      style={{
        ...cardStyle,
        background: "#9333ea",
      }}
    >
      <h3>
        Attendance Records
      </h3>

      <h2>
        {totalAttendanceRecords}
      </h2>
    </div>

    <div
      style={{
        ...cardStyle,
        background: "#f59e0b",
      }}
    >
      <h3>
        Overall %
      </h3>

      <h2>
        {overallAttendance}%
      </h2>
    </div>
  </div>

  {selectedList.length >
    0 && (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        border:
          "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2>
        {selectedTitle}
      </h2>

      {selectedList.map(
        (record) => (
          <div
            key={
              record._id
            }
            style={{
              padding:
                "10px",
              borderBottom:
                "1px solid #eee",
            }}
          >
            <strong>
              {record
                .student
                ?.name ||
                record
                  .intern
                  ?.name}
            </strong>
          </div>
        )
      )}
    </div>
  )}
</div>


);
}

export default Dashboard;

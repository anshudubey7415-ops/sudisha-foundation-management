import { Link } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const [showStudents, setShowStudents] = useState(false);
  const [showInterns, setShowInterns] = useState(false);

  return (
    <div>
      {/* Top Navbar */}

      <div
        style={{
          background: "#2563eb",
          padding: "18px",
          display: "flex",
          gap: "40px",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          Dashboard
        </Link>

        <button
          onClick={() =>
            setShowStudents(!showStudents)
          }
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "22px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Students ▼
        </button>

        <button
          onClick={() =>
            setShowInterns(!showInterns)
          }
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "22px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Interns ▼
        </button>
      </div>

      {/* Student Menu */}

      {showStudents && (
        <div
          style={{
            background: "#f3f4f6",
            padding: "10px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Link to="/students">
            Student Details
          </Link>

          <Link to="/add-student">
            Add Student
          </Link>

          <Link to="/attendance">
            Attendance
          </Link>

          <Link to="/attendance-history">
            Attendance History
          </Link>

          <Link to="/date-wise-attendance">
            Date Wise Attendance
          </Link>
        </div>
      )}

      {/* Intern Menu */}

      {showInterns && (
        <div
          style={{
            background: "#f3f4f6",
            padding: "10px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Link to="/interns">
            Intern Details
          </Link>

          <Link to="/add-intern">
            Add Intern
          </Link>

          <Link to="/intern-attendance">
            Intern Attendance
          </Link>

          <Link to="/intern-attendance-history">
            Attendance History
          </Link>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
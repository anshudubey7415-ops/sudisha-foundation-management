import { Link } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const [showStudents, setShowStudents] = useState(false);
  const [showInterns, setShowInterns] = useState(false);
  const [showVolunteers, setShowVolunteers] = useState(false);

  // Dropdown ke andar ke links ke liye common clean style
  const linkStyle = {
    color: "#1e293b",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "15px",
    padding: "4px 0",
    transition: "color 0.2s"
  };

  return (
    <div style={{ width: "100%" }}>

      {/* =====================
          TOP NAVBAR
      ===================== */}
      <div
        style={{
          background: "#2563eb",
          padding: "18px",
          display: "flex",
          gap: "40px",
          alignItems: "center",
          flexWrap: "wrap",
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

        {/* Students Toggle Button */}
        <button
          onClick={() => {
            setShowStudents(!showStudents);
            setShowInterns(false);
            setShowVolunteers(false);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Students {showStudents ? "▲" : "▼"}
        </button>

        {/* Interns Toggle Button */}
        <button
          onClick={() => {
            setShowInterns(!showInterns);
            setShowStudents(false);
            setShowVolunteers(false);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Interns {showInterns ? "▲" : "▼"}
        </button>

        {/* Volunteers Toggle Button */}
        <button
          onClick={() => {
            setShowVolunteers(!showVolunteers);
            setShowStudents(false);
            setShowInterns(false);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Volunteers {showVolunteers ? "▲" : "▼"}
        </button>
      </div>

      {/* =====================
          STUDENTS DROPDOWN MENU
      ===================== */}
      {showStudents && (
        <div
          style={{
            background: "#f3f4f6",
            padding: "12px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderBottom: "1px solid #e5e7eb"
          }}
        >
          <Link to="/students" style={linkStyle}>Student Details</Link>
          <Link to="/add-student" style={linkStyle}>Add Student</Link>
          <Link to="/attendance" style={linkStyle}>Attendance</Link>
          <Link to="/attendance-history" style={linkStyle}>Attendance History</Link>
          <Link to="/date-wise-attendance" style={linkStyle}>Date Wise Attendance</Link>
        </div>
      )}

      {/* =====================
          INTERNS DROPDOWN MENU
      ===================== */}
      {showInterns && (
        <div
          style={{
            background: "#ede9fe",
            padding: "12px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderBottom: "1px solid #ddd6fe"
          }}
        >
          <Link to="/interns" style={linkStyle}>Intern Details</Link>
          <Link to="/add-intern" style={linkStyle}>Add Intern</Link>
          <Link to="/intern-attendance" style={linkStyle}>Intern Attendance</Link>
          <Link to="/intern-attendance-history" style={linkStyle}>Attendance History</Link>
        </div>
      )}

      {/* =====================
          VOLUNTEERS DROPDOWN MENU
      ===================== */}
      {showVolunteers && (
        <div
          style={{
            background: "#ecfdf5",
            padding: "12px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderBottom: "1px solid #a7f3d0"
          }}
        >
          <Link to="/volunteers" style={linkStyle}>Volunteer Details</Link>
          <Link to="/add-volunteer" style={linkStyle}>Add Volunteer</Link>
          <Link to="/volunteer-date-attendance" style={linkStyle}>Date Wise Attendance</Link>
          {/* New Attendance List Option Added Below */}
          <Link to="/volunteer/bulk-attendance" style={linkStyle}>Volunteer Attendance List</Link>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
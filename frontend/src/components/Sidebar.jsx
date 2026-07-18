import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();
  const userRole = localStorage.getItem("role");

  // Royal Blue Theme Logic
  const getLinkStyle = (path) => ({
    color: location.pathname === path ? "#1e3a8a" : "#475569",
    textDecoration: "none",
    fontWeight: location.pathname === path ? "600" : "500",
    fontSize: "14px",
    padding: "12px 30px",
    display: "block",
    backgroundColor: location.pathname === path ? "#eff6ff" : "transparent",
    // Blue Border Left
    borderLeft: location.pathname === path ? "4px solid #1e3a8a" : "4px solid transparent",
    transition: "all 0.2s ease"
  });

  const navButtonStyle = (menuName) => ({
    background: activeMenu === menuName ? "rgba(255,255,255,0.2)" : "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    padding: "10px 20px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s"
  });

  return (
    <div style={{ width: "100%", fontFamily: "'Inter', sans-serif" }}>
      {/* PROFESSIONAL ROYAL BLUE NAVBAR */}
      <div style={{ 
        background: "#1e3a8a", 
        padding: "15px 30px", 
        display: "flex", 
        gap: "20px", 
        alignItems: "center", 
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" 
      }}>
        <Link to="/admin-dashboard" style={{ color: "#ffffff", textDecoration: "none", fontSize: "18px", fontWeight: "700", marginRight: "20px", display: "flex", alignItems: "center" }}>
          🏢 Sudisha Portal
        </Link>
        
        <button onClick={() => setActiveMenu(activeMenu === "students" ? null : "students")} style={navButtonStyle("students")}>
          Students {activeMenu === "students" ? "▲" : "▼"}
        </button>
        <button onClick={() => setActiveMenu(activeMenu === "interns" ? null : "interns")} style={navButtonStyle("interns")}>
          Interns {activeMenu === "interns" ? "▲" : "▼"}
        </button>
        <button onClick={() => setActiveMenu(activeMenu === "volunteers" ? null : "volunteers")} style={navButtonStyle("volunteers")}>
          Volunteers {activeMenu === "volunteers" ? "▲" : "▼"}
        </button>
        
        <Link to="/attendance-report" style={{ 
            color: "#fbbf24", marginLeft: "auto", textDecoration: "none", 
            fontSize: "14px", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" 
        }}>
          📊Attendance Report
        </Link>
      </div>

      {/* DROPDOWNS */}
      {activeMenu && (
        <div style={{ 
          background: "#ffffff", 
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
        }}>
          {activeMenu === "students" && (
            <div>
              <Link to="/students" style={getLinkStyle("/students")}>Student Details</Link>
              {userRole === "admin" && <Link to="/add-student" style={getLinkStyle("/add-student")}>Add Student</Link>}
              <Link to="/attendance" style={getLinkStyle("/attendance")}>Attendance</Link>
              <Link to="/attendance-history" style={getLinkStyle("/attendance-history")}>Attendance History</Link>
            </div>
          )}

          {activeMenu === "interns" && (
            <div>
              <Link to="/interns" style={getLinkStyle("/interns")}>Intern Details</Link>
              {userRole === "admin" && <Link to="/add-intern" style={getLinkStyle("/add-intern")}>Add Intern</Link>}
              <Link to="/intern-attendance" style={getLinkStyle("/intern-attendance")}>Intern Attendance</Link>
              <Link to="/all-projects" style={getLinkStyle("/all-projects")}>All Projects</Link>
              {userRole === "admin" && <Link to="/add-project" style={getLinkStyle("/add-project")}>Assign Project</Link>}
            </div>
          )}

          {activeMenu === "volunteers" && (
            <div>
              <Link to="/volunteers" style={getLinkStyle("/volunteers")}>Volunteer Details</Link>
              {userRole === "admin" && <Link to="/add-volunteer" style={getLinkStyle("/add-volunteer")}>Add Volunteer</Link>}
              <Link to="/volunteer-date-attendance" style={getLinkStyle("/volunteer-date-attendance")}>Attendance History</Link>
              {userRole === "admin" && <Link to="/volunteer/bulk-attendance" style={getLinkStyle("/volunteer/bulk-attendance")}>Bulk Attendance</Link>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

// ======= STUDENTS COMPONENTS =======
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import Attendance from "./pages/Attendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import DateWiseAttendance from "./pages/DateWiseAttendance";

// ======= INTERNS COMPONENTS =======
import Interns from "./pages/Interns";
import AddIntern from "./pages/AddIntern";
import InternAttendance from "./pages/InternAttendance";
import InternAttendanceHistory from "./pages/InternAttendanceHistory";

// ======= VOLUNTEERS COMPONENTS =======
import Volunteers from "./pages/Volunteers";
import VolunteerProfile from "./pages/VolunteerProfile";
import VolunteerAllHistory from "./pages/VolunteerAllHistory";
import AddVolunteer from "./pages/AddVolunteer";
import VolunteerAttendance from "./pages/VolunteerAttendance";
import VolunteerAttendanceHistory from "./pages/VolunteerAttendanceHistory"; 
import VolunteerIdCard from "./pages/VolunteerIdCard";
import EditVolunteer from "./pages/EditVolunteer";

// ======= DASHBOARD =======
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Navbar / Dropdown Sidebar Menu */}
      <Sidebar />

      {/* Main Content Render Area */}
      <div style={{ flex: 1, padding: "20px", background: "#f8fafc" }}>
        <Routes>
          {/* Dashboard Home Route */}
          <Route path="/" element={<Dashboard />} />

          {/* ==========================================
              STUDENTS ROUTES
             ========================================== */}
          <Route path="/students" element={<Students />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance-history" element={<AttendanceHistory />} />
          <Route path="/date-wise-attendance" element={<DateWiseAttendance />} />

          {/* ==========================================
              INTERNS ROUTES
             ========================================== */}
          <Route path="/interns" element={<Interns />} />
          <Route path="/add-intern" element={<AddIntern />} />
          <Route path="/intern-attendance" element={<InternAttendance />} />
          <Route path="/intern-attendance-history" element={<InternAttendanceHistory />} />

          {/* ==========================================
              VOLUNTEERS ROUTES
             ========================================== */}
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/add-volunteer" element={<AddVolunteer />} />
          <Route path="/volunteer/:id" element={<VolunteerProfile />} />
          <Route path="/volunteer-date-attendance" element={<VolunteerAllHistory />} />
          <Route path="/volunteer-attendance/:id" element={<VolunteerAttendance />} />
          <Route path="/volunteer-history/:id" element={<VolunteerAttendanceHistory />} />
          <Route path="/volunteer-id/:id" element={<VolunteerIdCard />} />
          <Route path="/edit-volunteer/:id" element={<EditVolunteer />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
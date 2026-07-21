import { Routes, Route, Navigate, useLocation } from "react-router-dom"; 
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login"; 
import ProtectedRoute from "./components/ProtectedRoute"; 

// Pages Imports
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import MyRequests from "./pages/MyRequests";
import AdminRequests from "./pages/AdminRequests";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentProfile from "./pages/StudentProfile";
import EditStudent from "./pages/EditStudent"; 
import Attendance from "./pages/Attendance";
import StudentIdCard from './pages/StudentIdCard';
import AttendanceHistory from "./pages/AttendanceHistory";
import DateWiseAttendance from "./pages/DateWiseAttendance";
import Interns from "./pages/Interns";
import AddIntern from "./pages/AddIntern";
import InternAttendance from "./pages/InternAttendance";
import InternAttendanceHistory from "./pages/InternAttendanceHistory";
import InternProfile from "./pages/InternProfile";
import InternIdCard from "./pages/InternIdCard";
import OfferLetter from "./pages/OfferLetter";
import InternCertificate from "./pages/InternCertificate";
import EditIntern from "./pages/EditIntern";
import AddProject from "./pages/AddProject";
import AllProjects from "./pages/AllProjects";
import EditProject from "./pages/EditProject";
import Volunteers from "./pages/Volunteers";
import VolunteerProfile from "./pages/VolunteerProfile";
import VolunteerAllHistory from "./pages/VolunteerAllHistory";
import AddVolunteer from "./pages/AddVolunteer";
import VolunteerAttendance from "./pages/VolunteerAttendance";
import VolunteerAttendanceHistory from "./pages/VolunteerAttendanceHistory"; 
import VolunteerIdCard from "./pages/VolunteerIdCard";
import EditVolunteer from "./pages/EditVolunteer";
import VolunteerAttendanceBulk from './pages/VolunteerAttendanceBulk';
import Settings from "./pages/Settings";
import AllAnnouncements from "./pages/AllAnnouncements";
import AttendanceReport from "./pages/AttendanceReport";
// Naya import
import UserList from "./components/UserList"; 

function App() {
  const location = useLocation();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {location.pathname !== "/login" && <Sidebar />}

      <div style={{ flex: 1, padding: "20px" }} className="main-content">
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/admin-dashboard" />} />

          {/* Dashboards */}
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/manager-dashboard" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/admin-requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminRequests /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute allowedRoles={['manager']}><MyRequests /></ProtectedRoute>} />
          
          {/* User Management Route */}
          <Route path="/user-management" element={<ProtectedRoute allowedRoles={['admin']}><UserList /></ProtectedRoute>} />

          {/* Settings & Announcements */}
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Settings /></ProtectedRoute>} />
          <Route path="/all-announcements" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AllAnnouncements /></ProtectedRoute>} />
          <Route path="/attendance-report" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AttendanceReport /></ProtectedRoute>} />

          {/* PROJECTS */}
          <Route path="/all-projects" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AllProjects /></ProtectedRoute>} />
          <Route path="/edit-project/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><EditProject /></ProtectedRoute>} />
          <Route path="/add-project" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AddProject /></ProtectedRoute>} />

          {/* STUDENTS */}
          <Route path="/students" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Students /></ProtectedRoute>} />
          <Route path="/add-student" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AddStudent /></ProtectedRoute>} />
          <Route path="/student/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/edit-student/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><EditStudent /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Attendance /></ProtectedRoute>} />
          <Route path="/student/id-card/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><StudentIdCard /></ProtectedRoute>} />
          <Route path="/attendance-history" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AttendanceHistory /></ProtectedRoute>} />
          <Route path="/date-wise-attendance" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DateWiseAttendance /></ProtectedRoute>} />

          {/* INTERNS */}
          <Route path="/interns" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Interns /></ProtectedRoute>} />
          <Route path="/add-intern" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AddIntern /></ProtectedRoute>} />
          <Route path="/intern/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><InternProfile /></ProtectedRoute>} />
          <Route path="/intern-id/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><InternIdCard /></ProtectedRoute>} />
          <Route path="/offer-letter/:id" element={<ProtectedRoute allowedRoles={['admin']}><OfferLetter /></ProtectedRoute>} />
          <Route path="/intern-certificate/:id" element={<ProtectedRoute allowedRoles={['admin']}><InternCertificate /></ProtectedRoute>} />
          <Route path="/edit-intern/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><EditIntern /></ProtectedRoute>} />
          <Route path="/intern-attendance" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><InternAttendance /></ProtectedRoute>} />
          <Route path="/intern-attendance-history" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><InternAttendanceHistory /></ProtectedRoute>} />

          {/* VOLUNTEERS */}
          <Route path="/volunteers" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Volunteers /></ProtectedRoute>} />
          <Route path="/add-volunteer" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AddVolunteer /></ProtectedRoute>} />
          <Route path="/volunteer/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><VolunteerProfile /></ProtectedRoute>} />
          <Route path="/volunteer-date-attendance" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><VolunteerAllHistory /></ProtectedRoute>} />
          <Route path="/volunteer-attendance/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><VolunteerAttendance /></ProtectedRoute>} />
          <Route path="/volunteer-history/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><VolunteerAttendanceHistory /></ProtectedRoute>} />
          <Route path="/volunteer-id/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><VolunteerIdCard /></ProtectedRoute>} />
          <Route path="/edit-volunteer/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><EditVolunteer /></ProtectedRoute>} />
          <Route path="/volunteer/bulk-attendance" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><VolunteerAttendanceBulk /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
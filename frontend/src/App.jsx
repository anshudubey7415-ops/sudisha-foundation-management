import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { ThemeProvider } from "./context/ThemeContext";

// ======= STUDENTS COMPONENTS =======
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentProfile from "./pages/StudentProfile";
import Attendance from "./pages/Attendance";
import StudentIdCard from './pages/StudentIdCard';
import AttendanceHistory from "./pages/AttendanceHistory";
import DateWiseAttendance from "./pages/DateWiseAttendance";

// ======= INTERNS COMPONENTS =======
import Interns from "./pages/Interns";
import AddIntern from "./pages/AddIntern";
import InternAttendance from "./pages/InternAttendance";
import InternAttendanceHistory from "./pages/InternAttendanceHistory";
import InternProfile from "./pages/InternProfile";
import InternIdCard from "./pages/InternIdCard";
import OfferLetter from "./pages/OfferLetter";
import InternCertificate from "./pages/InternCertificate";
import EditIntern from "./pages/EditIntern";

// ======= VOLUNTEERS COMPONENTS =======
import Volunteers from "./pages/Volunteers";
import VolunteerProfile from "./pages/VolunteerProfile";
import VolunteerAllHistory from "./pages/VolunteerAllHistory";
import AddVolunteer from "./pages/AddVolunteer";
import VolunteerAttendance from "./pages/VolunteerAttendance";
import VolunteerAttendanceHistory from "./pages/VolunteerAttendanceHistory"; 
import VolunteerIdCard from "./pages/VolunteerIdCard";
import EditVolunteer from "./pages/EditVolunteer";
import VolunteerAttendanceBulk from './pages/VolunteerAttendanceBulk';

// ======= DASHBOARD & SETTINGS =======
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

function App() {
  return (
    <ThemeProvider>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top Navbar / Dropdown Sidebar Menu */}
        <Sidebar />

        {/* Main Content Render Area */}
        <div style={{ flex: 1, padding: "20px" }} className="main-content">
          <Routes>
            {/* Dashboard Home Route */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Settings Route */}
            <Route path="/settings" element={<Settings />} />

            {/* ==========================================
                STUDENTS ROUTES
                ========================================== */}
            <Route path="/students" element={<Students />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/student/id-card/:id" element={<StudentIdCard />} />
            <Route path="/attendance-history" element={<AttendanceHistory />} />
            <Route path="/date-wise-attendance" element={<DateWiseAttendance />} />

            {/* ==========================================
                INTERNS ROUTES
                ========================================== */}
            <Route path="/interns" element={<Interns />} />
            <Route path="/add-intern" element={<AddIntern />} />
            <Route path="/intern/:id" element={<InternProfile />} />
            <Route path="/intern-id/:id" element={<InternIdCard />} />
            <Route path="/offer-letter/:id" element={<OfferLetter />} />
            <Route path="/intern-certificate/:id" element={<InternCertificate />} />
            <Route path="/edit-intern/:id" element={<EditIntern />} />
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
            <Route path="/volunteer/bulk-attendance" element={<VolunteerAttendanceBulk />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
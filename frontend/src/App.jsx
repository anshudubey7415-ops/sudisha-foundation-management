import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";


import CertificateVerification
from "./pages/CertificateVerification";

/* Students */
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import StudentProfile from "./pages/StudentProfile";
import StudentIdCard from "./pages/StudentIdCard";
import Attendance from "./pages/Attendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import DateWiseAttendance from "./pages/DateWiseAttendance";

/* Interns */
import Interns from "./pages/Interns";
import AddIntern from "./pages/AddIntern";
import EditIntern from "./pages/EditIntern";
import InternProfile from "./pages/InternProfile";
import InternIdCard from "./pages/InternIdCard";
import InternAttendance from "./pages/InternAttendance";
import InternAttendanceHistory from "./pages/InternAttendanceHistory";

import InternCertificate from "./pages/InternCertificate";
import OfferLetter from "./pages/OfferLetter";

/* Menus */
import Sidebar from "./components/Sidebar";

function App() {
return (
<div style={{ display: "flex" }}> <Sidebar />


  <div
    style={{
      flex: 1,
      padding: "20px",
    }}
  >
    <Routes>

      <Route
        path="/"
        element={<Dashboard />}
      />

      {/* Students */}

      <Route
        path="/students"
        element={<Students />}
      />

      <Route
        path="/add-student"
        element={<AddStudent />}
      />

      <Route
        path="/edit-student/:id"
        element={<EditStudent />}
      />

      <Route
        path="/student/:id"
        element={<StudentProfile />}
      />

      <Route
        path="/student-id/:id"
        element={<StudentIdCard />}
      />

      <Route
        path="/attendance"
        element={<Attendance />}
      />

      <Route
        path="/attendance-history"
        element={<AttendanceHistory />}
      />

      <Route
        path="/date-wise-attendance"
        element={<DateWiseAttendance />}
      />

      {/* Interns */}

      <Route
        path="/interns"
        element={<Interns />}
      />

      <Route
        path="/add-intern"
        element={<AddIntern />}
      />

      <Route
        path="/edit-intern/:id"
        element={<EditIntern />}
      />

      <Route
        path="/intern/:id"
        element={<InternProfile />}
      />

      <Route
        path="/intern-id/:id"
        element={<InternIdCard />}
      />

      <Route
        path="/intern-attendance"
        element={<InternAttendance />}
      />

      <Route
        path="/intern-attendance-history"
        element={<InternAttendanceHistory />}
      />

      {/* New Features */}

      <Route
        path="/intern-certificate/:id"
        element={<InternCertificate />}
      />

      <Route
        path="/offer-letter/:id"
        element={<OfferLetter />}
      />
      
      

     <Route
  path="/verify/:certificateNumber"
  element={
    <CertificateVerification />
  }
/>

    </Routes>
  </div>
</div>


);
}

export default App;

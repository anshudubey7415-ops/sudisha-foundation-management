import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function InternProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [intern, setIntern] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    // Functions ko useEffect ke andar define aur call kiya
    const fetchIntern = async () => {
      try {
        const res = await API.get(`/interns/${id}`);
        setIntern(res.data);
      } catch (error) {
        console.error("Error fetching intern:", error);
      }
    };

    const fetchAttendance = async () => {
      try {
        const res = await API.get("/intern-attendance");
        const records = res.data.filter((record) => record.intern?._id === id);
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendance(records);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchIntern();
    fetchAttendance();
  }, [id]); // id dependency add ki

  const uploadPhoto = async () => {
    if (!photo) {
      alert("Please select a photo");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photo", photo);

      await API.post(`/interns/upload/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Photo Uploaded Successfully");
      // Note: Yahan re-fetch ke liye fetchIntern ko component scope mein lana padega
      // ya phir setIntern ka logic alag handle karna padega.
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Photo Upload Failed");
    }
  };

  if (!intern) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Intern Profile</h1>
      {/* Rest of your JSX remains the same */}
      <div style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "20px", background: "#f9fafb", maxWidth: "1000px" }}>
        
        {/* Photo Section */}
        {intern.photo ? (
          <img
            src={`http://localhost:5000/uploads/${intern.photo}`}
            alt="Intern"
            style={{ width: "160px", height: "160px", borderRadius: "50%", objectFit: "cover", border: "4px solid #2563eb", marginBottom: "15px" }}
          />
        ) : (
          <div style={{ width: "160px", height: "160px", borderRadius: "50%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}>No Photo</div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
          <button onClick={uploadPhoto} style={{ marginLeft: "10px", background: "#2563eb", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}>Upload Photo</button>
        </div>

        <h2>{intern.internId} - {intern.name}</h2>
        <p><strong>College:</strong> {intern.college}</p>
        <p><strong>Course:</strong> {intern.course}</p>
        <p><strong>Email:</strong> {intern.email}</p>
        <p><strong>Phone:</strong> {intern.phone}</p>
        <p><strong>Address:</strong> {intern.address}</p>
        <p><strong>Department:</strong> {intern.department}</p>
        <p><strong>Mentor:</strong> {intern.mentor}</p>
        <p><strong>Start Date:</strong> {intern.startDate}</p>
        <p><strong>End Date:</strong> {intern.endDate}</p>
        <p><strong>Status:</strong> <span style={{ color: intern.status === "Active" ? "green" : "red", fontWeight: "bold" }}>{intern.status}</span></p>

        <hr />
        <h2>Attendance Summary</h2>
        <p><strong>Present Days:</strong> {intern.presentDays || 0}</p>
        <p><strong>Total Days:</strong> {intern.totalAttendanceDays || 0}</p>
        <p><strong>Attendance Percentage:</strong> {intern.attendancePercentage || 0}%</p>

        <hr />
        <button onClick={() => navigate(`/intern-id/${intern._id}`)} style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", marginBottom: "20px" }}>Generate ID Card</button>

        <hr />
        <h2>Attendance History</h2>
        {attendance.length === 0 ? <p>No Attendance Records Found</p> : (
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td>{record.date}</td>
                  <td style={{ color: record.status === "Present" ? "green" : "red", fontWeight: "bold" }}>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default InternProfile;
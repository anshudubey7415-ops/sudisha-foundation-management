import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function VolunteerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDateString = (dateVal) => {
    if (!dateVal) return "—";
    return dateVal.split("T")[0];
  };

  // IIFE pattern use kiya hai, koi extra useCallback ki zaroorat nahi
  useEffect(() => {
    const fetchVolunteer = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/volunteers/${id}`);
        setVolunteer(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load volunteer profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [id]); // Bas 'id' dependecy rakhi hai

  const btnStyle = (color) => ({
    background: color,
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  });

  if (loading) return <div style={{ padding: "20px" }}><h2>Loading Volunteer Profile...</h2></div>;
  if (error) return <div style={{ padding: "20px" }}><h2>{error}</h2><button onClick={() => navigate(-1)}>Go Back</button></div>;
  if (!volunteer) return <div style={{ padding: "20px" }}><h2>Volunteer record not found.</h2></div>;

  return (
    <div style={{ padding: "25px" }}>
      <h1 style={{ marginBottom: "20px" }}>Volunteer Profile</h1>
      <div style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "25px", background: "#f9fafb", maxWidth: "800px" }}>
        <h2>{volunteer.volunteerId || "N/A"} - {volunteer.name}</h2>
        <hr />
        <p><strong>Gender :</strong> {volunteer.gender || "—"}</p>
        <p><strong>Phone :</strong> {volunteer.phone || "—"}</p>
        <p><strong>Email :</strong> {volunteer.email || "—"}</p>
        <p><strong>Education :</strong> {volunteer.education || "—"}</p>
        <p><strong>Joining Date :</strong> {formatDateString(volunteer.joiningDate)}</p>
        <p><strong>Address :</strong> {volunteer.address || "—"}</p>
        <hr />
        <h3>Volunteer Statistics</h3>
        <p><strong>Present Days :</strong> {volunteer.presentDays ?? 0}</p>
        <p><strong>Total Attendance :</strong> {volunteer.totalAttendanceDays ?? 0}</p>
        <p><strong>Attendance % :</strong> {volunteer.attendancePercentage ?? 0}%</p>
        <p><strong>Total Hours :</strong> {volunteer.totalHours ?? 0}</p>
        <p><strong>Badge :</strong> <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{volunteer.badge || "None"}</span></p>
        <p><strong>Status :</strong> <span style={{ color: volunteer.status === "Active" ? "green" : "red", fontWeight: "bold" }}>{volunteer.status || "Inactive"}</span></p>
        <hr />
        <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button style={btnStyle("#f59e0b")} onClick={() => navigate(`/volunteer-attendance/${volunteer._id}`)}>Attendance</button>
          <button style={btnStyle("#7c3aed")} onClick={() => navigate(`/volunteer-history/${volunteer._id}`)}>Attendance History</button>
          <button style={btnStyle("#16a34a")} onClick={() => navigate(`/volunteer-id/${volunteer._id}`)}>Volunteer ID Card</button>
          <button style={btnStyle("#2563eb")} onClick={() => navigate(`/edit-volunteer/${volunteer._id}`)}>Edit Volunteer</button>
        </div>
      </div>
    </div>
  );
}

export default VolunteerProfile;
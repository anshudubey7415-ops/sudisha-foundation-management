import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function VolunteerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Safe Date Formatter helper function
  const formatDateString = (dateVal) => {
    if (!dateVal) return "—";
    return dateVal.split("T")[0];
  };

  // Wrapped inside useCallback to eliminate continuous re-render triggers
  const fetchVolunteer = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/volunteers/${id}`);
      setVolunteer(res.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load volunteer profile details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVolunteer();
  }, [fetchVolunteer]);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Loading Volunteer Profile...</h2>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Volunteer record not found.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "25px" }}>
      <h1 style={{ marginBottom: "20px" }}>Volunteer Profile</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "25px",
          background: "#f9fafb",
          maxWidth: "800px",
        }}
      >
        <h2>
          {volunteer.volunteerId || "N/A"} - {volunteer.name}
        </h2>

        <hr />

        <p>
          <strong>Gender :</strong> {volunteer.gender || "—"}
        </p>

        <p>
          <strong>Phone :</strong> {volunteer.phone || "—"}
        </p>

        <p>
          <strong>Email :</strong> {volunteer.email || "—"}
        </p>

        <p>
          <strong>Education :</strong> {volunteer.education || "—"}
        </p>

        <p>
          <strong>Joining Date :</strong> {formatDateString(volunteer.joiningDate)}
        </p>

        <p>
          <strong>Address :</strong> {volunteer.address || "—"}
        </p>

        <hr />

        <h3>Volunteer Statistics</h3>

        <p>
          <strong>Present Days :</strong> {volunteer.presentDays ?? 0}
        </p>

        <p>
          <strong>Total Attendance :</strong> {volunteer.totalAttendanceDays ?? 0}
        </p>

        <p>
          <strong>Attendance % :</strong> {volunteer.attendancePercentage ?? 0}%
        </p>

        <p>
          <strong>Total Hours :</strong> {volunteer.totalHours ?? 0}
        </p>

        <p>
          <strong>Badge :</strong>{" "}
          <span
            style={{
              color: "#f59e0b",
              fontWeight: "bold",
            }}
          >
            {volunteer.badge || "None"}
          </span>
        </p>

        <p>
          <strong>Status :</strong>{" "}
          <span
            style={{
              color: volunteer.status === "Active" ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {volunteer.status || "Inactive"}
          </span>
        </p>

        <hr />

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* FIXED: Paths updated to match exact kebab-case config of App.jsx */}
          <button
            onClick={() => navigate(`/volunteer-attendance/${volunteer._id}`)}
            style={{
              background: "#f59e0b",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Attendance
          </button>

          <button
            onClick={() => navigate(`/volunteer-history/${volunteer._id}`)}
            style={{
              background: "#7c3aed",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Attendance History
          </button>

          <button
            onClick={() => navigate(`/volunteer-id/${volunteer._id}`)}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Volunteer ID Card
          </button>

          <button
            onClick={() => navigate(`/edit-volunteer/${volunteer._id}`)}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Edit Volunteer
          </button>
        </div>
      </div>
    </div>
  );
}

export default VolunteerProfile;
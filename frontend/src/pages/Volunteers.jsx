import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Wrapped fetchVolunteers into useCallback to satisfy React dependency rules safely
  const fetchVolunteers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch (error) {
      console.error("Error fetching volunteers list:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const deleteVolunteer = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this volunteer?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/volunteers/${id}`);
      alert("Volunteer Deleted Successfully");
      fetchVolunteers();
    } catch (error) {
      console.error(error);
      alert("Error deleting volunteer. Please try again.");
    }
  };

  // FIXED: Wrapped filter operations with useMemo to maximize search performance
  const filteredVolunteers = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return volunteers;

    return volunteers.filter((volunteer) => {
      const vId = String(volunteer.volunteerId ?? "").toLowerCase();
      const name = String(volunteer.name ?? "").toLowerCase();
      const phone = String(volunteer.phone ?? "").toLowerCase();
      const email = String(volunteer.email ?? "").toLowerCase();

      return (
        vId.includes(query) ||
        name.includes(query) ||
        phone.includes(query) ||
        email.includes(query)
      );
    });
  }, [volunteers, searchTerm]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Volunteers</h1>

      <input
        type="text"
        placeholder="Search Volunteer by Name, ID, Phone or Email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          display: "block"
        }}
      />

      {loading ? (
        <h2>Loading Volunteers List...</h2>
      ) : filteredVolunteers.length === 0 ? (
        <p>No Volunteer Found</p>
      ) : (
        filteredVolunteers.map((volunteer) => (
          <div
            key={volunteer._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "15px",
              marginBottom: "15px",
              background: "#f9fafb",
              maxWidth: "800px"
            }}
          >
            <h2>
              {volunteer.volunteerId || "N/A"} - {volunteer.name}
            </h2>

            <p>
              <strong>Phone:</strong> {volunteer.phone || "—"}
            </p>

            <p>
              <strong>Email:</strong> {volunteer.email || "—"}
            </p>

            <p>
              <strong>Education:</strong> {volunteer.education || "—"}
            </p>

            <p>
              <strong>Total Hours:</strong> {volunteer.totalHours || 0}
            </p>

            <p>
              <strong>Badge:</strong>{" "}
              <span style={{ color: "#f59e0b", fontWeight: "bold" }}>
                {volunteer.badge || "None"}
              </span>
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: volunteer.status === "Active" ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {volunteer.status || "Inactive"}
              </span>
            </p>

            <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate(`/volunteer/${volunteer._id}`)}
                style={{
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Profile
              </button>

              <button
                onClick={() => navigate(`/volunteer-id/${volunteer._id}`)}
                style={{
                  background: "#7c3aed",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                ID Card
              </button>

              <button
                onClick={() => navigate(`/volunteer-attendance/${volunteer._id}`)}
                style={{
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Attendance
              </button>

              <button
                onClick={() => navigate(`/edit-volunteer/${volunteer._id}`)}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>

              <button
                onClick={() => deleteVolunteer(volunteer._id)}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Volunteers;
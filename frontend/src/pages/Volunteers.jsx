import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // IIFE pattern use kiya taaki koi cascading render warning na aaye
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        const res = await API.get("/volunteers");
        setVolunteers(res.data || []);
      } catch (error) {
        console.error("Error fetching volunteers list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []); // Empty dependency array for initial fetch

  const deleteVolunteer = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this volunteer?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/volunteers/${id}`);
      alert("Volunteer Deleted Successfully");
      // List refresh karne ke liye state update
      setVolunteers((prev) => prev.filter((v) => v._id !== id));
    } catch (error) {
      console.error(error);
      alert("Error deleting volunteer. Please try again.");
    }
  };

  const filteredVolunteers = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return volunteers;

    return volunteers.filter((volunteer) => {
      const vId = String(volunteer.volunteerId ?? "").toLowerCase();
      const name = String(volunteer.name ?? "").toLowerCase();
      const phone = String(volunteer.phone ?? "").toLowerCase();
      const email = String(volunteer.email ?? "").toLowerCase();

      return vId.includes(query) || name.includes(query) || phone.includes(query) || email.includes(query);
    });
  }, [volunteers, searchTerm]);

  // Button style helper for cleaner code
  const btnStyle = (bg) => ({
    background: bg, color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer"
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Volunteers</h1>
      <input
        type="text"
        placeholder="Search Volunteer by Name, ID, Phone or Email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", maxWidth: "500px", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "20px", display: "block" }}
      />

      {loading ? (
        <h2>Loading Volunteers List...</h2>
      ) : filteredVolunteers.length === 0 ? (
        <p>No Volunteer Found</p>
      ) : (
        filteredVolunteers.map((volunteer) => (
          <div key={volunteer._id} style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "15px", marginBottom: "15px", background: "#f9fafb", maxWidth: "800px" }}>
            <h2>{volunteer.volunteerId || "N/A"} - {volunteer.name}</h2>
            <p><strong>Phone:</strong> {volunteer.phone || "—"}</p>
            <p><strong>Email:</strong> {volunteer.email || "—"}</p>
            <p><strong>Total Hours:</strong> {volunteer.totalHours || 0}</p>
            <p><strong>Status:</strong> <span style={{ color: volunteer.status === "Active" ? "green" : "red", fontWeight: "bold" }}>{volunteer.status || "Inactive"}</span></p>
            
            <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button style={btnStyle("#16a34a")} onClick={() => navigate(`/volunteer/${volunteer._id}`)}>Profile</button>
              <button style={btnStyle("#7c3aed")} onClick={() => navigate(`/volunteer-id/${volunteer._id}`)}>ID Card</button>
              <button style={btnStyle("#f59e0b")} onClick={() => navigate(`/volunteer-attendance/${volunteer._id}`)}>Attendance</button>
              <button style={btnStyle("#2563eb")} onClick={() => navigate(`/edit-volunteer/${volunteer._id}`)}>Edit</button>
              <button style={btnStyle("#dc2626")} onClick={() => deleteVolunteer(volunteer._id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Volunteers;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Interns() {
  const [interns, setInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Function ko useEffect ke andar move kar diya
    const fetchInterns = async () => {
      try {
        const res = await API.get("/interns");
        setInterns(res.data);
      } catch (error) {
        console.error("Error fetching interns:", error);
      }
    };

    fetchInterns();
  }, []); // Empty dependency array

  const deleteIntern = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this intern?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/interns/${id}`);
      alert("Intern Deleted Successfully");
      
      // Refresh list after deletion
      // Yahan fetchInterns ab scope mein nahi hai, isliye 
      // best hoga ki hum state se filter kar dein
      setInterns(interns.filter(intern => intern._id !== id));
    } catch (error) {
      console.error(error);
      alert("Error deleting intern");
    }
  };

  const filteredInterns = interns.filter((intern) =>
    `${intern.internId} ${intern.name} ${intern.department} ${intern.college}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Intern Management</h1>

      <input
        type="text"
        placeholder="Search Intern..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          fontSize: "16px",
        }}
      />

      {filteredInterns.length === 0 ? (
        <p>No Intern Found</p>
      ) : (
        filteredInterns.map((intern) => {
          const today = new Date();
          const endDate = new Date(intern.endDate);
          const isCompleted = today > endDate;

          return (
            <div
              key={intern._id}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "20px",
                backgroundColor: "#f9fafb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h2>{intern.internId} - {intern.name}</h2>
              <p><strong>Department:</strong> {intern.department}</p>
              <p><strong>College:</strong> {intern.college}</p>
              <p><strong>Email:</strong> {intern.email}</p>
              <p><strong>Phone:</strong> {intern.phone}</p>
              <p><strong>Internship Duration:</strong> {intern.startDate} to {intern.endDate}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span style={{ color: isCompleted ? "#dc2626" : "#16a34a", fontWeight: "bold" }}>
                  {isCompleted ? "Completed" : "Active"}
                </span>
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
                <button onClick={() => navigate(`/intern/${intern._id}`)} style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer" }}>Profile</button>
                <button onClick={() => navigate(`/intern-id/${intern._id}`)} style={{ background: "#7c3aed", color: "white", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer" }}>ID Card</button>
                <button onClick={() => navigate(`/offer-letter/${intern._id}`)} style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer" }}>Offer Letter</button>
                <button onClick={() => navigate(`/intern-certificate/${intern._id}`)} style={{ background: "#f59e0b", color: "white", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer" }}>Certificate</button>
                <button onClick={() => navigate(`/edit-intern/${intern._id}`)} style={{ background: "#0ea5e9", color: "white", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer" }}>Edit</button>
                <button onClick={() => deleteIntern(intern._id)} style={{ background: "#dc2626", color: "white", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Interns;
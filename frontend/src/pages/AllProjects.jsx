import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Layout from "../components/Layout";

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects", err);
      }
    };
    fetchProjects();
  }, []);

  // Delete function
  const deleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await API.delete(`/projects/${id}`);
        setProjects(projects.filter(p => p._id !== id));
        alert("Project Deleted Successfully!");
      } catch (err) {
        console.error("Error deleting project", err);
        alert("Failed to delete project");
      }
    }
  };

  return (
    <Layout title="All Projects">
      <div style={{ padding: "20px" }}>
        <h2 style={{ color: "#1e3a8a", marginBottom: "20px" }}>📋 Current Projects</h2>
        <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {projects.map(p => (
            <div 
              key={p._id} 
              style={{ 
                padding: "20px", 
                background: "white", 
                borderRadius: "8px", 
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
                borderLeft: `5px solid ${p.status === "Completed" ? "#22c55e" : "#2563eb"}` 
              }}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>{p.title}</h3>
              <p style={{ color: "#666", fontSize: "14px" }}>{p.description}</p>
              <div style={{ fontSize: "13px", color: "#334155", margin: "10px 0" }}>
                <p>📅 <strong>Timeline:</strong> {p.startDate ? new Date(p.startDate).toLocaleDateString() : "N/A"} - {p.endDate ? new Date(p.endDate).toLocaleDateString() : "N/A"}</p>
                <p>
                  🟢 <strong>Status:</strong> 
                  <span style={{ color: p.status === "Completed" ? "#22c55e" : "#eab308", fontWeight: "bold", marginLeft: "5px" }}>
                    {p.status}
                  </span>
                </p>
              </div>
              
              <div style={{ marginTop: "15px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                <strong>Assigned Candidates ({p.members?.length || 0}):</strong>
                <div style={{ maxHeight: "150px", overflowY: "auto", marginTop: "5px" }}>
                  {p.members?.map((m, index) => (
                    <div key={index} style={{ padding: "5px 0", fontSize: "12px", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontWeight: "600" }}>{m.memberModel}:</span> ID {m.memberId?.toString().slice(-4)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit aur Delete Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button 
                  onClick={() => navigate(`/edit-project/${p._id}`)}
                  style={{ flex: 1, padding: "8px", background: "#f59e0b", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => deleteProject(p._id)}
                  style={{ flex: 1, padding: "8px", background: "#ef4444", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AllProjects;
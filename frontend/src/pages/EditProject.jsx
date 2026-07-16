import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import Layout from "../components/Layout";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({ 
    title: "", 
    description: "", 
    startDate: "", 
    endDate: "", 
    status: "Active", 
    members: [] 
  });
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, sRes, iRes, vRes] = await Promise.all([
          API.get(`/projects/${id}`),
          API.get("/students"),
          API.get("/interns"),
          API.get("/volunteers")
        ]);
        
        // Date formatting fixed for input type="date"
        const data = projRes.data;
        setProject({
          ...data,
          startDate: data.startDate ? data.startDate.split('T')[0] : "",
          endDate: data.endDate ? data.endDate.split('T')[0] : "",
          members: data.members || []
        });

        const formatData = (items, type) => 
          items.filter(m => m.status === "Active").map(m => ({
            id: m._id,
            label: `${m.name} (ID: ${m._id.slice(-4)}) [${type}]`,
            type: type
          }));

        setOptions([
          ...formatData(sRes.data, "Student"),
          ...formatData(iRes.data, "Intern"),
          ...formatData(vRes.data, "Volunteer")
        ]);
      } catch (err) {
        console.error("Error loading project:", err);
      }
    };
    fetchData();
  }, [id]);

  const toggleMember = (member) => {
    setProject(prev => {
      const exists = prev.members.find(m => m.memberId === member.id);
      if (exists) {
        return { ...prev, members: prev.members.filter(m => m.memberId !== member.id) };
      } else {
        return { ...prev, members: [...prev.members, { memberId: member.id, memberModel: member.type }] };
      }
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/projects/${id}`, project);
      alert("Project Updated Successfully!");
      navigate("/all-projects");
    } catch (err) {
      alert("Error updating project");
      console.error(err);
    }
  };

  return (
    <Layout title="Edit Project">
      <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", background: "white", borderRadius: "8px" }}>
        <h2>✏️ Edit Project & Members</h2>
        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input value={project.title} placeholder="Title" onChange={e => setProject({...project, title: e.target.value})} style={{ padding: "10px" }} />
          <textarea value={project.description} placeholder="Description" onChange={e => setProject({...project, description: e.target.value})} style={{ padding: "10px" }} />
          
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="date" value={project.startDate} onChange={e => setProject({...project, startDate: e.target.value})} style={{ flex: 1, padding: "10px" }} />
            <input type="date" value={project.endDate} onChange={e => setProject({...project, endDate: e.target.value})} style={{ flex: 1, padding: "10px" }} />
          </div>

          <label><strong>Update Status:</strong></label>
          <select value={project.status} onChange={e => setProject({...project, status: e.target.value})} style={{ padding: "10px" }}>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>

          <label><strong>Manage Members (Click to toggle):</strong></label>
          <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
            {options.map(opt => (
              <div key={opt.id} onClick={() => toggleMember(opt)} style={{ padding: "8px", cursor: "pointer", background: project.members.find(m => m.memberId === opt.id) ? "#dbeafe" : "white" }}>
                {opt.label}
              </div>
            ))}
          </div>
          
          <button type="submit" style={{ padding: "12px", background: "#f59e0b", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Update Project
          </button>
        </form>
      </div>
    </Layout>
  );
};
export default EditProject;
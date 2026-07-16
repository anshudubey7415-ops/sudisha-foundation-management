import { useState, useEffect } from "react";
import API from "../api";
import Layout from "../components/Layout";

const AddProject = () => {
  const [project, setProject] = useState({ title: "", description: "", startDate: "", endDate: "", members: [] });
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [sRes, iRes, vRes] = await Promise.all([
        API.get("/students"),
        API.get("/interns"),
        API.get("/volunteers")
      ]);

      // Sirf 'Active' status wale members ko filter kar rahe hain
      // ID show karne ke liye slice(-4) use kiya hai taaki UI clean rahe
      const formatData = (data, type) => 
        data.filter(m => m.status === "Active").map(m => ({
          id: m._id,
          label: `${m.name} (ID: ${m._id.slice(-4)}) [${type}]`,
          type: type
        }));

      const formatted = [
        ...formatData(sRes.data, "Student"),
        ...formatData(iRes.data, "Intern"),
        ...formatData(vRes.data, "Volunteer")
      ];
      setOptions(formatted);
    };
    fetchData();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/projects", project);
    alert("Project Created Successfully!");
  };

  return (
    <Layout title="Assign Project">
      <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px", background: "white", borderRadius: "8px" }}>
        <h2>🚀 Create New Project</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input type="text" placeholder="Project Title" required onChange={(e) => setProject({...project, title: e.target.value})} style={{ padding: "10px" }} />
          <textarea placeholder="Description" onChange={(e) => setProject({...project, description: e.target.value})} style={{ padding: "10px" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="date" required onChange={(e) => setProject({...project, startDate: e.target.value})} style={{ flex: 1, padding: "10px" }} />
            <input type="date" required onChange={(e) => setProject({...project, endDate: e.target.value})} style={{ flex: 1, padding: "10px" }} />
          </div>
          
          <label><strong>Select Active Members (Click to toggle):</strong></label>
          <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
            {options.length > 0 ? options.map(opt => (
              <div key={opt.id} onClick={() => toggleMember(opt)} style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer", background: project.members.find(m => m.memberId === opt.id) ? "#dbeafe" : "white" }}>
                {opt.label}
              </div>
            )) : <p>No Active Members Found.</p>}
          </div>
          
          <button type="submit" style={{ padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Assign Project
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddProject;
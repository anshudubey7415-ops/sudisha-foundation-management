import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

function EditIntern() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    internId: "",
    name: "",
    college: "",
    course: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    mentor: "",
    startDate: "",
    endDate: "",
    status: "Active",
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntern = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/interns/${id}`);
        const data = res.data;

        // Date format fix karne ke liye (ISO to YYYY-MM-DD)
        setFormData({
          internId: data.internId || "",
          name: data.name || "",
          college: data.college || "",
          course: data.course || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          department: data.department || "",
          mentor: data.mentor || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
          status: data.status || "Active",
        });
      } catch (error) {
        console.error(error);
        alert("Error loading intern");
      } finally {
        setLoading(false);
      }
    };

    fetchIntern();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/interns/${id}`, formData);
      alert("Intern Updated Successfully");
      navigate("/interns");
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  };

  const inputStyle = { width: "100%", maxWidth: "400px", padding: "8px", marginBottom: "10px" };

  if (loading) return <div style={{ padding: "20px" }}><h2>Loading Intern...</h2></div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Edit Intern</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <input style={inputStyle} type="text" name="internId" placeholder="Intern ID" value={formData.internId} onChange={handleChange} required />
        <input style={inputStyle} type="text" name="name" placeholder="Intern Name" value={formData.name} onChange={handleChange} required />
        <input style={inputStyle} type="text" name="college" placeholder="College" value={formData.college} onChange={handleChange} required />
        <input style={inputStyle} type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} />
        <input style={inputStyle} type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} />
        <input style={inputStyle} type="text" name="mentor" placeholder="Mentor Name" value={formData.mentor} onChange={handleChange} />
        <input style={inputStyle} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input style={inputStyle} type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
        <textarea style={inputStyle} name="address" placeholder="Address" rows="4" value={formData.address} onChange={handleChange} />
        
        <label>Start Date</label>
        <input style={inputStyle} type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        
        <label>End Date</label>
        <input style={inputStyle} type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        
        <label>Status</label>
        <select style={inputStyle} name="status" value={formData.status} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>

        <button type="submit" style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}>
          Update Intern
        </button>
      </form>
    </div>
  );
}

export default EditIntern;
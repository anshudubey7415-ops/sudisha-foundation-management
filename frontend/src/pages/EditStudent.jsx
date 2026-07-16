import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rollNumber: "",
    name: "",
    class: "",
    age: "",
    gender: "",
    admissionDate: "",
    fatherName: "",
    motherName: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // IIFE pattern for fetching data
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/students/${id}`);
        const data = res.data;
        
        // Date format handle karne ke liye (agar 'YYYY-MM-DD' format chahiye)
        const formattedDate = data.admissionDate ? data.admissionDate.split("T")[0] : "";

        setFormData({
          rollNumber: data.rollNumber || "",
          name: data.name || "",
          class: data.class || "",
          age: data.age || "",
          gender: data.gender || "",
          admissionDate: formattedDate,
          fatherName: data.fatherName || "",
          motherName: data.motherName || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } catch (error) {
        console.error(error);
        alert("Error loading student details");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]); // 'id' dependency add ki hai

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/students/${id}`, formData);
      alert("Student Updated Successfully");
      navigate("/students");
    } catch (error) {
      console.error(error);
      alert("Error updating student");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}><h2>Loading Student...</h2></div>;

  // Reusable input style
  const inputStyle = { width: "100%", maxWidth: "400px", padding: "8px", marginBottom: "10px" };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Edit Student</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <input style={inputStyle} type="text" name="rollNumber" placeholder="Roll Number" value={formData.rollNumber} onChange={handleChange} required />
        <input style={inputStyle} type="text" name="name" placeholder="Student Name" value={formData.name} onChange={handleChange} required />
        <input style={inputStyle} type="text" name="class" placeholder="Class" value={formData.class} onChange={handleChange} required />
        <input style={inputStyle} type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        
        <select style={inputStyle} name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label>Admission Date</label>
        <input style={inputStyle} type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required />
        
        <input style={inputStyle} type="text" name="fatherName" placeholder="Father Name" value={formData.fatherName} onChange={handleChange} />
        <input style={inputStyle} type="text" name="motherName" placeholder="Mother Name" value={formData.motherName} onChange={handleChange} />
        <input style={inputStyle} type="text" name="phone" placeholder="Mobile Number" value={formData.phone} onChange={handleChange} />
        <textarea style={inputStyle} name="address" placeholder="Address" rows="4" value={formData.address} onChange={handleChange} />

        <button type="submit" style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}>
          Update Student
        </button>
      </form>
    </div>
  );
}

export default EditStudent;
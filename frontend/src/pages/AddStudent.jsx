import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AddStudent() {
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

  // Admin Access Check
  useEffect(() => {
    const userRole = localStorage.getItem("role") || "";
    if (userRole.toLowerCase() !== "admin") {
      alert("Access Denied: Only Admins can add students");
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/students/add", formData);
      alert("Student Added Successfully");
      setFormData({
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
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error adding student");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Add Student</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="rollNumber" placeholder="Roll Number" value={formData.rollNumber} onChange={handleChange} required />
        <br /><br />
        <input type="text" name="name" placeholder="Student Name" value={formData.name} onChange={handleChange} required />
        <br /><br />
        <input type="text" name="class" placeholder="Class" value={formData.class} onChange={handleChange} required />
        <br /><br />
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <br /><br />
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <br /><br />
        <label>Admission Date</label>
        <br />
        <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required />
        <br /><br />
        <input type="text" name="fatherName" placeholder="Father Name" value={formData.fatherName} onChange={handleChange} />
        <br /><br />
        <input type="text" name="motherName" placeholder="Mother Name" value={formData.motherName} onChange={handleChange} />
        <br /><br />
        <input type="text" name="phone" placeholder="Mobile Number" value={formData.phone} onChange={handleChange} />
        <br /><br />
        <textarea name="address" placeholder="Address" rows="4" cols="50" value={formData.address} onChange={handleChange} />
        <br /><br />
        <button type="submit" style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}>
          Add Student
        </button>
      </form>
    </div>
  );
}

export default AddStudent;
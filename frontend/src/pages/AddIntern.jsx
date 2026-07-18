import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AddIntern() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    internId: "",
    name: "",
    department: "",
    college: "",
    phone: "",
    email: "",
    startDate: "",
    endDate: "",
    address: "",
  });

  // Admin access check
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "admin") {
      alert("Access Denied: Only Admins can add interns");
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
      await API.post("/interns/add", formData);
      alert("Intern Added Successfully");
      setFormData({
        internId: "",
        name: "",
        department: "",
        college: "",
        phone: "",
        email: "",
        startDate: "",
        endDate: "",
        address: "",
      });
    } catch (error) {
      // Yahan console mein clear error dikhega
      console.error("Full Error Details:", error.response?.data || error.message);
      alert("Error adding intern: " + (error.response?.data?.message || "Check console for details"));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Add Intern</h1>

      <form onSubmit={handleSubmit}>
        <input type="text" name="internId" placeholder="Intern ID" value={formData.internId} onChange={handleChange} required />
        <br /><br />
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <br /><br />
        <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
        <br /><br />
        {/* College ab required hai */}
        <input type="text" name="college" placeholder="College" value={formData.college} onChange={handleChange} required />
        <br /><br />
        <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        <br /><br />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <br /><br />
        <label>Start Date</label> <br />
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        <br /><br />
        <label>End Date</label> <br />
        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        <br /><br />
        <textarea name="address" placeholder="Address" rows="4" cols="40" value={formData.address} onChange={handleChange} />
        <br /><br />
        <button type="submit">Add Intern</button>
      </form>
    </div>
  );
}

export default AddIntern;
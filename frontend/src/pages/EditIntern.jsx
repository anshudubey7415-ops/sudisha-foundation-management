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

useEffect(() => {
fetchIntern();
}, []);

const fetchIntern = async () => {
try {
const res = await API.get(`/interns/${id}`);


  setFormData({
    internId: res.data.internId || "",
    name: res.data.name || "",
    college: res.data.college || "",
    course: res.data.course || "",
    email: res.data.email || "",
    phone: res.data.phone || "",
    address: res.data.address || "",
    department: res.data.department || "",
    mentor: res.data.mentor || "",
    startDate: res.data.startDate || "",
    endDate: res.data.endDate || "",
    status: res.data.status || "Active",
  });
} catch (error) {
  console.error(error);
  alert("Error loading intern");
}


};

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});
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

return (
<div style={{ padding: "20px" }}> <h1>Edit Intern</h1>


  <form onSubmit={handleSubmit}>

    <input
      type="text"
      name="internId"
      placeholder="Intern ID"
      value={formData.internId}
      onChange={handleChange}
      required
    />

    <br /><br />

    <input
      type="text"
      name="name"
      placeholder="Intern Name"
      value={formData.name}
      onChange={handleChange}
      required
    />

    <br /><br />

    <input
      type="text"
      name="college"
      placeholder="College"
      value={formData.college}
      onChange={handleChange}
      required
    />

    <br /><br />

    <input
      type="text"
      name="course"
      placeholder="Course"
      value={formData.course}
      onChange={handleChange}
    />

    <br /><br />

    <input
      type="text"
      name="department"
      placeholder="Department"
      value={formData.department}
      onChange={handleChange}
    />

    <br /><br />

    <input
      type="text"
      name="mentor"
      placeholder="Mentor Name"
      value={formData.mentor}
      onChange={handleChange}
    />

    <br /><br />

    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
    />

    <br /><br />

    <input
      type="text"
      name="phone"
      placeholder="Phone Number"
      value={formData.phone}
      onChange={handleChange}
    />

    <br /><br />

    <textarea
      name="address"
      placeholder="Address"
      rows="4"
      cols="40"
      value={formData.address}
      onChange={handleChange}
    />

    <br /><br />

    <label>Start Date</label>

    <br />

    <input
      type="date"
      name="startDate"
      value={formData.startDate}
      onChange={handleChange}
      required
    />

    <br /><br />

    <label>End Date</label>

    <br />

    <input
      type="date"
      name="endDate"
      value={formData.endDate}
      onChange={handleChange}
      required
    />

    <br /><br />

    <label>Status</label>

    <br />

    <select
      name="status"
      value={formData.status}
      onChange={handleChange}
    >
      <option value="Active">
        Active
      </option>

      <option value="Completed">
        Completed
      </option>
    </select>

    <br /><br />

    <button
      type="submit"
      style={{
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Update Intern
    </button>

  </form>
</div>


);
}

export default EditIntern;

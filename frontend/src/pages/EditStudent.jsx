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
fetchStudent();
}, []);

const fetchStudent = async () => {
try {
const res = await API.get(`/students/${id}`);


  setFormData({
    rollNumber: res.data.rollNumber || "",
    name: res.data.name || "",
    class: res.data.class || "",
    age: res.data.age || "",
    gender: res.data.gender || "",
    admissionDate: res.data.admissionDate || "",
    fatherName: res.data.fatherName || "",
    motherName: res.data.motherName || "",
    phone: res.data.phone || "",
    address: res.data.address || "",
  });

  setLoading(false);
} catch (error) {
  console.error(error);
  alert("Error loading student");
  setLoading(false);
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
  await API.put(
    `/students/${id}`,
    formData
  );

  alert("Student Updated Successfully");

  navigate("/students");
} catch (error) {
  console.error(error);
  alert("Error updating student");
}


};

if (loading) {
return <h2>Loading Student...</h2>;
}

return (
<div style={{ padding: "20px" }}> <h1>Edit Student</h1>


  <form onSubmit={handleSubmit}>
    <input
      type="text"
      name="rollNumber"
      placeholder="Roll Number"
      value={formData.rollNumber}
      onChange={handleChange}
      required
    />

    <br /><br />

    <input
      type="text"
      name="name"
      placeholder="Student Name"
      value={formData.name}
      onChange={handleChange}
      required
    />

    <br /><br />

    <input
      type="text"
      name="class"
      placeholder="Class"
      value={formData.class}
      onChange={handleChange}
      required
    />

    <br /><br />

    <input
      type="number"
      name="age"
      placeholder="Age"
      value={formData.age}
      onChange={handleChange}
      required
    />

    <br /><br />

    <select
      name="gender"
      value={formData.gender}
      onChange={handleChange}
    >
      <option value="">
        Select Gender
      </option>

      <option value="Male">
        Male
      </option>

      <option value="Female">
        Female
      </option>

      <option value="Other">
        Other
      </option>
    </select>

    <br /><br />

    <label>
      Admission Date
    </label>

    <br />

    <input
      type="date"
      name="admissionDate"
      value={formData.admissionDate}
      onChange={handleChange}
      required
    />

    <br /><br />

    <input
      type="text"
      name="fatherName"
      placeholder="Father Name"
      value={formData.fatherName}
      onChange={handleChange}
    />

    <br /><br />

    <input
      type="text"
      name="motherName"
      placeholder="Mother Name"
      value={formData.motherName}
      onChange={handleChange}
    />

    <br /><br />

    <input
      type="text"
      name="phone"
      placeholder="Mobile Number"
      value={formData.phone}
      onChange={handleChange}
    />

    <br /><br />

    <textarea
      name="address"
      placeholder="Address"
      rows="4"
      cols="50"
      value={formData.address}
      onChange={handleChange}
    />

    <br /><br />

    <button
      type="submit"
      style={{
        background: "#2563eb",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Update Student
    </button>
  </form>
</div>


);
}

export default EditStudent;

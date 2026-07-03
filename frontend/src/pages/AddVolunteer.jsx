import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AddVolunteer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    volunteerId: "",
    name: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    education: "",
    joiningDate: "",
    status: "Active",
    badge: "Beginner",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post(
        "/volunteers/add",
        formData
      );

      alert("Volunteer Added Successfully");

      navigate("/volunteers");
    } catch (error) {
      console.error(error);
      alert("Error Adding Volunteer");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Add Volunteer</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="volunteerId"
          placeholder="Volunteer ID"
          value={formData.volunteerId}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />

        <br /><br />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <br /><br />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
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
          name="education"
          placeholder="Education"
          value={formData.education}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={handleChange}
        />

        <br /><br />

        <textarea
          name="address"
          placeholder="Address"
          rows="4"
          value={formData.address}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Add Volunteer
        </button>

      </form>
    </div>
  );
}

export default AddVolunteer;
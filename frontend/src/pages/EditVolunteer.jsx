import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

function EditVolunteer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Function ko useEffect ke andar define kar diya
    const fetchVolunteer = async () => {
      try {
        const res = await API.get(`/volunteers/${id}`);
        setFormData(res.data);
      } catch (error) {
        console.error("Error fetching volunteer:", error);
      }
    };

    fetchVolunteer();
  }, [id]); // 'id' ko dependency mein add karna zaroori hai

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/volunteers/${id}`, formData);
      alert("Volunteer Updated Successfully");
      navigate("/volunteers");
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Edit Volunteer</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name || ""}
          onChange={handleChange}
        />
        <br /><br />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone || ""}
          onChange={handleChange}
        />
        <br /><br />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email || ""}
          onChange={handleChange}
        />
        <br /><br />
        <input
          type="text"
          name="education"
          placeholder="Education"
          value={formData.education || ""}
          onChange={handleChange}
        />
        <br /><br />
        <textarea
          name="address"
          placeholder="Address"
          rows="4"
          value={formData.address || ""}
          onChange={handleChange}
        />
        <br /><br />
        <button type="submit">Update Volunteer</button>
      </form>
    </div>
  );
}

export default EditVolunteer;
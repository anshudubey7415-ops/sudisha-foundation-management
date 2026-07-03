import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

function EditVolunteer() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({});

  useEffect(() => {
    fetchVolunteer();
  }, []);

  const fetchVolunteer = async () => {
    try {
      const res = await API.get(
        `/volunteers/${id}`
      );

      setFormData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(
        `/volunteers/${id}`,
        formData
      );

      alert(
        "Volunteer Updated Successfully"
      );

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
          value={formData.name || ""}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="education"
          value={
            formData.education || ""
          }
          onChange={handleChange}
        />

        <br /><br />

        <textarea
          name="address"
          rows="4"
          value={
            formData.address || ""
          }
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Update Volunteer
        </button>

      </form>
    </div>
  );
}

export default EditVolunteer;
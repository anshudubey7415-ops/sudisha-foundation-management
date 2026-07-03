import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

function VolunteerAttendance() {
  const { id } = useParams();

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    date: "",
    status: "Present",
    checkIn: "",
    checkOut: "",
    remarks: "",
  });

  // Wrap inside useCallback to safely add it to useEffect dependency array
  const fetchVolunteer = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/volunteers/${id}`);
      setVolunteer(res.data);
    } catch (error) {
      console.error("Error fetching volunteer details:", error);
      alert("Failed to load volunteer data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVolunteer();
  }, [fetchVolunteer]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const markAttendance = async (e) => {
    e.preventDefault();

    try {
      await API.post("/volunteer-attendance/mark", {
        volunteer: id,
        ...formData,
      });

      alert("Attendance Marked Successfully");

      // Reset form state safely
      setFormData({
        date: "",
        status: "Present",
        checkIn: "",
        checkOut: "",
        remarks: "",
      });
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "An error occurred while marking attendance."
      );
    }
  };

  if (loading) return <h2>Loading Volunteer Details...</h2>;
  if (!volunteer) return <h2>Volunteer not found.</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Attendance - {volunteer.name}</h1>

      <form onSubmit={markAttendance}>
        <div>
          <label>Date: </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Status: </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Half Day">Half Day</option>
            <option value="Work From Home">Work From Home</option>
          </select>
        </div>

        <br />

        {/* Hide/Disable fields logic if Volunteer is Absent */}
        {formData.status !== "Absent" && (
          <>
            <div>
              <label>Check In Time: </label>
              <input
                type="time"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                required={formData.status === "Present"}
              />
            </div>

            <br />

            <div>
              <label>Check Out Time: </label>
              <input
                type="time"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                required={formData.status === "Present"}
              />
            </div>

            <br />
          </>
        )}

        <div>
          <label>Remarks: </label>
          <br />
          <textarea
            name="remarks"
            placeholder="Enter configuration notes or remarks..."
            rows="4"
            cols="40"
            value={formData.remarks}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit">
          Mark Attendance
        </button>
      </form>
    </div>
  );
}

export default VolunteerAttendance;
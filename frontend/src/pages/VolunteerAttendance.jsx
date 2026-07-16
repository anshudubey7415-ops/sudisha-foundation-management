import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function VolunteerAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: "",
    status: "Present",
    checkIn: "",
    checkOut: "",
    remarks: "",
  });

  useEffect(() => {
    const fetchVolunteer = async () => {
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
    };

    fetchVolunteer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const markAttendance = async (e) => {
    e.preventDefault();
    
    // Logic: Agar Absent hai, toh time fields empty rakho
    const payload = {
      volunteer: id,
      ...formData,
      checkIn: formData.status === "Absent" ? "" : formData.checkIn,
      checkOut: formData.status === "Absent" ? "" : formData.checkOut,
    };

    try {
      await API.post("/volunteer-attendance/mark", payload);
      alert("Attendance Marked Successfully");
      setFormData({ date: "", status: "Present", checkIn: "", checkOut: "", remarks: "" });
      navigate(`/volunteer/${id}`); // Attendance mark karke profile pe wapas bhej diya
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "An error occurred.");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}><h2>Loading Volunteer Details...</h2></div>;
  if (!volunteer) return <div style={{ padding: "20px" }}><h2>Volunteer not found.</h2></div>;

  const inputStyle = { display: "block", width: "100%", padding: "10px", marginTop: "5px", borderRadius: "5px", border: "1px solid #ccc" };

  return (
    <div style={{ padding: "25px", maxWidth: "600px" }}>
      <h1 style={{ marginBottom: "20px" }}>Attendance: {volunteer.name}</h1>
      
      <form onSubmit={markAttendance}>
        <div style={{ marginBottom: "15px" }}>
          <label><strong>Date</strong></label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><strong>Status</strong></label>
          <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Half Day">Half Day</option>
            <option value="Work From Home">Work From Home</option>
          </select>
        </div>

        {formData.status !== "Absent" && (
          <>
            <div style={{ marginBottom: "15px" }}>
              <label><strong>Check In Time</strong></label>
              <input type="time" name="checkIn" value={formData.checkIn} onChange={handleChange} required={formData.status !== "Absent"} style={inputStyle} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label><strong>Check Out Time</strong></label>
              <input type="time" name="checkOut" value={formData.checkOut} onChange={handleChange} required={formData.status !== "Absent"} style={inputStyle} />
            </div>
          </>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label><strong>Remarks</strong></label>
          <textarea name="remarks" rows="3" value={formData.remarks} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Mark Attendance
          </button>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: "10px 20px", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default VolunteerAttendance;
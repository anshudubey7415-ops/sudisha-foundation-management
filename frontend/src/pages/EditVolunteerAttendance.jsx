import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";

const STATUS_OPTIONS = ["Present", "Absent", "Half Day", "Work From Home"];

function EditVolunteerAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({
    date: "",
    status: "Present",
    checkIn: "",
    checkOut: "",
    hoursWorked: "",
    remarks: "",
  });

  const [volunteerName, setVolunteerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/volunteer-attendance/record/${id}`);
      const record = res.data;

      setForm({
        date: record.date || "",
        status: record.status || "Present",
        checkIn: record.checkIn || "",
        checkOut: record.checkOut || "",
        hoursWorked: record.hoursWorked ?? "",
        remarks: record.remarks || "",
      });

      if (record.volunteer) {
        setVolunteerName(record.volunteer.name || "");
      }
    } catch (err) {
      console.error(err);
      showError("Could not load attendance record.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await API.put(`/volunteer-attendance/${id}`, {
        ...form,
        hoursWorked: Number(form.hoursWorked) || 0,
      });
      showSuccess("Attendance record updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      showError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Edit Volunteer Attendance">
        <div className="card" style={{ maxWidth: "650px", margin: "0 auto", padding: "40px", textAlign: "center" }}>
          Loading attendance record...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit Attendance ${volunteerName ? `- ${volunteerName}` : ""}`}>
      <div className="card" style={{ maxWidth: "650px", margin: "0 auto", padding: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "24px", color: "var(--text-primary)" }}>
          Modify Attendance Entry
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                name="status"
                className="form-control"
                value={form.status}
                onChange={handleChange}
                required
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Check In</label>
              <input
                type="time"
                name="checkIn"
                className="form-control"
                value={form.checkIn}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Check Out</label>
              <input
                type="time"
                name="checkOut"
                className="form-control"
                value={form.checkOut}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hours</label>
              <input
                type="number"
                name="hoursWorked"
                className="form-control"
                min="0"
                step="0.5"
                placeholder="e.g. 4"
                value={form.hoursWorked}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks / Activity Notes</label>
            <textarea
              name="remarks"
              className="form-control"
              rows="3"
              placeholder="Session notes or achievements..."
              value={form.remarks}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default EditVolunteerAttendance;
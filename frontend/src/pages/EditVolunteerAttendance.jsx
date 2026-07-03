import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

const STATUS_OPTIONS = ["Present", "Absent", "Half Day", "Work From Home"];

function EditVolunteerAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: "",
    status: "Present",
    checkIn: "",
    checkOut: "",
    hoursWorked: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRecord = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/volunteerAttendance/record/${id}`);
      const record = res.data;

      setForm({
        date: record.date || "",
        status: record.status || "Present",
        checkIn: record.checkIn || "",
        checkOut: record.checkOut || "",
        hoursWorked: record.hoursWorked ?? "",
        remarks: record.remarks || "",
      });
    } catch (err) {
      console.error(err);
      setError("Could not load this attendance record.");
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
    setError("");

    try {
      await API.put(`/volunteerAttendance/${id}`, {
        ...form,
        hoursWorked: Number(form.hoursWorked) || 0,
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="eva-page">Loading attendance record...</div>;
  }

  return (
    <div className="eva-page">
      <style>{styles}</style>

      <div className="eva-card">
        <h1>Edit Attendance</h1>

        {error && <p className="eva-error">{error}</p>}

        <form onSubmit={handleSubmit} className="eva-form">
          <label className="eva-field">
            <span>Date</span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="eva-field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="eva-field">
            <span>Check In</span>
            <input
              type="time"
              name="checkIn"
              value={form.checkIn}
              onChange={handleChange}
            />
          </label>

          <label className="eva-field">
            <span>Check Out</span>
            <input
              type="time"
              name="checkOut"
              value={form.checkOut}
              onChange={handleChange}
            />
          </label>

          <label className="eva-field">
            <span>Hours Worked</span>
            <input
              type="number"
              name="hoursWorked"
              min="0"
              step="0.5"
              value={form.hoursWorked}
              onChange={handleChange}
            />
          </label>

          <label className="eva-field eva-field-full">
            <span>Remarks</span>
            <textarea
              name="remarks"
              rows="3"
              value={form.remarks}
              onChange={handleChange}
            />
          </label>

          <div className="eva-actions">
            <button
              type="button"
              className="eva-btn eva-btn-outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="eva-btn eva-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = `
  .eva-page {
    font-family: "Segoe UI", Roboto, -apple-system, sans-serif;
    max-width: 640px;
    margin: 0 auto;
    padding: 24px;
    color: #1e293b;
  }
  .eva-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
  }
  .eva-card h1 { margin: 0 0 18px; font-size: 22px; }
  .eva-error { color: #dc2626; margin-bottom: 12px; font-size: 14px; }

  .eva-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .eva-field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; }
  .eva-field-full { grid-column: 1 / -1; }
  .eva-field input,
  .eva-field select,
  .eva-field textarea {
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 400;
    outline: none;
    font-family: inherit;
  }
  .eva-field input:focus,
  .eva-field select:focus,
  .eva-field textarea:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px #2563eb22;
  }

  .eva-actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
  }
  .eva-btn {
    border: none;
    border-radius: 7px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .eva-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .eva-btn-outline { background: #fff; border: 1px solid #cbd5e1; color: #1e293b; }
  .eva-btn-outline:hover { background: #f1f5f9; }
  .eva-btn-primary { background: #2563eb; color: #fff; }
  .eva-btn-primary:hover:not(:disabled) { background: #1d4ed8; }

  @media (max-width: 520px) {
    .eva-form { grid-template-columns: 1fr; }
  }
`;

export default EditVolunteerAttendance;

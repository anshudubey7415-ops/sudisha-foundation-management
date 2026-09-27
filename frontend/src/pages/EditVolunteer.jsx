import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Loader2, Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function EditVolunteer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    volunteerId: "",
    name: "",
    gender: "Male",
    phone: "",
    email: "",
    education: "",
    joiningDate: "",
    address: "",
    badge: "Beginner",
    status: "Active",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/volunteers/${id}`);
        const data = res.data;
        
        setFormData({
          volunteerId: data.volunteerId || "",
          name: data.name || "",
          gender: data.gender || "Male",
          phone: data.phone || "",
          email: data.email || "",
          education: data.education || "",
          joiningDate: data.joiningDate ? data.joiningDate.split("T")[0] : "",
          address: data.address || "",
          badge: data.badge || "Beginner",
          status: data.status || "Active",
        });
      } catch (error) {
        console.error(error);
        showError("Failed to load volunteer data");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [id, showError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/volunteers/${id}`, formData);
      showSuccess("Volunteer updated successfully!");
      navigate("/volunteers");
    } catch (error) {
      console.error(error);
      showError("Update failed: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
        <h3>Loading Volunteer Data...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/volunteers" className="btn btn-secondary btn-icon" title="Back to Volunteers">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={24} style={{ color: "var(--primary)" }} /> Edit Volunteer: {formData.name}
              </h1>
              <p>Volunteer ID: {formData.volunteerId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: "20px", fontSize: "1.125rem", color: "var(--primary)" }}>
            Identification & Basic Details
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Volunteer ID *</label>
              <input
                type="text"
                name="volunteerId"
                className="form-input"
                value={formData.volunteerId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Joining Date *</label>
              <input
                type="date"
                name="joiningDate"
                className="form-input"
                value={formData.joiningDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr style={{ margin: "24px 0", borderColor: "var(--border-color)", borderStyle: "dashed" }} />

          <h3 style={{ marginBottom: "20px", fontSize: "1.125rem", color: "var(--primary)" }}>
            Badge & Status
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Education Background</label>
              <input
                type="text"
                name="education"
                className="form-input"
                value={formData.education}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Achievement Badge</label>
              <select name="badge" className="form-select" value={formData.badge} onChange={handleChange}>
                <option value="Beginner">Beginner</option>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Star Volunteer">Star Volunteer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-textarea"
              rows="3"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <Link to="/volunteers" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {saving ? (
                <>
                  <Loader2 size={18} className="spin" /> Saving...
                </>
              ) : (
                <>
                  <Check size={18} /> Update Volunteer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVolunteer;
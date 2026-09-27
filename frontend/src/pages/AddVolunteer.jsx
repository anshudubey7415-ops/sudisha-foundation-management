import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, HeartHandshake, Loader2, Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function AddVolunteer() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    volunteerId: `SF-VOL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    name: "",
    gender: "Male",
    phone: "",
    email: "",
    education: "",
    skills: "",
    interests: "",
    joiningDate: new Date().toISOString().split("T")[0],
    address: "",
    badge: "Beginner",
    status: "Active",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()) : [],
      interests: formData.interests ? formData.interests.split(",").map((i) => i.trim()) : [],
    };

    try {
      await API.post("/volunteers/add", payload);
      showSuccess(`Volunteer ${formData.name} registered successfully!`);
      navigate("/volunteers");
    } catch (error) {
      console.error(error);
      showError("Failed to add volunteer: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

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
                <HeartHandshake size={24} style={{ color: "var(--primary)" }} /> Register Volunteer
              </h1>
              <p>Add a dedicated volunteer to the Sudisha community network</p>
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
                placeholder="Volunteer Full Name"
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
                placeholder="+91 9876543210"
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
                placeholder="volunteer@example.com"
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
            Skills, Education & Level
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Education Background</label>
              <input
                type="text"
                name="education"
                className="form-input"
                placeholder="e.g. Graduate, Postgraduate, High School"
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Skills (Comma separated)</label>
              <input
                type="text"
                name="skills"
                className="form-input"
                placeholder="e.g. Teaching, Event Management, Photography"
                value={formData.skills}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interest Areas (Comma separated)</label>
              <input
                type="text"
                name="interests"
                className="form-input"
                placeholder="e.g. Child Education, Women Empowerment"
                value={formData.interests}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-textarea"
              placeholder="Residential address..."
              rows="3"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <Link to="/volunteers" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" /> Registering...
                </>
              ) : (
                <>
                  <Check size={18} /> Register Volunteer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVolunteer;
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Loader2, Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function AddIntern() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    internId: `SF-INT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    name: "",
    department: "Web Development",
    college: "",
    course: "",
    phone: "",
    email: "",
    mentor: "Sudisha Admin",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    address: "",
    status: "Active",
    allowIdCard: false,
    allowOfferLetter: false,
    allowCertificate: false,
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
    try {
      await API.post("/interns/add", formData);
      showSuccess(`Intern ${formData.name} registered successfully!`);
      navigate("/interns");
    } catch (error) {
      console.error(error);
      showError("Error adding intern: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/interns" className="btn btn-secondary btn-icon" title="Back to Interns">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <UserPlus size={24} style={{ color: "var(--primary)" }} /> Register New Intern
              </h1>
              <p>Add candidate to Sudisha Foundation Internship Program</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: "20px", fontSize: "1.125rem", color: "var(--primary)" }}>
            Internship & Assignment Details
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Intern ID *</label>
              <input
                type="text"
                name="internId"
                className="form-input"
                value={formData.internId}
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
                placeholder="Candidate Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select name="department" className="form-select" value={formData.department} onChange={handleChange} required>
                <option value="Web Development">Web Development</option>
                <option value="Content & Social Media">Content & Social Media</option>
                <option value="Teaching & Education">Teaching & Education</option>
                <option value="HR & Operations">HR & Operations</option>
                <option value="Fundraising & Outreach">Fundraising & Outreach</option>
                <option value="Graphic Design">Graphic Design</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">College / University *</label>
              <input
                type="text"
                name="college"
                className="form-input"
                placeholder="College Name"
                value={formData.college}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course / Degree</label>
              <input
                type="text"
                name="course"
                className="form-input"
                placeholder="e.g. B.Tech CSE, BBA, BCA"
                value={formData.course}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Mentor</label>
              <input
                type="text"
                name="mentor"
                className="form-input"
                placeholder="Mentor Name"
                value={formData.mentor}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                name="startDate"
                className="form-input"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                name="endDate"
                className="form-input"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <hr style={{ margin: "24px 0", borderColor: "var(--border-color)", borderStyle: "dashed" }} />

          <h3 style={{ marginBottom: "20px", fontSize: "1.125rem", color: "var(--primary)" }}>
            Contact & Location Details
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="candidate@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-textarea"
              placeholder="Candidate permanent / correspondence address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <hr style={{ margin: "24px 0", borderColor: "var(--border-color)", borderStyle: "dashed" }} />

          <h3 style={{ marginBottom: "16px", fontSize: "1.125rem", color: "var(--primary)" }}>
            Initial Document Approvals for Intern Portal (RBAC)
          </h3>
          <p style={{ marginTop: "-8px", marginBottom: "16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Select which documents this intern will immediately be allowed to view upon account creation:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", background: "var(--bg-surface)", padding: "16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
              <input
                type="checkbox"
                name="allowIdCard"
                checked={!!formData.allowIdCard}
                onChange={(e) => setFormData({ ...formData, allowIdCard: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
              />
              <span>🪪 Digital ID Card</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
              <input
                type="checkbox"
                name="allowOfferLetter"
                checked={!!formData.allowOfferLetter}
                onChange={(e) => setFormData({ ...formData, allowOfferLetter: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
              />
              <span>📄 Offer Letter</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
              <input
                type="checkbox"
                name="allowCertificate"
                checked={!!formData.allowCertificate}
                onChange={(e) => setFormData({ ...formData, allowCertificate: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
              />
              <span>🏆 Internship Certificate</span>
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <Link to="/interns" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" /> Registering Intern...
                </>
              ) : (
                <>
                  <Check size={18} /> Register Intern
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddIntern;
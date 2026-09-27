import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Loader2, Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function EditIntern() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    internId: "",
    name: "",
    college: "",
    course: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    mentor: "",
    startDate: "",
    endDate: "",
    status: "Active",
    allowIdCard: false,
    allowOfferLetter: false,
    allowCertificate: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchIntern = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/interns/${id}`);
        const data = res.data;

        setFormData({
          internId: data.internId || "",
          name: data.name || "",
          college: data.college || "",
          course: data.course || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          department: data.department || "Web Development",
          mentor: data.mentor || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
          status: data.status || "Active",
          allowIdCard: !!data.allowIdCard,
          allowOfferLetter: !!data.allowOfferLetter,
          allowCertificate: !!data.allowCertificate,
        });
      } catch (error) {
        console.error(error);
        showError("Error loading intern data");
      } finally {
        setLoading(false);
      }
    };

    fetchIntern();
  }, [id, showError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/interns/${id}`, formData);
      showSuccess("Intern updated successfully!");
      navigate("/interns");
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
        <h3>Loading Intern Details...</h3>
      </div>
    );
  }

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
                <Edit2 size={24} style={{ color: "var(--primary)" }} /> Edit Intern: {formData.name}
              </h1>
              <p>Intern ID: {formData.internId}</p>
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
            Contact & Communication Details
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
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
              rows="3"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <hr style={{ margin: "24px 0", borderColor: "var(--border-color)", borderStyle: "dashed" }} />

          <h3 style={{ marginBottom: "16px", fontSize: "1.125rem", color: "var(--primary)" }}>
            Intern Portal Document Approvals (RBAC)
          </h3>
          <p style={{ marginTop: "-8px", marginBottom: "16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Select which documents this intern is authorized to view and download in their personal portal:
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
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {saving ? (
                <>
                  <Loader2 size={18} className="spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Check size={18} /> Update Intern
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditIntern;
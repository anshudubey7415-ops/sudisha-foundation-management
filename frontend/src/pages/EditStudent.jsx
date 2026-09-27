import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Check, Loader2, Send, AlertCircle } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";
import API from "../api";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useContext(AuthContext);
  const userRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  const isManager = userRole === "manager";

  const [formData, setFormData] = useState({
    rollNumber: "",
    name: "",
    class: "",
    age: "",
    gender: "Male",
    admissionDate: "",
    fatherName: "",
    motherName: "",
    phone: "",
    address: "",
  });

  const [editReason, setEditReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/students/${id}`);
        const data = res.data;
        
        const formattedDate = data.admissionDate ? data.admissionDate.split("T")[0] : "";

        setFormData({
          rollNumber: data.rollNumber || "",
          name: data.name || "",
          class: data.class || "",
          age: data.age || "",
          gender: data.gender || "Male",
          admissionDate: formattedDate,
          fatherName: data.fatherName || "",
          motherName: data.motherName || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } catch (error) {
        console.error(error);
        showError("Error loading student details");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, showError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isManager) {
        await API.post("/requests", {
          targetUserId: id,
          targetName: formData.name,
          targetCollection: "students",
          changeType: "edit_student_profile",
          changes: formData,
          reason: editReason || "Manager submitted student profile update request",
        });
        showSuccess("Student profile update request submitted to Admin for approval!");
        navigate("/my-requests");
      } else {
        await API.put(`/students/${id}`, formData);
        showSuccess("Student updated successfully!");
        navigate("/students");
      }
    } catch (error) {
      console.error(error);
      showError("Error updating student: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "12px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "50%", marginBottom: "12px" }}>
          <Loader2 size={24} className="animate-spin" />
        </div>
        <h3>Loading Student Data...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/students" className="btn btn-secondary btn-icon" title="Back to Students">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={22} color="var(--primary)" /> Edit Student: {formData.name}
              </h1>
              <p>
                {isManager
                  ? "Submit profile modification request for Admin review & approval"
                  : "Update student academic and biographical information"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isManager && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#b45309",
            fontSize: "0.875rem",
            lineHeight: 1.5
          }}
        >
          <AlertCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>Manager Controlled Access:</strong> As a Manager, your edits will not overwrite the database immediately. Instead, an approval request will be submitted to the Admin portal.
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: "20px", fontSize: "1.125rem", color: "var(--primary)" }}>
            Academic & Identification Details
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                name="rollNumber"
                className="form-input"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Full Name *</label>
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
              <label className="form-label">Class / Grade *</label>
              <input
                type="text"
                name="class"
                className="form-input"
                value={formData.class}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input
                type="number"
                name="age"
                min="3"
                max="25"
                className="form-input"
                value={formData.age}
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

            <div className="form-group">
              <label className="form-label">Admission Date *</label>
              <input
                type="date"
                name="admissionDate"
                className="form-input"
                value={formData.admissionDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr style={{ margin: "24px 0", borderColor: "var(--border-color)", borderStyle: "dashed" }} />

          <h3 style={{ marginBottom: "20px", fontSize: "1.125rem", color: "var(--primary)" }}>
            Family & Contact Information
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Father's Name</label>
              <input
                type="text"
                name="fatherName"
                className="form-input"
                value={formData.fatherName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mother's Name</label>
              <input
                type="text"
                name="motherName"
                className="form-input"
                value={formData.motherName}
                onChange={handleChange}
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
            <label className="form-label">Residential Address</label>
            <textarea
              name="address"
              className="form-textarea"
              rows="3"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {isManager && (
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">
                Reason for Modification Request (Optional)
              </label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="Explain why this student record is being edited for the Admin..."
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <Link to="/students" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {isManager ? "Submitting Request..." : "Saving Changes..."}
                </>
              ) : isManager ? (
                <>
                  <Send size={16} /> Submit Update Request to Admin
                </>
              ) : (
                <>
                  <Check size={16} /> Update Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudent;
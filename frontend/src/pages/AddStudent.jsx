import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Check, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function AddStudent() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    rollNumber: "",
    name: "",
    class: "",
    age: "",
    gender: "Male",
    admissionDate: new Date().toISOString().split("T")[0],
    fatherName: "",
    motherName: "",
    phone: "",
    address: "",
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
      await API.post("/students/add", formData);
      showSuccess(`Student ${formData.name} added successfully!`);
      navigate("/students");
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

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
                <UserPlus size={22} color="var(--primary)" /> Add New Student
              </h1>
              <p>Enroll a student into Mission Akshar educational program</p>
            </div>
          </div>
        </div>
      </div>

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
                placeholder="e.g. MA-2024-001"
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
                placeholder="Student Name"
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
                placeholder="e.g. 1st, 2nd, Nursery, 5th"
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
                placeholder="Age in years"
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
                placeholder="Father's Name"
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
                placeholder="Mother's Name"
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
                placeholder="Contact Number"
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
              placeholder="Full Address (Street, Village / City, Landmark)"
              rows="3"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <Link to="/students" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving Student...
                </>
              ) : (
                <>
                  <Check size={16} /> Save Student Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudent;
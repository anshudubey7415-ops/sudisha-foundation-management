import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import API from "../api";
import { useToast } from "../context/ToastContext";

const RegisterUser = ({ onUserCreated }) => {
  const { showSuccess, showError, showWarning } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "intern" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      showWarning("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", formData);
      showSuccess(`Account for ${formData.name} (${formData.role}) created successfully!`);
      setFormData({ name: "", email: "", password: "", role: "intern" });
      if (onUserCreated) onUserCreated();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Registration failed. Please check the details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g. Anjali Sharma"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email Address *</label>
        <input
          type="email"
          className="form-control"
          placeholder="anjali@sudishafoundation.org"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password * (Min 6 chars)</label>
        <input
          type="password"
          className="form-control"
          placeholder="••••••••"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">System Role *</label>
        <select
          className="form-control"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="intern">Intern</option>
          <option value="volunteer">Volunteer</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: "8px", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
        {loading ? (
          <>
            <Loader2 size={16} className="spin" /> Creating User...
          </>
        ) : (
          <>
            <UserPlus size={16} /> Register User Account
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterUser;
import { useState } from "react";
import API from "../api"; 

const RegisterUser = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "intern" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      await API.post("/auth/register", formData);
      setMessage({ text: `${formData.role.toUpperCase()} created successfully!`, type: "success" });
      setFormData({ name: "", email: "", password: "", role: "intern" });
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Registration failed. Please check the details.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "10px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
      <h3 style={{ marginTop: 0, color: "#1e3a8a" }}>➕ Create New User</h3>
      
      {/* Feedback Message */}
      {message.text && (
        <p style={{ color: message.type === "success" ? "#16a34a" : "#dc2626", fontSize: "14px", fontWeight: "bold" }}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="text" placeholder="Full Name" required value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle}
        />
        <input 
          type="email" placeholder="Email Address" required value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle}
        />
        <input 
          type="password" placeholder="Password (Min 6 chars)" required minLength="6" value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})} style={inputStyle}
        />
        <select 
          value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={inputStyle}
        >
          <option value="intern">Intern</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        
        <button 
          type="submit" disabled={loading}
          style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

const inputStyle = { padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none" };
const buttonStyle = { background: "#2563eb", color: "white", padding: "12px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };

export default RegisterUser;
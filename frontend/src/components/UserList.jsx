import { useState, useEffect } from "react";
import API from "../api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "", password: "" });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) { console.error("Error fetching users:", err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Password agar khali hai toh update na ho
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;

      if (editingId) {
        await API.put(`/users/${editingId}`, dataToSend);
      } else {
        await API.post("/users", formData);
      }
      
      setFormData({ name: "", email: "", role: "", password: "" });
      setEditingId(null);
      fetchUsers();
    } catch (err) { alert("Error saving user: " + (err.response?.data?.message || "Something went wrong")); }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/users/${id}`);
        fetchUsers();
      // eslint-disable-next-line no-unused-vars
      } catch (err) { alert("Error deleting user"); }
    }
  };

  return (
    <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
      <h3 style={{ marginBottom: "20px", color: "#1e293b" }}>{editingId ? "Edit User" : "Add New User"}</h3>
      
      {/* FORM SECTION */}
      <form onSubmit={handleSave} style={{ marginBottom: "30px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
        <input required placeholder="Full Name" style={inputStyle} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input required type="email" placeholder="Email Address" style={inputStyle} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder={editingId ? "New Password (Optional)" : "Password"} style={inputStyle} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
        
        <select style={inputStyle} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required>
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="intern">Intern</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" style={{ background: "#2563eb", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
          {editingId ? "Update User" : "Add User"}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setFormData({ name: "", email: "", role: "", password: "" }); }} style={{ background: "#64748b", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer" }}>
            Cancel
          </button>
        )}
      </form>

      {/* TABLE SECTION */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={tdStyle}>{user.name}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}><span style={{ padding: "4px 8px", borderRadius: "4px", background: "#e2e8f0", fontSize: "12px" }}>{user.role}</span></td>
                <td style={tdStyle}>
                  <button onClick={() => { setEditingId(user._id); setFormData(user); window.scrollTo(0, 0); }} style={editBtn}>Edit</button>
                  <button onClick={() => deleteUser(user._id)} style={delBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// STYLES
const inputStyle = { padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" };
const thStyle = { padding: "12px", color: "#64748b", fontWeight: "600", fontSize: "14px" };
const tdStyle = { padding: "12px", fontSize: "14px", color: "#334155" };
const editBtn = { background: "#f59e0b", border: "none", color: "white", padding: "6px 12px", borderRadius: "4px", marginRight: "8px", cursor: "pointer" };
const delBtn = { background: "#ef4444", border: "none", color: "white", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" };

export default UserList;
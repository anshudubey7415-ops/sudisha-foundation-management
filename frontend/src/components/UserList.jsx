import { useState, useEffect, useMemo } from "react";
import { Users, UserPlus, Edit2, Trash2, KeyRound, Sparkles, Send } from "lucide-react";
import API from "../api";
import { useToast } from "../context/ToastContext";

function UserList() {
  const { showSuccess, showError, showWarning } = useToast();
  const [users, setUsers] = useState([]);
  const [internsList, setInternsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "intern", password: "" });
  const [selectedInternId, setSelectedInternId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Manual Reset Password State
  const [resetTarget, setResetTarget] = useState(null);
  const [newResetPassword, setNewResetPassword] = useState("");
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      const res = await API.get("/interns");
      setInternsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching interns for user creation:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      showError("Failed to fetch system users");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setSelectedInternId("");
    setFormData({ name: "", email: "", role: "intern", password: "" });
    setShowModal(true);
  };

  const handleInternSelect = (internId) => {
    setSelectedInternId(internId);
    if (!internId) return;
    const found = internsList.find((i) => i._id === internId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        name: found.name || "",
        email: found.email || "",
        role: "intern"
      }));
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
    let pass = "SF@";
    for (let i = 0; i < 7; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: "" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showWarning("Please provide name and email.");
      return;
    }
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      showWarning("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSaving(true);
      const payload = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      if (editingUser) {
        await API.put(`/users/${editingUser._id}`, payload);
        showSuccess(`User "${formData.name}" updated successfully!`);
      } else {
        await API.post("/users", payload);
        showSuccess(`User "${formData.name}" created successfully!`);
      }

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/users/${deleteTarget._id}`);
      showSuccess(`User "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showError("Failed to delete user.");
    }
  };

  const openResetPasswordModal = (user) => {
    setResetTarget(user);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
    let pass = "SF@";
    for (let i = 0; i < 7; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewResetPassword(pass);
    setSendEmailNotification(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetTarget || !newResetPassword.trim() || newResetPassword.trim().length < 6) {
      showWarning("Password must be at least 6 characters long.");
      return;
    }

    try {
      setResettingPassword(true);
      const res = await API.post(`/users/${resetTarget._id}/reset-password`, {
        newPassword: newResetPassword.trim(),
        sendEmail: sendEmailNotification
      });

      showSuccess(res.data?.message || `Password reset successfully for ${resetTarget.name}!`);
      setResetTarget(null);
      setNewResetPassword("");
    } catch (err) {
      console.error("Error resetting password:", err);
      showError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setResettingPassword(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        `${u.name || ""} ${u.email || ""} ${u.role || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={22} style={{ color: "var(--primary)" }} /> Portal Users & System Accounts
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Manage administrative, managerial, and volunteer login credentials.
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <UserPlus size={14} /> Add New User
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* User Table */}
      {loading ? (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading users...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
          No users found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</td>
                  <td style={{ color: "var(--text-muted)" }}>{user.email}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background:
                          user.role === "admin"
                            ? "rgba(239, 68, 68, 0.12)"
                            : user.role === "manager"
                            ? "rgba(245, 158, 11, 0.12)"
                            : user.role === "intern"
                            ? "rgba(168, 85, 247, 0.12)"
                            : "rgba(16, 185, 129, 0.12)",
                        color:
                          user.role === "admin"
                            ? "#ef4444"
                            : user.role === "manager"
                            ? "#f59e0b"
                            : user.role === "intern"
                            ? "#a855f7"
                            : "#10b981",
                        textTransform: "capitalize",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        onClick={() => openEditModal(user)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>

                      {user.role?.toLowerCase() !== "admin" && (
                        <>
                          <button
                            onClick={() => openResetPasswordModal(user)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--primary)" }}
                            title="Reset password and email credentials"
                          >
                            <KeyRound size={13} /> Reset Pass
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="btn btn-danger btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div className="card" style={{ maxWidth: "480px", width: "100%", padding: "28px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {editingUser ? "Edit User Account" : "Create New User"}
            </h3>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">System Role *</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="intern">Intern (Read-Only Intern Portal)</option>
                  <option value="admin">Admin (Full System Access)</option>
                  <option value="manager">Manager (Operations & Requests)</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>

              {!editingUser && formData.role === "intern" && internsList.length > 0 && (
                <div className="form-group" style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>
                    ⚡ Quick Select from Registered Interns:
                  </label>
                  <select
                    className="form-control"
                    value={selectedInternId}
                    onChange={(e) => handleInternSelect(e.target.value)}
                  >
                    <option value="">-- Choose an intern to auto-fill email & name --</option>
                    {internsList.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.name} ({i.email || "No Email"}) - {i.department}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email Address * {formData.role === "intern" && <span style={{ fontSize: "0.75rem", color: "var(--primary)" }}>(Must match intern's profile email)</span>}
                </label>
                <input
                  type="email"
                  className="form-control"
                  required
                  placeholder="name@sudishafoundation.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    {editingUser ? "New Password (Leave blank to keep current)" : "Password * (min 6 chars)"}
                  </label>
                  {!editingUser && (
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.75rem", padding: "1px 6px" }}
                    >
                      Generate Strong
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="••••••••"
                  minLength={editingUser ? 0 : 6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div className="card" style={{ maxWidth: "420px", width: "100%", padding: "24px" }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#ef4444" }}>Delete User?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "20px" }}>
              Are you sure you want to revoke access for <strong>{deleteTarget.name}</strong> ({deleteTarget.email})?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
            padding: "20px",
          }}
        >
          <div className="card" style={{ maxWidth: "460px", width: "100%", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(37, 99, 235, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Reset User Password
                </h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  For {resetTarget.name} ({resetTarget.email})
                </p>
              </div>
            </div>

            <form onSubmit={handleResetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label className="form-label" style={{ margin: 0 }}>New Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
                      let pass = "SF@";
                      for (let i = 0; i < 7; i++) {
                        pass += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setNewResetPassword(pass);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Sparkles size={12} /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-surface)", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                <input
                  type="checkbox"
                  id="sendEmailCheck"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                <label htmlFor="sendEmailCheck" style={{ margin: 0, fontSize: "0.85rem", cursor: "pointer", color: "var(--text-primary)" }}>
                  Send new credentials email to <strong>{resetTarget.email}</strong>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setResetTarget(null)}
                  disabled={resettingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resettingPassword}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Send size={14} />
                  {resettingPassword ? "Resetting..." : "Confirm & Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
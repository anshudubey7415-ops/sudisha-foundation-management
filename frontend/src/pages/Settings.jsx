import { useContext, useState } from "react";
import { Bell, Palette, Sun, Moon, LogOut, Loader2 } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../api";
import UserList from "../components/UserList";
import { useToast } from "../context/ToastContext";

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();

  const [announcement, setAnnouncement] = useState({ title: "", message: "" });
  const [posting, setPosting] = useState(false);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.title.trim() || !announcement.message.trim()) {
      showWarning("Please provide both a title and message for the announcement.");
      return;
    }

    try {
      setPosting(true);
      await API.post("/announcements", announcement);
      showSuccess("Announcement broadcasted successfully!");
      setAnnouncement({ title: "", message: "" });
    } catch (err) {
      console.error("Announcement Error:", err);
      showError("Failed to publish announcement.");
    } finally {
      setPosting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout title="Portal Settings & Control">
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* User Profile Card */}
        <div className="card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), #a855f7)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {user?.name || "System User"}
                </h2>
                <span
                  className="badge"
                  style={{
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "var(--primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontSize: "0.75rem",
                  }}
                >
                  {user?.role || "Member"}
                </span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                {user?.email || "user@sudishafoundation.org"}
              </div>
            </div>
          </div>
        </div>

        {/* Post Announcement Section (Admin & Manager) */}
        {(user?.role === "admin" || user?.role === "manager") && (
          <div className="card" style={{ padding: "28px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={20} style={{ color: "var(--primary)" }} /> Broadcast Public Announcement
            </h3>
            <form onSubmit={handlePostAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Announcement Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Center holiday notice / Drive update"
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Content *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Type the message body to be broadcasted to all foundation members..."
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-primary" disabled={posting} style={{ minWidth: "160px", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
                  {posting ? (
                    <>
                      <Loader2 size={16} className="spin" /> Publishing...
                    </>
                  ) : (
                    "Publish Announcement"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admin System User Management */}
        {user?.role === "admin" && (
          <UserList />
        )}

        {/* Theme Preferences */}
        <div className="card" style={{ padding: "28px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Palette size={20} style={{ color: "var(--primary)" }} /> Display & Theme Preferences
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Color Scheme</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Currently active: <strong>{theme === "dark" ? "Dark Theme" : "Light Theme"}</strong>
              </div>
            </div>
            <button onClick={toggleTheme} className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {theme === "dark" ? (
                <>
                  <Sun size={14} /> Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon size={14} /> Switch to Dark Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Account & Logout */}
        <div className="card" style={{ padding: "28px", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <LogOut size={20} style={{ color: "var(--danger)" }} /> Account Session
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Sign out of your active session on this device.
              </p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <LogOut size={14} /> Logout of Portal
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Settings;
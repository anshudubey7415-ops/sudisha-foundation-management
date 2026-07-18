import { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom'; 
import Layout from "../components/Layout";
import API from "../api";
// Import your RegisterUser component here if it's in the same folder or update path
import RegisterUser from './RegisterUser'; 

const Settings = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext); // Context se actual user lo
  const navigate = useNavigate(); 
  const [announcement, setAnnouncement] = useState({ title: "", message: "" });
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); 
    navigate('/login');
  };

  const handlePostAnnouncement = async () => {
    if (!announcement.title || !announcement.message) return alert("Please fill all fields");
    try {
      await API.post("/announcements", announcement);
      alert("Announcement Posted Successfully!");
      setAnnouncement({ title: "", message: "" });
    } catch (err) {
      console.error("Announcement Error:", err); 
    }
  };

  return (
    <Layout title="Settings">
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        
        {/* Profile Section */}
        <section style={sectionStyle}>
          <h3 style={{ marginTop: 0 }}>👤 Profile</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> <span style={roleBadge}>{user?.role}</span></p>
        </section>

        {/* Announcement Section - Visible to Admin & Manager */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <section style={sectionStyle}>
            <h3 style={{ marginTop: 0 }}>📢 Post Announcement</h3>
            <input 
              placeholder="Title" 
              value={announcement.title}
              onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
              style={{ ...inputStyle, width: "100%", marginBottom: "10px", boxSizing: "border-box" }} 
            />
            <textarea 
              placeholder="Message" 
              value={announcement.message}
              onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
              style={{ ...inputStyle, width: "100%", height: "80px", marginBottom: "10px", boxSizing: "border-box" }} 
            />
            <button onClick={handlePostAnnouncement} style={buttonStyle}>Post</button>
          </section>
        )}

        {/* Admin System Controls - VISIBLE ONLY TO ADMIN */}
        {user?.role === 'admin' && (
          <section style={{ ...sectionStyle, borderColor: "#4338ca" }}>
            <h3 style={{ marginTop: 0, color: "#4338ca" }}>🛠 Admin System Controls</h3>
            <RegisterUser />
            {/* Future: Add System Logs or Password Reset here */}
          </section>
        )}

        {/* Preferences Section */}
        <section style={sectionStyle}>
          <h3 style={{ marginTop: 0 }}>⚙️ Preferences</h3>
          <div style={optionStyle}>
            <label>Mode (Theme):</label>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)} 
              style={inputStyle}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
        </section>

        {/* Account Section */}
        <section style={sectionStyle}>
          <h3 style={{ marginTop: 0 }}>🔒 Account</h3>
          <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
        </section>
      </div>
    </Layout>
  );
};

// Styling remain same...
const sectionStyle = { padding: "20px", border: "1px solid var(--border)", borderRadius: "10px", marginBottom: "20px", background: "var(--bg)" };
const optionStyle = { margin: "15px 0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const inputStyle = { padding: "8px", borderRadius: "5px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" };
const buttonStyle = { background: "#4338ca", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%" };
const roleBadge = { background: "#e0e7ff", padding: "3px 10px", borderRadius: "15px", color: "#4338ca", fontWeight: "bold", fontSize: "0.9em" };
const logoutButtonStyle = { background: "#ef4444", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%" };

export default Settings;
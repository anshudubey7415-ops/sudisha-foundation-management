import { useEffect, useState, useContext, useMemo } from "react";
import { Plus, Bell, Calendar, Trash2, Loader2 } from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const AllAnnouncements = () => {
  const { user } = useContext(AuthContext);
  const { showSuccess, showError, showWarning } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const canPost = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get("/announcements");
      const list = Array.isArray(res.data) ? res.data : [];
      // Sort newest first
      list.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      setAnnouncements(list);
    } catch (err) {
      console.error(err);
      showError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      showWarning("Please provide both a title and a message.");
      return;
    }

    try {
      setPosting(true);
      await API.post("/announcements", newAnnouncement);
      showSuccess("Announcement broadcasted successfully!");
      setNewAnnouncement({ title: "", message: "" });
      setShowPostModal(false);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      showError("Failed to post announcement");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete announcement "${title}"?`)) {
      try {
        await API.delete(`/announcements/${id}`);
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
        showSuccess("Announcement deleted.");
      } catch (err) {
        console.error(err);
        showError("Failed to delete announcement.");
      }
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) =>
      `${a.title || ""} ${a.message || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [announcements, searchTerm]);

  return (
    <Layout
      title="Foundation Announcements"
      actions={
        canPost && (
          <button onClick={() => setShowPostModal(true)} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Plus size={14} /> New Announcement
          </button>
        )
      }
    >
      <div style={{ maxWidth: "850px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Search */}
        <div className="card" style={{ padding: "16px 20px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search announcements by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
            Loading announcements...
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No announcements found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredAnnouncements.map((a) => (
              <div
                key={a._id}
                className="card"
                style={{
                  padding: "24px",
                  borderLeft: "4px solid var(--primary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Bell size={18} style={{ color: "var(--primary)" }} /> {a.title}
                    </h3>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={13} style={{ color: "var(--text-muted)" }} />
                      <span>{a.date ? new Date(a.date).toLocaleDateString(undefined, { dateStyle: "long" }) : "Recent"}</span>
                    </div>
                  </div>

                  {canPost && (
                    <button
                      onClick={() => handleDelete(a._id, a.title)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: "4px 10px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>

                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {a.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* New Announcement Modal */}
        {showPostModal && (
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
            <div className="card" style={{ maxWidth: "540px", width: "100%", padding: "28px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={20} style={{ color: "var(--primary)" }} /> Broadcast New Announcement
              </h3>

              <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Announcement Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Monthly Volunteer Orientation Meeting"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message Details *</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Type the announcement body..."
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPostModal(false)}
                    disabled={posting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={posting}>
                    {posting ? "Publishing..." : "Broadcast Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllAnnouncements;
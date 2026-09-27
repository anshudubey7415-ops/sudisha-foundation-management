import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Users, Edit2, Trash2, FolderKanban } from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";

const AllProjects = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: "" });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/projects");
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching projects", err);
      showError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await API.delete(`/projects/${deleteModal.id}`);
      setProjects((prev) => prev.filter((p) => p._id !== deleteModal.id));
      showSuccess(`Project "${deleteModal.title}" deleted successfully!`);
      setDeleteModal({ open: false, id: null, title: "" });
    } catch (err) {
      console.error("Error deleting project", err);
      showError("Failed to delete project");
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = `${p.title || ""} ${p.description || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  return (
    <Layout
      title="Projects & Initiatives"
      actions={
        <button onClick={() => navigate("/add-project")} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Plus size={14} /> Create New Project
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Filter Bar */}
        <div className="card" style={{ padding: "18px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label className="form-label">Search Projects</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Filter by Status</label>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending / On Hold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No projects found matching your search.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
            {filteredProjects.map((p) => {
              const isCompleted = p.status === "Completed";
              const memberCount = p.members?.length || 0;

              return (
                <div
                  key={p._id}
                  className="card"
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderTop: `4px solid ${isCompleted ? "#10b981" : "#6366f1"}`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {p.title}
                      </h3>
                      <span className={`badge ${isCompleted ? "badge-success" : "badge-primary"}`}>
                        {p.status || "Active"}
                      </span>
                    </div>

                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "16px", minHeight: "42px" }}>
                      {p.description || "No description provided."}
                    </p>

                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                        <span><strong>Timeline:</strong> {p.startDate ? new Date(p.startDate).toLocaleDateString() : "TBD"} – {p.endDate ? new Date(p.endDate).toLocaleDateString() : "TBD"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Users size={14} style={{ color: "var(--text-muted)" }} />
                        <span><strong>Assigned Team:</strong> {memberCount} {memberCount === 1 ? "member" : "members"}</span>
                      </div>
                    </div>

                    {/* Member chips preview */}
                    {memberCount > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                        {p.members.slice(0, 4).map((m, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "0.75rem",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background:
                                m.memberModel === "Student"
                                  ? "rgba(99, 102, 241, 0.1)"
                                  : m.memberModel === "Intern"
                                  ? "rgba(168, 85, 247, 0.1)"
                                  : "rgba(16, 185, 129, 0.1)",
                              color:
                                m.memberModel === "Student"
                                  ? "#6366f1"
                                  : m.memberModel === "Intern"
                                  ? "#a855f7"
                                  : "#10b981",
                              fontWeight: 600,
                            }}
                          >
                            {m.memberModel}: {m.memberId?.name || (typeof m.memberId === "string" ? m.memberId.slice(-4) : "—")}
                          </span>
                        ))}
                        {memberCount > 4 && (
                          <span style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: "6px", background: "var(--surface)", color: "var(--text-muted)" }}>
                            +{memberCount - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                    <button
                      onClick={() => navigate(`/edit-project/${p._id}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, id: p._id, title: p.title })}
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.open && (
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
              <h3 style={{ margin: "0 0 12px 0", color: "#ef4444" }}>Delete Project?</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "20px" }}>
                Are you sure you want to delete <strong>"{deleteModal.title}"</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteModal({ open: false, id: null, title: "" })}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllProjects;
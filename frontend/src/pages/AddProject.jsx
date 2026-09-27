import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Check, Plus, Loader2 } from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";

const AddProject = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const [project, setProject] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "Active",
    members: [],
  });

  const [options, setOptions] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateTypeFilter, setCandidateTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const [sRes, iRes, vRes] = await Promise.all([
        API.get("/students"),
        API.get("/interns"),
        API.get("/volunteers"),
      ]);

      const formatData = (data, type) =>
        (Array.isArray(data) ? data : [])
          .filter((m) => !m.status || m.status === "Active")
          .map((m) => ({
            id: m._id,
            name: m.name,
            identifier: m.rollNumber || m.internId || m.contactNumber || m._id.slice(-4),
            type: type,
          }));

      const formatted = [
        ...formatData(sRes.data, "Student"),
        ...formatData(iRes.data, "Intern"),
        ...formatData(vRes.data, "Volunteer"),
      ];
      setOptions(formatted);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      showError("Failed to load candidates for project assignment");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (cand) => {
    setProject((prev) => {
      const exists = prev.members.find((m) => m.memberId === cand.id);
      if (exists) {
        return { ...prev, members: prev.members.filter((m) => m.memberId !== cand.id) };
      } else {
        return {
          ...prev,
          members: [...prev.members, { memberId: cand.id, memberModel: cand.type }],
        };
      }
    });
  };

  const filteredCandidates = useMemo(() => {
    return options.filter((cand) => {
      const matchesSearch = `${cand.name} ${cand.identifier} ${cand.type}`
        .toLowerCase()
        .includes(candidateSearch.toLowerCase());
      const matchesType = candidateTypeFilter === "All" || cand.type === candidateTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [options, candidateSearch, candidateTypeFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project.title.trim()) {
      showWarning("Please provide a project title.");
      return;
    }

    try {
      setSaving(true);
      await API.post("/projects", project);
      showSuccess("Project created and assigned successfully!");
      navigate("/all-projects");
    } catch (err) {
      console.error("Error creating project:", err);
      showError("Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Create & Assign Project">
      <div className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <FolderKanban size={22} style={{ color: "var(--primary)" }} /> New Project Details
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Digital Literacy Drive - Phase 2"
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Goals</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Outline project objectives, milestones, and deliverables..."
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-control"
                value={project.startDate}
                onChange={(e) => setProject({ ...project, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={project.endDate}
                onChange={(e) => setProject({ ...project, endDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={project.status}
                onChange={(e) => setProject({ ...project, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Member Assignment Section */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                Assign Members ({project.members.length} selected)
              </label>
              {project.members.length > 0 && (
                <button
                  type="button"
                  onClick={() => setProject({ ...project, members: [] })}
                  style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Candidate Search & Filter */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search candidates by name or ID..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
              />
              <select
                className="form-control"
                value={candidateTypeFilter}
                onChange={(e) => setCandidateTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Student">Students</option>
                <option value="Intern">Interns</option>
                <option value="Volunteer">Volunteers</option>
              </select>
            </div>

            {/* Candidate Toggle List */}
            <div
              style={{
                maxHeight: "220px",
                overflowY: "auto",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "8px",
                background: "var(--surface)",
              }}
            >
              {loading ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", gridColumn: "1 / -1" }}>
                  Loading candidates...
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", gridColumn: "1 / -1" }}>
                  No candidates found.
                </div>
              ) : (
                filteredCandidates.map((cand) => {
                  const isSelected = project.members.some((m) => m.memberId === cand.id);

                  return (
                    <div
                      key={cand.id}
                      onClick={() => toggleMember(cand)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                        background: isSelected ? "rgba(99, 102, 241, 0.12)" : "var(--card-bg)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.85rem",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: isSelected ? "var(--primary)" : "var(--text-primary)" }}>
                          {cand.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {cand.type} • {cand.identifier}
                        </div>
                      </div>
                      <span style={{ display: "flex", alignItems: "center", color: isSelected ? "var(--primary)" : "var(--text-muted)" }}>
                        {isSelected ? <Check size={16} /> : <Plus size={16} />}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/all-projects")}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Creating..." : "Assign & Launch Project"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddProject;
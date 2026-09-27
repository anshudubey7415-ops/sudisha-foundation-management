import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  Download,
  CalendarCheck,
  UserPlus,
  Search,
  SearchX,
  User,
  CreditCard,
  FileText,
  Award,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  Plus,
  Building2,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Interns() {
  const { user } = useContext(AuthContext);
  const userRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  const isManager = userRole === "manager";

  const [interns, setInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [internToDelete, setInternToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const res = await API.get("/interns");
      setInterns(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching interns:", error);
      showError("Failed to fetch interns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const confirmDeleteIntern = async () => {
    if (!internToDelete) return;
    try {
      setSubmittingDelete(true);
      if (isManager) {
        await API.post("/requests", {
          targetUserId: internToDelete._id,
          targetName: internToDelete.name,
          targetCollection: "interns",
          changeType: "delete_intern",
          changes: {
            action: "delete",
            name: internToDelete.name,
            internId: internToDelete.internId,
            department: internToDelete.department,
          },
          reason: deleteReason || "Manager requested intern deletion",
        });
        showSuccess(`Deletion request for ${internToDelete.name} sent to Admin for approval!`);
      } else {
        await API.delete(`/interns/${internToDelete._id}`);
        showSuccess(`Intern ${internToDelete.name} deleted successfully!`);
        setInterns((prev) => prev.filter((i) => i._id !== internToDelete._id));
      }
      setInternToDelete(null);
      setDeleteReason("");
    } catch (error) {
      console.error(error);
      showError("Failed to delete intern: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingDelete(false);
    }
  };

  const departments = useMemo(() => {
    const deps = new Set(interns.map((i) => i.department).filter(Boolean));
    return Array.from(deps).sort();
  }, [interns]);

  const filteredInterns = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const today = new Date();

    return interns.filter((intern) => {
      const isCompleted = intern.endDate ? today > new Date(intern.endDate) : intern.status === "Completed";
      const currentStatus = isCompleted ? "Completed" : (intern.status || "Active");

      const matchesSearch =
        !term ||
        `${intern.internId || ""} ${intern.name || ""} ${intern.department || ""} ${intern.college || ""}`
          .toLowerCase()
          .includes(term);

      const matchesDept = departmentFilter === "all" || intern.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || currentStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [interns, searchTerm, departmentFilter, statusFilter]);

  const exportInternsCSV = () => {
    if (interns.length === 0) return;
    const headers = ["Intern ID", "Name", "Department", "College", "Email", "Phone", "Start Date", "End Date", "Status", "Certificate No", "Attendance %"];
    const rows = filteredInterns.map((i) => [
      `"${i.internId || ''}"`,
      `"${i.name || ''}"`,
      `"${i.department || ''}"`,
      `"${i.college || ''}"`,
      `"${i.email || ''}"`,
      `"${i.phone || ''}"`,
      `"${i.startDate || ''}"`,
      `"${i.endDate || ''}"`,
      `"${i.status || 'Active'}"`,
      `"${i.certificateNumber || ''}"`,
      `${i.attendancePercentage || 0}%`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sudisha_Interns_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess("Interns CSV exported!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* =========================================================
          1. PAGE HEADER
          ========================================================= */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-title-group">
          <h1>
            <Briefcase size={26} color="var(--primary)" /> Intern Management Directory
          </h1>
          <p>Comprehensive records of interns, verification documents, and program milestones</p>
        </div>

        <div className="page-actions">
          <button 
            onClick={exportInternsCSV} 
            className="btn btn-secondary btn-sm" 
            disabled={filteredInterns.length === 0}
          >
            <Download size={14} /> Export CSV
          </button>
          <Link to="/intern-attendance" className="btn btn-outline btn-sm">
            <CalendarCheck size={14} /> Attendance Log
          </Link>
          <Link to="/add-intern" className="btn btn-primary btn-sm">
            <UserPlus size={14} /> Add New Intern
          </Link>
        </div>
      </div>

      {/* =========================================================
          2. FILTER & SEARCH BAR
          ========================================================= */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 0 }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <span className="search-icon">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by ID, Name, Department, College..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)" }}>Dept:</span>
            <select
              className="form-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ width: "auto", minWidth: "150px", padding: "8px 12px", fontSize: "0.875rem" }}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)" }}>Status:</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "auto", minWidth: "130px", padding: "8px 12px", fontSize: "0.875rem" }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Records Counter Pill */}
          <div style={{
            marginLeft: "auto",
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            fontWeight: 700,
            background: "var(--bg-surface)",
            padding: "6px 12px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-color)"
          }}>
            Showing <strong style={{ color: "var(--text-heading)" }}>{filteredInterns.length}</strong> of {interns.length} interns
          </div>
        </div>
      </div>

      {/* =========================================================
          3. INTERNS TABLE
          ========================================================= */}
      {loading ? (
        <div className="card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", padding: "14px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "50%", marginBottom: "14px" }}>
            <Loader2 size={28} className="animate-spin" />
          </div>
          <h3 style={{ margin: 0 }}>Loading Interns Directory...</h3>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>Fetching verified records from server</p>
        </div>
      ) : filteredInterns.length === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", padding: "18px", background: "var(--bg-surface)", color: "var(--text-muted)", borderRadius: "50%", marginBottom: "14px" }}>
            <SearchX size={38} />
          </div>
          <h3 style={{ margin: 0 }}>No Interns Found</h3>
          <p style={{ marginTop: "6px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Try adjusting your search criteria or register a new candidate.</p>
          <Link to="/add-intern" className="btn btn-primary" style={{ marginTop: "18px" }}>
            <Plus size={15} /> Add First Intern
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Intern ID</th>
                <th style={{ minWidth: "220px" }}>Intern Details</th>
                <th style={{ minWidth: "160px" }}>Department</th>
                <th style={{ minWidth: "180px" }}>College / Institute</th>
                <th style={{ width: "130px" }}>Status</th>
                <th style={{ textAlign: "right", minWidth: "280px" }}>Documents & Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterns.map((intern) => {
                const today = new Date();
                const isCompleted = intern.endDate ? today > new Date(intern.endDate) : intern.status === "Completed";

                return (
                  <tr key={intern._id}>
                    {/* Intern ID */}
                    <td>
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: "var(--primary)",
                        background: "var(--primary-light)",
                        padding: "4px 8px",
                        borderRadius: "var(--radius-xs)",
                        fontSize: "0.8125rem",
                        display: "inline-block"
                      }}>
                        #{intern.internId || "N/A"}
                      </span>
                    </td>

                    {/* Intern Name & Contact */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "var(--radius-full)",
                            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%)",
                            color: "#7c3aed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.9375rem",
                            border: "1px solid rgba(124, 58, 237, 0.25)",
                            flexShrink: 0
                          }}
                        >
                          {intern.name?.charAt(0).toUpperCase() || "I"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text-heading)", fontSize: "0.9375rem" }}>
                            {intern.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {intern.email || intern.phone || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td>
                      <span className="badge badge-role-intern" style={{ fontSize: "0.75rem", padding: "3px 10px" }}>
                        {intern.department || "General Operations"}
                      </span>
                    </td>

                    {/* College / Institution */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontSize: "0.875rem", fontWeight: 500 }}>
                        <Building2 size={14} color="var(--text-dim)" />
                        <span>{intern.college || "—"}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${isCompleted ? "badge-completed-chip" : "badge-active"}`} style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                        {isCompleted ? (
                          <>
                            <CheckCircle2 size={12} /> Completed
                          </>
                        ) : (
                          <>
                            <Clock size={12} /> Active
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions & Documents */}
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions-group">
                        {/* Prominent Attractive Profile Button */}
                        <button
                          onClick={() => navigate(`/intern/${intern._id}`)}
                          className="btn btn-primary btn-sm"
                          title="View Full Intern Profile"
                          style={{
                            padding: "6px 14px",
                            fontSize: "0.8125rem",
                            fontWeight: 700,
                            borderRadius: "var(--radius-full)",
                            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <User size={14} /> Profile
                        </button>

                        {/* ID Card */}
                        <button
                          onClick={() => navigate(`/intern-id/${intern._id}`)}
                          className="btn btn-secondary btn-sm btn-icon"
                          title="Generate & Print ID Card"
                          style={{ width: "32px", height: "32px", padding: 0 }}
                        >
                          <CreditCard size={14} />
                        </button>

                        {/* Offer Letter */}
                        <button
                          onClick={() => navigate(`/offer-letter/${intern._id}`)}
                          className="btn btn-secondary btn-sm btn-icon"
                          title="Generate Offer Letter"
                          style={{ width: "32px", height: "32px", padding: 0 }}
                        >
                          <FileText size={14} />
                        </button>

                        {/* Certificate */}
                        <button
                          onClick={() => navigate(`/intern-certificate/${intern._id}`)}
                          className="btn btn-warning btn-sm btn-icon"
                          title="Generate Completion Certificate"
                          style={{ width: "32px", height: "32px", padding: 0 }}
                        >
                          <Award size={14} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/edit-intern/${intern._id}`)}
                          className="btn btn-secondary btn-sm btn-icon"
                          title="Edit Details"
                          aria-label="Edit intern"
                          style={{ width: "32px", height: "32px", padding: 0 }}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setInternToDelete(intern)}
                          className="btn btn-outline btn-sm btn-icon"
                          style={{ width: "32px", height: "32px", padding: 0, color: "var(--danger)", borderColor: "rgba(239,68,68,0.25)" }}
                          title="Delete Intern"
                          aria-label="Delete intern"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================
          4. DELETE CONFIRMATION MODAL
          ========================================================= */}
      {internToDelete && (
        <div className="modal-overlay" onClick={() => setInternToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: "var(--danger)", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={19} /> {isManager ? "Submit Intern Deletion Request" : "Confirm Intern Deletion"}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setInternToDelete(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {isManager ? (
                <div>
                  <div style={{ padding: "10px 14px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "6px", color: "#b45309", fontSize: "0.875rem", marginBottom: "14px" }}>
                    ⚠️ <strong>Manager Request:</strong> Deleting an intern requires Admin approval. Submitting this request sends it to the Admin portal for verification.
                  </div>
                  <p style={{ margin: 0, fontSize: "0.9375rem" }}>
                    Request to delete intern: <strong>{internToDelete.name}</strong> (ID: #{internToDelete.internId}, {internToDelete.department})
                  </p>
                  <div className="form-group" style={{ marginTop: "14px" }}>
                    <label className="form-label">Reason for Deletion Request (Optional)</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      placeholder="e.g. Intern withdrew, completed tenure..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "0.9375rem", color: "var(--text-main)", margin: 0 }}>
                    Are you sure you want to delete intern record for <strong style={{ color: "var(--text-heading)" }}>{internToDelete.name}</strong> (ID: #{internToDelete.internId})?
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "8px" }}>
                    This will remove their verification records, attendance history, and certificate links permanently.
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setInternToDelete(null)} disabled={submittingDelete}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDeleteIntern}
                disabled={submittingDelete}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                {submittingDelete ? (
                  <>
                    <Loader2 size={14} className="spin" /> Processing...
                  </>
                ) : isManager ? (
                  "Submit Delete Request"
                ) : (
                  <>
                    <Trash2 size={14} /> Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interns;
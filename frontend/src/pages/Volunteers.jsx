import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HeartHandshake,
  Download,
  CalendarCheck,
  UserPlus,
  Search,
  Loader2,
  Award,
  User,
  CreditCard,
  Clock,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Volunteers() {
  const { user } = useContext(AuthContext);
  const userRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  const isManager = userRole === "manager";

  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/volunteers");
      setVolunteers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      showError("Failed to fetch volunteers directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const confirmDeleteVolunteer = async () => {
    if (!volunteerToDelete) return;
    try {
      setSubmittingDelete(true);
      if (isManager) {
        await API.post("/requests", {
          targetUserId: volunteerToDelete._id,
          targetName: volunteerToDelete.name,
          targetCollection: "volunteers",
          changeType: "delete_volunteer",
          changes: {
            action: "delete",
            name: volunteerToDelete.name,
            volunteerId: volunteerToDelete.volunteerId,
          },
          reason: deleteReason || "Manager requested volunteer deletion",
        });
        showSuccess(`Deletion request for ${volunteerToDelete.name} sent to Admin for approval!`);
      } else {
        await API.delete(`/volunteers/${volunteerToDelete._id}`);
        showSuccess(`Volunteer ${volunteerToDelete.name} deleted successfully!`);
        setVolunteers((prev) => prev.filter((v) => v._id !== volunteerToDelete._id));
      }
      setVolunteerToDelete(null);
      setDeleteReason("");
    } catch (error) {
      console.error(error);
      showError("Failed to delete volunteer: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingDelete(false);
    }
  };

  const filteredVolunteers = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return volunteers.filter((v) => {
      const matchesSearch =
        !query ||
        `${v.volunteerId || ""} ${v.name || ""} ${v.phone || ""} ${v.email || ""}`
          .toLowerCase()
          .includes(query);

      const matchesBadge = badgeFilter === "all" || v.badge?.toLowerCase() === badgeFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || v.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesBadge && matchesStatus;
    });
  }, [volunteers, searchTerm, badgeFilter, statusFilter]);

  const exportVolunteersCSV = () => {
    if (volunteers.length === 0) return;
    const headers = ["Volunteer ID", "Name", "Gender", "Phone", "Email", "Joining Date", "Total Hours", "Badge", "Status", "Attendance %"];
    const rows = filteredVolunteers.map((v) => [
      `"${v.volunteerId || ''}"`,
      `"${v.name || ''}"`,
      `"${v.gender || ''}"`,
      `"${v.phone || ''}"`,
      `"${v.email || ''}"`,
      `"${v.joiningDate || ''}"`,
      v.totalHours || 0,
      `"${v.badge || 'Beginner'}"`,
      `"${v.status || 'Active'}"`,
      `${v.attendancePercentage || 0}%`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sudisha_Volunteers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess("Volunteers CSV exported!");
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <HeartHandshake size={28} style={{ color: "var(--primary)" }} /> Volunteer Directory
          </h1>
          <p>Track grassroots community volunteers, hours contributed, and achievement badges</p>
        </div>

        <div className="page-actions">
          <button onClick={exportVolunteersCSV} className="btn btn-outline btn-sm" disabled={filteredVolunteers.length === 0} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Download size={14} /> Export CSV
          </button>
          <Link to="/volunteer/bulk-attendance" className="btn btn-success btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CalendarCheck size={14} /> Bulk Attendance
          </Link>
          <Link to="/add-volunteer" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <UserPlus size={14} /> Add New Volunteer
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <span className="search-icon" style={{ display: "flex", alignItems: "center" }}><Search size={16} /></span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Volunteer ID, Name, Phone or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Badge:</span>
            <select
              className="form-select"
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              style={{ width: "auto", minWidth: "130px" }}
            >
              <option value="all">All Badges</option>
              <option value="beginner">Beginner</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="star volunteer">Star Volunteer</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Status:</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "auto", minWidth: "120px" }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ marginLeft: "auto", fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing {filteredVolunteers.length} of {volunteers.length} volunteers
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="card" style={{ padding: "50px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
          <h3>Loading Volunteers Directory...</h3>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="card" style={{ padding: "50px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Search size={48} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
          <h3>No Volunteers Found</h3>
          <p style={{ marginTop: "4px" }}>Try searching with different keywords or register a volunteer.</p>
          <Link to="/add-volunteer" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <UserPlus size={14} /> Add First Volunteer
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Volunteer ID</th>
                <th>Volunteer Details</th>
                <th>Contact</th>
                <th>Total Hours</th>
                <th>Achievement Badge</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer._id}>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
                      {volunteer.volunteerId || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "var(--radius-full)",
                          background: "rgba(245, 158, 11, 0.15)",
                          color: "#f59e0b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {volunteer.name?.charAt(0) || "V"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>{volunteer.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {volunteer.gender || "—"} &bull; Joined: {volunteer.joiningDate ? volunteer.joiningDate.split("T")[0] : "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.8125rem" }}>{volunteer.phone || "—"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{volunteer.email || "—"}</div>
                  </td>
                  <td>
                    <strong style={{ color: "var(--primary)", fontSize: "0.95rem" }}>
                      {volunteer.totalHours || 0} hrs
                    </strong>
                  </td>
                  <td>
                    <span
                      style={{
                        background: "rgba(245, 158, 11, 0.15)",
                        color: "#b45309",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Award size={13} /> {volunteer.badge || "Beginner"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${volunteer.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                      {volunteer.status || "Active"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="table-actions-group">
                      <button
                        onClick={() => navigate(`/volunteer/${volunteer._id}`)}
                        className="btn btn-outline btn-sm"
                        title="View Profile"
                        style={{ padding: "5px 10px", fontSize: "0.8125rem", gap: "4px" }}
                      >
                        <User size={13} /> Profile
                      </button>
                      <button
                        onClick={() => navigate(`/volunteer-id/${volunteer._id}`)}
                        className="btn btn-secondary btn-sm btn-icon"
                        title="Generate ID Card"
                        style={{ width: "32px", height: "32px", padding: 0 }}
                      >
                        <CreditCard size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/volunteer-attendance/${volunteer._id}`)}
                        className="btn btn-warning btn-sm btn-icon"
                        title="Log Attendance Hours"
                        style={{ width: "32px", height: "32px", padding: 0 }}
                      >
                        <Clock size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/edit-volunteer/${volunteer._id}`)}
                        className="btn btn-secondary btn-sm btn-icon"
                        title="Edit Details"
                        style={{ width: "32px", height: "32px", padding: 0 }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setVolunteerToDelete(volunteer)}
                        className="btn btn-outline btn-sm btn-icon"
                        style={{ width: "32px", height: "32px", padding: 0, color: "var(--danger)", borderColor: "rgba(239,68,68,0.25)" }}
                        title="Delete Volunteer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {volunteerToDelete && (
        <div className="modal-backdrop" onClick={() => setVolunteerToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={20} /> {isManager ? "Submit Volunteer Deletion Request" : "Confirm Volunteer Deletion"}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setVolunteerToDelete(null)} disabled={submittingDelete}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {isManager ? (
                <div>
                  <div style={{ padding: "10px 14px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "6px", color: "#b45309", fontSize: "0.875rem", marginBottom: "14px" }}>
                    ⚠️ <strong>Manager Request:</strong> Deleting a volunteer requires Admin approval. Submitting this request sends it to the Admin portal for verification.
                  </div>
                  <p style={{ margin: 0 }}>
                    Request to delete volunteer: <strong>{volunteerToDelete.name}</strong> ({volunteerToDelete.volunteerId})
                  </p>
                  <div className="form-group" style={{ marginTop: "14px" }}>
                    <label className="form-label">Reason for Deletion Request (Optional)</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      placeholder="e.g. Inactive volunteer, requested removal..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p>
                    Are you sure you want to delete volunteer <strong>{volunteerToDelete.name}</strong> ({volunteerToDelete.volunteerId})?
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "8px" }}>
                    This will delete their records and historical volunteering hours. This action cannot be undone.
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setVolunteerToDelete(null)} disabled={submittingDelete}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDeleteVolunteer}
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
                  "Yes, Delete Volunteer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Volunteers;
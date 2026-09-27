import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Download,
  CalendarCheck,
  UserPlus,
  Search,
  SearchX,
  User,
  CreditCard,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  Plus
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Students() {
  const { user } = useContext(AuthContext);
  const userRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  const isManager = userRole === "manager";

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [loading, setLoading] = useState(true);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching students:", error);
      showError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      setSubmittingDelete(true);
      if (isManager) {
        await API.post("/requests", {
          targetUserId: studentToDelete._id,
          targetName: studentToDelete.name,
          targetCollection: "students",
          changeType: "delete_student",
          changes: {
            action: "delete",
            name: studentToDelete.name,
            rollNumber: studentToDelete.rollNumber,
            class: studentToDelete.class,
          },
          reason: deleteReason || "Manager requested student deletion",
        });
        showSuccess(`Deletion request for ${studentToDelete.name} sent to Admin for approval!`);
      } else {
        await API.delete(`/students/${studentToDelete._id}`);
        showSuccess(`Student ${studentToDelete.name} deleted successfully!`);
        setStudents((prev) => prev.filter((s) => s._id !== studentToDelete._id));
      }
      setStudentToDelete(null);
      setDeleteReason("");
    } catch (error) {
      console.error(error);
      showError("Failed to process deletion: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Get distinct classes for filter dropdown
  const distinctClasses = useMemo(() => {
    const classes = new Set(students.map((s) => s.class).filter(Boolean));
    return Array.from(classes).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return students.filter((student) => {
      const matchesSearch =
        !term ||
        `${student.rollNumber || ""} ${student.name || ""} ${student.phone || ""}`
          .toLowerCase()
          .includes(term);

      const matchesClass = selectedClass === "all" || student.class === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, selectedClass]);

  const exportStudentsCSV = () => {
    if (students.length === 0) return;
    const headers = ["Roll Number", "Name", "Class", "Age", "Gender", "Phone", "Admission Date", "Present Days", "Total Days", "Attendance %"];
    const rows = filteredStudents.map((s) => [
      `"${s.rollNumber || ''}"`,
      `"${s.name || ''}"`,
      `"${s.class || ''}"`,
      `"${s.age || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.admissionDate || ''}"`,
      s.presentDays || 0,
      s.totalAttendanceDays || 0,
      `${s.attendancePercentage || 0}%`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mission_Akshar_Students_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess("Students CSV exported!");
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <GraduationCap size={24} color="var(--primary)" /> Mission Akshar: Students
          </h1>
          <p>Manage student enrollment, attendance records, and student ID cards</p>
        </div>

        <div className="page-actions">
          <button onClick={exportStudentsCSV} className="btn btn-outline btn-sm" disabled={filteredStudents.length === 0}>
            <Download size={14} /> Export CSV
          </button>
          <Link to="/attendance" className="btn btn-success btn-sm">
            <CalendarCheck size={14} /> Mark Attendance
          </Link>
          <Link to="/add-student" className="btn btn-primary btn-sm">
            <UserPlus size={14} /> Add New Student
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <span className="search-icon">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Roll No, Student Name or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Class:</span>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{ width: "auto", minWidth: "140px" }}
            >
              <option value="all">All Classes ({students.length})</option>
              {distinctClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls} ({students.filter((s) => s.class === cls).length})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: "auto", fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      {loading ? (
        <div className="card" style={{ padding: "50px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", padding: "12px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "50%", marginBottom: "12px" }}>
            <Loader2 size={24} className="animate-spin" />
          </div>
          <h3>Loading Student Records...</h3>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card" style={{ padding: "50px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", padding: "16px", background: "var(--bg-surface)", color: "var(--text-muted)", borderRadius: "50%", marginBottom: "12px" }}>
            <SearchX size={36} />
          </div>
          <h3>No Students Found</h3>
          <p style={{ marginTop: "4px", color: "var(--text-muted)" }}>Try adjusting your search criteria or add a new student.</p>
          <Link to="/add-student" className="btn btn-primary" style={{ marginTop: "16px" }}>
            <Plus size={14} /> Add First Student
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Details</th>
                <th>Class</th>
                <th>Admission Date</th>
                <th>Contact</th>
                <th>Attendance</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const rate = parseFloat(student.attendancePercentage || 0);
                const rateColor = rate >= 75 ? "var(--success)" : rate >= 50 ? "var(--warning)" : "var(--danger)";

                return (
                  <tr key={student._id}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
                        {student.rollNumber || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "var(--radius-full)",
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                          }}
                        >
                          {student.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>{student.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {student.gender || "—"} &bull; {student.age ? `${student.age} yrs` : "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-pending">Class {student.class}</span>
                    </td>
                    <td>{student.admissionDate || "—"}</td>
                    <td>
                      <div style={{ fontSize: "0.8125rem" }}>{student.phone || "—"}</div>
                      {student.fatherName && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>F: {student.fatherName}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "100px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700 }}>
                          <span>{rate}%</span>
                          <span style={{ color: "var(--text-muted)" }}>{student.presentDays || 0}/{student.totalAttendanceDays || 0}d</span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "var(--bg-surface)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(rate, 100)}%`, height: "100%", background: rateColor, borderRadius: "var(--radius-full)" }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions-group">
                        <button
                          onClick={() => navigate(`/student/${student._id}`)}
                          className="btn btn-outline btn-sm"
                          title="View Profile"
                          style={{ padding: "5px 10px", fontSize: "0.8125rem", gap: "4px" }}
                        >
                          <User size={13} /> Profile
                        </button>
                        <button
                          onClick={() => navigate(`/student/id-card/${student._id}`)}
                          className="btn btn-secondary btn-sm btn-icon"
                          title="Generate ID Card"
                          style={{ width: "32px", height: "32px", padding: 0 }}
                        >
                          <CreditCard size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/edit-student/${student._id}`)}
                          className="btn btn-secondary btn-sm btn-icon"
                          title="Edit Student"
                          aria-label="Edit student"
                          style={{ width: "32px", height: "32px", padding: 0 }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="btn btn-outline btn-sm btn-icon"
                          style={{ width: "32px", height: "32px", padding: 0, color: "var(--danger)", borderColor: "rgba(239,68,68,0.25)" }}
                          title="Delete Student"
                          aria-label="Delete student"
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

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="modal-backdrop" onClick={() => setStudentToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: "var(--danger)", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} /> {isManager ? "Submit Student Deletion Request" : "Confirm Student Deletion"}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setStudentToDelete(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {isManager ? (
                <div>
                  <div style={{ padding: "10px 14px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "6px", color: "#b45309", fontSize: "0.875rem", marginBottom: "14px" }}>
                    ⚠️ <strong>Manager Request:</strong> As a Manager, you cannot delete students directly. Submitting this form creates an approval request for the Admin to review.
                  </div>
                  <p style={{ margin: 0 }}>
                    Request to delete student: <strong>{studentToDelete.name}</strong> (Roll No: {studentToDelete.rollNumber}, Class: {studentToDelete.class})
                  </p>
                  <div className="form-group" style={{ marginTop: "14px" }}>
                    <label className="form-label">Reason for Deletion Request (Optional)</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      placeholder="e.g. Student transferred, duplicate entry..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p>
                    Are you sure you want to permanently delete <strong>{studentToDelete.name}</strong> (Roll No: {studentToDelete.rollNumber})?
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "8px" }}>
                    This will also delete all historical attendance records linked to this student. This action cannot be undone.
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setStudentToDelete(null)} disabled={submittingDelete}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDeleteStudent}
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
                  "Yes, Delete Student"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
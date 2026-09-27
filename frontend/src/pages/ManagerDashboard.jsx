import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  FolderKanban,
  FileBarChart,
  Inbox,
  Bell,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Activity,
  PieChart as PieChartIcon,
  X,
  ArrowRight,
  Loader2,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import API from "../api";

function ManagerDashboard() {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [todayRecords, setTodayRecords] = useState({ students: [], interns: [], volunteers: [] });
  const [myRequests, setMyRequests] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedList, setSelectedList] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, iRes, vRes, saRes, iaRes, vaRes, pRes, reqRes, annRes] = await Promise.all([
        API.get("/students").catch(() => ({ data: [] })),
        API.get("/interns").catch(() => ({ data: [] })),
        API.get("/volunteers").catch(() => ({ data: [] })),
        API.get("/attendance").catch(() => ({ data: [] })),
        API.get("/intern-attendance").catch(() => ({ data: [] })),
        API.get("/volunteer-attendance").catch(() => ({ data: [] })),
        API.get("/projects").catch(() => ({ data: [] })),
        API.get("/requests/my-requests").catch(() => ({ data: [] })),
        API.get("/announcements").catch(() => ({ data: [] }))
      ]);

      setProjects(pRes.data || []);
      setMyRequests(reqRes.data || []);
      setAnnouncements(annRes.data || []);

      const filteredS = (saRes.data || []).filter(r => r.date === filterDate);
      const filteredI = (iaRes.data || []).filter(r => r.date === filterDate);
      const filteredV = (vaRes.data || []).filter(r => r.date === filterDate);

      setTodayRecords({ students: filteredS, interns: filteredI, volunteers: filteredV });
      
      const totalStudents = (sRes.data || []).length;
      const presentStudents = filteredS.filter(r => r.status === "Present").length;
      const absentStudents = filteredS.filter(r => r.status === "Absent").length;
      
      const totalInterns = (iRes.data || []).length;
      const presentInterns = filteredI.filter(r => r.status === "Present").length;
      
      const totalVolunteers = (vRes.data || []).length;
      const presentVolunteers = filteredV.filter(r => r.status === "Present").length;

      setStats({
        students: { total: totalStudents, present: presentStudents, absent: absentStudents },
        interns: { total: totalInterns, present: presentInterns, absent: filteredI.filter(r => r.status === "Absent").length },
        volunteers: { total: totalVolunteers, present: presentVolunteers, absent: filteredV.filter(r => r.status === "Absent").length },
      });
    } catch (err) {
      console.error("Error loading manager dashboard:", err);
      showError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [filterDate, showError]);

  useEffect(() => {
    const userRole = (localStorage.getItem("role") || "").toLowerCase();
    if (userRole !== "manager" && userRole !== "admin") {
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate, loadData]);

  const projectStatusData = [
    { name: "Active Projects", value: projects.filter(p => p.status === "Active" || !p.status).length, color: "#2563eb" },
    { name: "Completed", value: projects.filter(p => p.status === "Completed").length, color: "#10b981" }
  ];

  const distributionData = [
    { name: "Students", count: stats?.students?.total || 0, present: stats?.students?.present || 0 },
    { name: "Interns", count: stats?.interns?.total || 0, present: stats?.interns?.present || 0 },
    { name: "Volunteers", count: stats?.volunteers?.total || 0, present: stats?.volunteers?.present || 0 }
  ];

  const studentAttendanceRate = stats?.students?.total > 0
    ? Math.round((stats.students.present / stats.students.total) * 100)
    : 0;

  if (loading && !stats) {
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "16px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "50%", marginBottom: "16px" }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
        <h2>Loading Manager Dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* =========================================================
          1. DASHBOARD HEADER & CONTEXT BAR
          ========================================================= */}
      <div className="page-header" style={{ marginBottom: "4px" }}>
        <div className="page-title-group">
          <h1>
            <LayoutDashboard size={26} color="var(--primary)" /> Manager Dashboard
          </h1>
          <p>Field Operations, Daily Attendance Tracking & Program Analytics</p>
        </div>

        <div className="page-actions">
          {/* Integrated Date Picker Filter */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-card)",
            padding: "5px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-xs)"
          }}>
            <Calendar size={15} color="var(--primary)" />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)" }}>Date:</span>
            <input 
              type="date" 
              className="form-input" 
              style={{
                width: "auto",
                padding: "3px 8px",
                fontSize: "0.8125rem",
                border: "none",
                background: "transparent",
                color: "var(--text-main)",
                fontWeight: 600,
                outline: "none"
              }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <Link to="/attendance-report" className="btn btn-primary btn-sm">
            <FileBarChart size={15} /> Reports
          </Link>
        </div>
      </div>

      {/* =========================================================
          2. TOP KPI CARDS GRID (PRIMARY METRICS FIRST)
          ========================================================= */}
      <div className="stats-grid">
        {/* Total Students */}
        <div className="stat-card" style={{ "--card-accent": "var(--primary-gradient)" }} onClick={() => navigate("/students")}>
          <div className="stat-top">
            <span className="stat-label">Mission Akshar</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "var(--primary-light)", "--stat-icon-color": "var(--primary)" }}>
              <GraduationCap size={22} />
            </div>
          </div>
          <div className="stat-value">{stats?.students?.total || 0}</div>
          <div className="stat-subtitle">
            <span className="badge badge-primary" style={{ padding: "2px 8px" }}>Enrolled Students</span>
          </div>
        </div>

        {/* Students Attendance Health */}
        <div
          className="stat-card"
          style={{ "--card-accent": "var(--accent-gradient)" }}
          onClick={() => {
            setSelectedTitle("Present Students Today");
            setSelectedList(todayRecords.students.filter(r => r.status === "Present"));
          }}
        >
          <div className="stat-top">
            <span className="stat-label">Students Present</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "#ecfdf5", "--stat-icon-color": "#10b981" }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {stats?.students?.present || 0}
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-muted)", marginLeft: "6px" }}>
              ({studentAttendanceRate}%)
            </span>
          </div>
          <div className="stat-subtitle">
            <span className="badge badge-success" style={{ padding: "2px 8px" }}>
              {stats?.students?.absent || 0} Absent
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Click to view</span>
          </div>
        </div>

        {/* Active Interns */}
        <div className="stat-card" style={{ "--card-accent": "var(--secondary-gradient)" }} onClick={() => navigate("/interns")}>
          <div className="stat-top">
            <span className="stat-label">Internships</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "rgba(124, 58, 237, 0.12)", "--stat-icon-color": "#7c3aed" }}>
              <Briefcase size={22} />
            </div>
          </div>
          <div className="stat-value">{stats?.interns?.total || 0}</div>
          <div className="stat-subtitle">
            <span className="badge badge-role-intern" style={{ padding: "2px 8px" }}>
              {stats?.interns?.present || 0} Present Today
            </span>
          </div>
        </div>

        {/* Volunteers */}
        <div className="stat-card" style={{ "--card-accent": "var(--gold-gradient)" }} onClick={() => navigate("/volunteers")}>
          <div className="stat-top">
            <span className="stat-label">Volunteer Network</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "rgba(245, 158, 11, 0.12)", "--stat-icon-color": "#f59e0b" }}>
              <HeartHandshake size={22} />
            </div>
          </div>
          <div className="stat-value">{stats?.volunteers?.total || 0}</div>
          <div className="stat-subtitle">
            <span className="badge badge-role-volunteer" style={{ padding: "2px 8px" }}>
              {stats?.volunteers?.present || 0} Present Today
            </span>
          </div>
        </div>

        {/* Active Projects */}
        <div className="stat-card" style={{ "--card-accent": "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)" }} onClick={() => navigate("/all-projects")}>
          <div className="stat-top">
            <span className="stat-label">Active Projects</span>
            <div className="stat-icon" style={{ "--stat-icon-bg": "rgba(2, 132, 199, 0.12)", "--stat-icon-color": "#0284c7" }}>
              <FolderKanban size={22} />
            </div>
          </div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-subtitle">
            <span className="badge badge-info" style={{ padding: "2px 8px" }}>Field Initiatives</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. MAIN SECTION: 2 BALANCED COLUMNS
          ========================================================= */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        
        {/* LEFT COLUMN: PROGRAM OPERATIONS HUB */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card-header" style={{ marginBottom: 0, paddingBottom: "14px" }}>
            <h3 className="card-title">
              <Layers size={19} color="var(--primary)" /> Program Management Hub
            </h3>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 600 }}>Quick Actions</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Mission Akshar Item */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <GraduationCap size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-heading)", fontSize: "0.9375rem" }}>
                    Mission Akshar (Students)
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {stats?.students?.total || 0} registered &bull; {stats?.students?.present || 0} in class today
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => navigate("/students")} className="btn btn-secondary btn-sm">
                  Directory
                </button>
                <button onClick={() => navigate("/add-student")} className="btn btn-outline btn-sm">
                  <Plus size={13} /> Add
                </button>
                <button onClick={() => navigate("/attendance")} className="btn btn-primary btn-sm">
                  <CalendarCheck size={13} /> Attendance
                </button>
              </div>
            </div>

            {/* Interns Program Item */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(124, 58, 237, 0.12)",
                  color: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-heading)", fontSize: "0.9375rem" }}>
                    Internship Operations
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {stats?.interns?.total || 0} active &bull; certificates & records
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => navigate("/interns")} className="btn btn-secondary btn-sm">
                  Directory
                </button>
                <button onClick={() => navigate("/add-intern")} className="btn btn-outline btn-sm">
                  <Plus size={13} /> Add
                </button>
                <button onClick={() => navigate("/intern-attendance")} className="btn btn-primary btn-sm">
                  <CalendarCheck size={13} /> Attendance
                </button>
              </div>
            </div>

            {/* Volunteer Program Item */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(245, 158, 11, 0.12)",
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <HeartHandshake size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-heading)", fontSize: "0.9375rem" }}>
                    Volunteer Network
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {stats?.volunteers?.total || 0} volunteers &bull; hours & recognition
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => navigate("/volunteers")} className="btn btn-secondary btn-sm">
                  Directory
                </button>
                <button onClick={() => navigate("/add-volunteer")} className="btn btn-outline btn-sm">
                  <Plus size={13} /> Add
                </button>
                <button onClick={() => navigate("/volunteer/bulk-attendance")} className="btn btn-primary btn-sm">
                  <CalendarCheck size={13} /> Bulk Log
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MY SUBMITTED REQUESTS & NOTICES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Requests Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Inbox size={19} color="var(--primary)" /> Change Requests ({myRequests.length})
              </h3>
              <Link to="/my-requests" className="btn btn-outline btn-sm">
                View All <ArrowRight size={13} />
              </Link>
            </div>

            {myRequests.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                <CheckCircle2 size={32} color="var(--success)" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-heading)" }}>All Clear</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  No pending change approval requests.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {myRequests.slice(0, 3).map((req) => (
                  <div 
                    key={req._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-heading)" }}>
                        {req.changeType || "Profile Update"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                        Target: {req.targetCollection}
                      </div>
                    </div>
                    <span className={`badge badge-${req.status === 'approved' ? 'active' : req.status === 'rejected' ? 'absent' : 'pending'}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Foundation Announcements Card */}
          {announcements.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Bell size={19} color="var(--primary)" /> Announcements
                </h3>
                <Link to="/all-announcements" className="btn btn-outline btn-sm">
                  All <ArrowRight size={13} />
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {announcements.slice(0, 2).map((a) => (
                  <div 
                    key={a._id}
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-sm)",
                      borderLeft: "3px solid var(--primary)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-heading)" }}>{a.title}</span>
                      <small style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        {a.date ? new Date(a.date).toLocaleDateString() : "Notice"}
                      </small>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "var(--text-muted)", lineClamp: 2 }}>{a.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          4. VISUAL CHARTS & METRICS
          ========================================================= */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileBarChart size={19} color="var(--primary)" /> Member Attendance Breakdown
            </h3>
          </div>
          <div style={{ height: "260px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "8px", color: "var(--text-main)" }} 
                />
                <Legend />
                <Bar dataKey="count" name="Total Members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="present" name="Present Today" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <PieChartIcon size={19} color="var(--primary)" /> Project Initiatives
            </h3>
          </div>
          <div style={{ height: "260px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={projectStatusData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  innerRadius={45}
                  paddingAngle={5}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "8px", color: "var(--text-main)" }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* =========================================================
          5. MODAL FOR PRESENT / ABSENT STUDENT LIST
          ========================================================= */}
      {selectedList.length > 0 && (
        <div className="modal-overlay" onClick={() => setSelectedList([])}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedTitle} ({selectedList.length})</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setSelectedList([])} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedList.map((r, i) => (
                  <div 
                    key={r._id || i} 
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                      {r.student?.name || r.intern?.name || r.volunteer?.name || "Member Record"}
                    </span>
                    <span className={`badge badge-${r.status?.toLowerCase() === 'present' ? 'active' : 'absent'}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedList([])}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;
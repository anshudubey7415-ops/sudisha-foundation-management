import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  FolderKanban,
  FileBarChart,
  Users,
  Inbox,
  Sun,
  Moon,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserPlus,
  List,
  CalendarCheck,
  CalendarDays,
  PlusCircle,
  Sparkles
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

function Sidebar({ children }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { theme, toggleTheme } = useContext(ThemeContext) || { theme: 'light', toggleTheme: () => {} };
  const { user, logout } = useContext(AuthContext) || {};
  
  const userRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  const userName = user?.name || "User";

  // Automatically detect the active group based on current URL path
  useEffect(() => {
    const path = location.pathname;
    if (userRole !== "intern") {
      if (path.includes("student")) {
        setActiveMenu("students");
      } else if (path.includes("intern") && path !== "/intern-portal") {
        setActiveMenu("interns");
      } else if (path.includes("volunteer")) {
        setActiveMenu("volunteers");
      } else if (path.includes("project")) {
        setActiveMenu("projects");
      }
    } else {
      setActiveMenu(null);
    }
  }, [location.pathname, userRole]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.clear();
      navigate("/login");
    }
  };

  const dashboardRoute = userRole === "admin" 
    ? "/admin-dashboard" 
    : userRole === "intern" 
    ? "/intern-portal" 
    : "/manager-dashboard";

  const handleModuleClick = (menuKey, defaultRoute) => {
    setActiveMenu(menuKey);
    if (!location.pathname.includes(menuKey.slice(0, -1))) {
      navigate(defaultRoute);
    }
    setMobileOpen(false);
  };

  // Helper to determine page title / breadcrumb when no module subnav is active
  const getPageHeaderInfo = () => {
    const path = location.pathname;
    if (path === "/intern-portal") {
      return { title: "Intern Portal (Personal Profile & Records)", icon: <Briefcase size={16} /> };
    }
    if (path === "/admin-dashboard" || path === "/manager-dashboard") {
      return { title: "Dashboard Overview", icon: <LayoutDashboard size={16} /> };
    }
    if (path === "/attendance-report") {
      return { title: "Attendance & Operations Report", icon: <FileBarChart size={16} /> };
    }
    if (path === "/all-announcements") {
      return { title: "Portal Announcements", icon: <Bell size={16} /> };
    }
    if (path === "/admin-requests" || path === "/my-requests") {
      return { title: userRole === "admin" ? "Approval Requests" : "My Requests", icon: <Inbox size={16} /> };
    }
    if (path === "/user-management") {
      return { title: "User & Role Management", icon: <Users size={16} /> };
    }
    if (path === "/settings") {
      return { title: "Account & System Settings", icon: <Settings size={16} /> };
    }
    return { title: "Sudisha Foundation", icon: <Sparkles size={16} /> };
  };

  const headerInfo = getPageHeaderInfo();

  return (
    <div className="app-layout">
      {/* =========================================================
          1. VERTICAL LEFT SIDEBAR
          ========================================================= */}
      <aside className={`app-sidebar no-print ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-wrapper">
          <Link to={dashboardRoute} className="sidebar-brand" onClick={() => setActiveMenu(null)}>
            <div className="sidebar-logo-icon">
              <img src="/logo.png" alt="Sudisha Foundation logo" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Sudisha Foundation</span>
              <span className="sidebar-brand-badge">Management Portal</span>
            </div>
          </Link>
          <button 
            className="sidebar-close-mobile-btn" 
            onClick={() => setMobileOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Vertical Navigation Menu */}
        <nav className="sidebar-menu">
          {userRole === "intern" ? (
            <>
              {/* SECTION: INTERN PORTAL */}
              <div className="sidebar-section-label">MY WORKSPACE</div>
              
              <Link
                to="/intern-portal"
                onClick={() => setActiveMenu(null)}
                className={`sidebar-nav-item ${
                  location.pathname === "/intern-portal" ? "active" : ""
                }`}
              >
                <div className="sidebar-item-left">
                  <Briefcase size={18} />
                  <span>My Profile & Portal</span>
                </div>
              </Link>

              {/* SECTION: COMMUNICATION */}
              <div className="sidebar-section-label">COMMUNICATION</div>

              <Link
                to="/all-announcements"
                onClick={() => setActiveMenu(null)}
                className={`sidebar-nav-item ${location.pathname === "/all-announcements" ? "active" : ""}`}
              >
                <div className="sidebar-item-left">
                  <Bell size={18} />
                  <span>Announcements</span>
                </div>
              </Link>

              <div className="sidebar-section-label">PREFERENCES</div>

              <Link
                to="/settings"
                onClick={() => setActiveMenu(null)}
                className={`sidebar-nav-item ${location.pathname === "/settings" ? "active" : ""}`}
              >
                <div className="sidebar-item-left">
                  <Settings size={18} />
                  <span>Account Settings</span>
                </div>
              </Link>
            </>
          ) : (
            <>
              {/* SECTION: MAIN */}
              <div className="sidebar-section-label">MAIN</div>

              <Link
                to={dashboardRoute}
                onClick={() => setActiveMenu(null)}
                className={`sidebar-nav-item ${
                  location.pathname === "/admin-dashboard" || location.pathname === "/manager-dashboard"
                    ? "active"
                    : ""
                }`}
              >
                <div className="sidebar-item-left">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </div>
              </Link>

              {/* SECTION: MODULES & PROGRAMS */}
              <div className="sidebar-section-label">PROGRAMS & MODULES</div>

              {/* 1. Students Module */}
              <button
                type="button"
                onClick={() => handleModuleClick("students", "/students")}
                className={`sidebar-nav-item ${
                  activeMenu === "students" || location.pathname.includes("student") ? "active" : ""
                }`}
              >
                <div className="sidebar-item-left">
                  <GraduationCap size={18} />
                  <span>Students</span>
                </div>
                <ChevronRight
                  size={15}
                  className={`sidebar-chevron ${activeMenu === "students" ? "rotate-90" : ""}`}
                />
              </button>

              {/* 2. Interns Module */}
              <button
                type="button"
                onClick={() => handleModuleClick("interns", "/interns")}
                className={`sidebar-nav-item ${
                  activeMenu === "interns" || location.pathname.includes("intern") ? "active" : ""
                }`}
              >
                <div className="sidebar-item-left">
                  <Briefcase size={18} />
                  <span>Interns</span>
                </div>
                <ChevronRight
                  size={15}
                  className={`sidebar-chevron ${activeMenu === "interns" ? "rotate-90" : ""}`}
                />
              </button>

              {/* 3. Volunteers Module */}
              <button
                type="button"
                onClick={() => handleModuleClick("volunteers", "/volunteers")}
                className={`sidebar-nav-item ${
                  activeMenu === "volunteers" || location.pathname.includes("volunteer") ? "active" : ""
                }`}
              >
                <div className="sidebar-item-left">
                  <HeartHandshake size={18} />
                  <span>Volunteers</span>
                </div>
                <ChevronRight
                  size={15}
                  className={`sidebar-chevron ${activeMenu === "volunteers" ? "rotate-90" : ""}`}
                />
              </button>

              {/* 4. Projects Module */}
              <button
                type="button"
                onClick={() => handleModuleClick("projects", "/all-projects")}
                className={`sidebar-nav-item ${
                  activeMenu === "projects" || location.pathname.includes("project") ? "active" : ""
                }`}
              >
                <div className="sidebar-item-left">
                  <FolderKanban size={18} />
                  <span>Projects</span>
                </div>
                <ChevronRight
                  size={15}
                  className={`sidebar-chevron ${activeMenu === "projects" ? "rotate-90" : ""}`}
                />
              </button>

              {/* SECTION: OPERATIONS */}
              <div className="sidebar-section-label">OPERATIONS & REPORTS</div>

              <Link
                to="/attendance-report"
                onClick={() => setActiveMenu(null)}
                className={`sidebar-nav-item ${location.pathname === "/attendance-report" ? "active" : ""}`}
              >
                <div className="sidebar-item-left">
                  <FileBarChart size={18} />
                  <span>Reports</span>
                </div>
              </Link>

              <Link
                to="/all-announcements"
                onClick={() => setActiveMenu(null)}
                className={`sidebar-nav-item ${location.pathname === "/all-announcements" ? "active" : ""}`}
              >
                <div className="sidebar-item-left">
                  <Bell size={18} />
                  <span>Announcements</span>
                </div>
              </Link>

              {userRole === "admin" && (
                <Link
                  to="/admin-requests"
                  onClick={() => setActiveMenu(null)}
                  className={`sidebar-nav-item ${location.pathname === "/admin-requests" ? "active" : ""}`}
                >
                  <div className="sidebar-item-left">
                    <Inbox size={18} />
                    <span>Requests</span>
                  </div>
                </Link>
              )}

              {userRole === "manager" && (
                <Link
                  to="/my-requests"
                  onClick={() => setActiveMenu(null)}
                  className={`sidebar-nav-item ${location.pathname === "/my-requests" ? "active" : ""}`}
                >
                  <div className="sidebar-item-left">
                    <Inbox size={18} />
                    <span>My Requests</span>
                  </div>
                </Link>
              )}

              {userRole === "admin" && (
                <Link
                  to="/user-management"
                  onClick={() => setActiveMenu(null)}
                  className={`sidebar-nav-item ${location.pathname === "/user-management" ? "active" : ""}`}
                >
                  <div className="sidebar-item-left">
                    <Users size={18} />
                    <span>Users</span>
                  </div>
                </Link>
              )}

              <Link
                to="/settings"
                onClick={() => setActiveMenu(null)}
                className={`sidebar-nav-item ${location.pathname === "/settings" ? "active" : ""}`}
              >
                <div className="sidebar-item-left">
                  <Settings size={18} />
                  <span>Settings</span>
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Sidebar Footer: User Card & Action Toolbar */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{userName}</span>
              <span className={`badge badge-role-${userRole || "admin"}`}>
                {userRole || "Member"}
              </span>
            </div>
          </div>

          <div className="sidebar-footer-actions">
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-icon"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              style={{ flex: 1, height: "34px", padding: 0 }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              to="/settings"
              className="btn btn-secondary btn-icon"
              title="Settings"
              style={{ flex: 1, height: "34px", padding: 0 }}
            >
              <Settings size={16} />
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-icon"
              style={{
                flex: 1,
                height: "34px",
                padding: 0,
                color: "var(--danger)",
                borderColor: "rgba(239, 68, 68, 0.3)"
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =========================================================
          2. MAIN CONTENT WRAPPER (RIGHT SIDE)
          ========================================================= */}
      <div className="app-main-wrapper">
        {/* TOP HEADER BAR (Contains Horizontal Sub-Navigation Strip) */}
        <header className="app-top-header no-print">
          <div className="top-header-inner">
            {/* Left: Mobile Hamburger Toggle */}
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>

            {/* Horizontal Sub-Navigation Strip (Exact match to Screenshot 2) */}
            <div className="top-subnav-wrapper">
              {activeMenu === "students" && (
                <div className="top-subnav-container">
                  <span className="top-subnav-title">
                    <GraduationCap size={16} /> Mission Akshar:
                  </span>
                  <Link
                    to="/students"
                    className={`top-subnav-item ${location.pathname === "/students" ? "active" : ""}`}
                  >
                    <List size={14} /> Student List
                  </Link>
                  <Link
                    to="/add-student"
                    className={`top-subnav-item ${location.pathname === "/add-student" ? "active" : ""}`}
                  >
                    <UserPlus size={14} /> Add Student
                  </Link>
                  <Link
                    to="/attendance"
                    className={`top-subnav-item ${location.pathname === "/attendance" ? "active" : ""}`}
                  >
                    <CalendarCheck size={14} /> Mark Attendance
                  </Link>
                  <Link
                    to="/attendance-history"
                    className={`top-subnav-item ${location.pathname === "/attendance-history" ? "active" : ""}`}
                  >
                    <FileBarChart size={14} /> Attendance Summary
                  </Link>
                  <Link
                    to="/date-wise-attendance"
                    className={`top-subnav-item ${location.pathname === "/date-wise-attendance" ? "active" : ""}`}
                  >
                    <CalendarDays size={14} /> Date-Wise Log
                  </Link>
                  <button
                    onClick={() => setActiveMenu(null)}
                    className="top-subnav-close-btn"
                    title="Close Sub-Menu"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {activeMenu === "interns" && (
                <div className="top-subnav-container">
                  <span className="top-subnav-title">
                    <Briefcase size={16} /> Intern Module:
                  </span>
                  <Link
                    to="/interns"
                    className={`top-subnav-item ${location.pathname === "/interns" ? "active" : ""}`}
                  >
                    <List size={14} /> Intern Directory
                  </Link>
                  <Link
                    to="/add-intern"
                    className={`top-subnav-item ${location.pathname === "/add-intern" ? "active" : ""}`}
                  >
                    <UserPlus size={14} /> Add Intern
                  </Link>
                  <Link
                    to="/intern-attendance"
                    className={`top-subnav-item ${location.pathname === "/intern-attendance" ? "active" : ""}`}
                  >
                    <CalendarCheck size={14} /> Mark Attendance
                  </Link>
                  <Link
                    to="/intern-attendance-history"
                    className={`top-subnav-item ${location.pathname === "/intern-attendance-history" ? "active" : ""}`}
                  >
                    <FileBarChart size={14} /> Attendance Log
                  </Link>
                  <Link
                    to="/all-projects"
                    className={`top-subnav-item ${location.pathname === "/all-projects" ? "active" : ""}`}
                  >
                    <FolderKanban size={14} /> Projects
                  </Link>
                  <Link
                    to="/add-project"
                    className={`top-subnav-item ${location.pathname === "/add-project" ? "active" : ""}`}
                  >
                    <PlusCircle size={14} /> Assign Project
                  </Link>
                  <button
                    onClick={() => setActiveMenu(null)}
                    className="top-subnav-close-btn"
                    title="Close Sub-Menu"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {activeMenu === "volunteers" && (
                <div className="top-subnav-container">
                  <span className="top-subnav-title">
                    <HeartHandshake size={16} /> Volunteer Module:
                  </span>
                  <Link
                    to="/volunteers"
                    className={`top-subnav-item ${location.pathname === "/volunteers" ? "active" : ""}`}
                  >
                    <List size={14} /> Volunteer Directory
                  </Link>
                  <Link
                    to="/add-volunteer"
                    className={`top-subnav-item ${location.pathname === "/add-volunteer" ? "active" : ""}`}
                  >
                    <UserPlus size={14} /> Add Volunteer
                  </Link>
                  <Link
                    to="/volunteer/bulk-attendance"
                    className={`top-subnav-item ${location.pathname === "/volunteer/bulk-attendance" ? "active" : ""}`}
                  >
                    <CalendarCheck size={14} /> Bulk Attendance
                  </Link>
                  <Link
                    to="/volunteer-date-attendance"
                    className={`top-subnav-item ${location.pathname === "/volunteer-date-attendance" ? "active" : ""}`}
                  >
                    <CalendarDays size={14} /> Date-Wise Records
                  </Link>
                  <button
                    onClick={() => setActiveMenu(null)}
                    className="top-subnav-close-btn"
                    title="Close Sub-Menu"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {activeMenu === "projects" && (
                <div className="top-subnav-container">
                  <span className="top-subnav-title">
                    <FolderKanban size={16} /> Projects Module:
                  </span>
                  <Link
                    to="/all-projects"
                    className={`top-subnav-item ${location.pathname === "/all-projects" ? "active" : ""}`}
                  >
                    <List size={14} /> All Projects
                  </Link>
                  <Link
                    to="/add-project"
                    className={`top-subnav-item ${location.pathname === "/add-project" ? "active" : ""}`}
                  >
                    <PlusCircle size={14} /> Create Project
                  </Link>
                  <button
                    onClick={() => setActiveMenu(null)}
                    className="top-subnav-close-btn"
                    title="Close Sub-Menu"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Default Breadcrumb when no module subnav is selected */}
              {!activeMenu && (
                <div className="top-header-breadcrumb">
                  <span className="breadcrumb-icon">{headerInfo.icon}</span>
                  <span className="breadcrumb-title">{headerInfo.title}</span>
                </div>
              )}
            </div>

            {/* Right Tools: Theme, Notifications, User Chip, Logout (Show on Dashboard & Portal pages) */}
            {(location.pathname === "/admin-dashboard" || location.pathname === "/manager-dashboard" || location.pathname === "/intern-portal" || location.pathname === "/") && (
              <div className="top-header-tools">
                <button
                  onClick={toggleTheme}
                  className="btn btn-secondary btn-icon"
                  title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                  aria-label="Toggle Theme"
                  style={{ width: "34px", height: "34px", padding: 0 }}
                >
                  {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                <Link
                  to="/all-announcements"
                  className="btn btn-secondary btn-icon"
                  title="Announcements"
                  style={{ width: "34px", height: "34px", padding: 0 }}
                >
                  <Bell size={17} />
                </Link>

                {/* User Chip */}
                <div className="top-user-chip">
                  <div className="user-avatar-circle">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="top-user-text">
                    <span className="top-user-name">{userName.split(" ")[0]}</span>
                    <span className={`badge badge-role-${userRole || "admin"}`}>
                      {userRole || "Member"}
                    </span>
                  </div>
                </div>

                <Link
                  to="/settings"
                  className="btn btn-secondary btn-icon"
                  title="Settings"
                  style={{ width: "34px", height: "34px", padding: 0 }}
                >
                  <Settings size={17} />
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm logout-top-btn"
                  style={{
                    color: "var(--danger)",
                    borderColor: "rgba(239,68,68,0.3)",
                    padding: "6px 12px"
                  }}
                  title="Sign Out"
                >
                  <LogOut size={15} /> <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="app-content-body">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Sidebar;
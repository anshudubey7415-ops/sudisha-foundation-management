import { useEffect, useState, useMemo } from "react";
import { CheckCircle2, XCircle, Check, X, Home, Loader2 } from "lucide-react";
import API from "../api";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";

function InternAttendance() {
  const { showSuccess, showError, showWarning } = useToast();
  const [interns, setInterns] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const res = await API.get("/interns");
      const list = Array.isArray(res.data) ? res.data : [];
      setInterns(list);

      // Default all to Present
      const initial = {};
      list.forEach((i) => {
        initial[i._id] = "Present";
      });
      setAttendance(initial);
    } catch (err) {
      console.error("Error fetching interns:", err);
      showError("Failed to load interns");
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    const set = new Set(interns.map((i) => i.department).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [interns]);

  const activeInterns = useMemo(() => {
    return interns.filter((intern) => {
      // Check date validity
      const start = intern.startDate || intern.joiningDate;
      const end = intern.endDate;
      const formattedStart = start ? (start.includes("T") ? start.split("T")[0] : start) : "";
      const formattedEnd = end ? (end.includes("T") ? end.split("T")[0] : end) : "";

      const withinDate =
        (!formattedStart || selectedDate >= formattedStart) &&
        (!formattedEnd || selectedDate <= formattedEnd);
      const isStatusActive = !intern.status || intern.status === "Active";

      const matchesSearch = `${intern.name || ""} ${intern.internId || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === "All" || intern.department === selectedDept;

      return withinDate && isStatusActive && matchesSearch && matchesDept;
    });
  }, [interns, selectedDate, searchTerm, selectedDept]);

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let wfh = 0;
    activeInterns.forEach((i) => {
      const status = attendance[i._id];
      if (status === "Present") present++;
      else if (status === "Absent") absent++;
      else if (status === "Work From Home") wfh++;
    });
    const total = activeInterns.length;
    const rate = total > 0 ? Math.round(((present + wfh) / total) * 100) : 0;
    return { present, absent, wfh, total, rate };
  }, [activeInterns, attendance]);

  const setAllStatus = (status) => {
    setAttendance((prev) => {
      const updated = { ...prev };
      activeInterns.forEach((i) => {
        updated[i._id] = status;
      });
      return updated;
    });
  };

  const handleToggle = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const saveAllAttendance = async () => {
    if (activeInterns.length === 0) {
      showWarning("No active interns to record attendance for.");
      return;
    }

    try {
      setSaving(true);
      const records = activeInterns.map((i) => ({
        intern: i._id,
        status: attendance[i._id] || "Present",
        date: selectedDate,
      }));

      // Use bulk endpoint
      await API.post("/intern-attendance/bulk", { records });
      showSuccess(`Attendance for ${records.length} interns saved successfully!`);
    } catch (err) {
      console.error("Error saving intern attendance:", err);
      // Fallback single post if bulk fails
      try {
        for (const [internId, status] of Object.entries(attendance)) {
          if (activeInterns.some((i) => i._id === internId)) {
            await API.post("/intern-attendance/mark", {
              intern: internId,
              status,
              date: selectedDate,
            });
          }
        }
        showSuccess("Attendance recorded successfully!");
      } catch (innerErr) {
        console.error(innerErr);
        showError("Failed to save intern attendance records.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout
      title="Intern Attendance Tracker"
      actions={
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setAllStatus("Present")} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={14} /> Mark All Present
          </button>
          <button onClick={() => setAllStatus("Absent")} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <XCircle size={14} /> Mark All Absent
          </button>
        </div>
      }
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Controls */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Attendance Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Search Intern</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or Intern ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Department</label>
              <select
                className="form-control"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d === "All" ? "All Departments" : d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
          <div className="card" style={{ padding: "16px", textAlign: "center", borderLeft: "4px solid var(--primary)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Active Interns</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)" }}>{stats.total}</div>
          </div>
          <div className="card" style={{ padding: "16px", textAlign: "center", borderLeft: "4px solid #10b981" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Present</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#10b981" }}>{stats.present}</div>
          </div>
          <div className="card" style={{ padding: "16px", textAlign: "center", borderLeft: "4px solid #3b82f6" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Work From Home</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#3b82f6" }}>{stats.wfh}</div>
          </div>
          <div className="card" style={{ padding: "16px", textAlign: "center", borderLeft: "4px solid #ef4444" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Absent</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ef4444" }}>{stats.absent}</div>
          </div>
        </div>

        {/* Interns List */}
        {loading ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading interns...
          </div>
        ) : activeInterns.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No active interns found for the selected date and filters.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {activeInterns.map((intern) => {
              const status = attendance[intern._id] || "Present";
              const isPresent = status === "Present";
              const isWFH = status === "Work From Home";
              const isAbsent = status === "Absent";

              return (
                <div
                  key={intern._id}
                  className="card"
                  style={{
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    borderLeft: isPresent
                      ? "4px solid #10b981"
                      : isWFH
                      ? "4px solid #3b82f6"
                      : "4px solid #ef4444",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.15))",
                        color: "#a855f7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {intern.name ? intern.name[0].toUpperCase() : "I"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.98rem", color: "var(--text-primary)" }}>
                        {intern.name}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", gap: "10px" }}>
                        <span>ID: {intern.internId || "N/A"}</span>
                        <span>•</span>
                        <span>{intern.department || "General"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(intern._id, "Present")}
                      className={`btn btn-sm ${isPresent ? "btn-success" : "btn-secondary"}`}
                      style={{ minWidth: "80px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      <Check size={14} /> Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(intern._id, "Work From Home")}
                      className={`btn btn-sm ${isWFH ? "btn-primary" : "btn-secondary"}`}
                      style={{ minWidth: "80px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      <Home size={14} /> WFH
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(intern._id, "Absent")}
                      className={`btn btn-sm ${isAbsent ? "btn-danger" : "btn-secondary"}`}
                      style={{ minWidth: "80px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      <X size={14} /> Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={saveAllAttendance}
            className="btn btn-primary"
            disabled={saving || activeInterns.length === 0}
            style={{ padding: "12px 36px", fontSize: "1rem", width: "100%", maxWidth: "300px", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="spin" /> Saving Records...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} /> Save Intern Attendance
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default InternAttendance;
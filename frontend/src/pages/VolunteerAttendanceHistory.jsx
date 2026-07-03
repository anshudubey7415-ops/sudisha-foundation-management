import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const STATUS_COLORS = {
  Present: "#16a34a",
  Absent: "#dc2626",
  "Half Day": "#f59e0b",
  "Work From Home": "#2563eb",
};

const ROWS_PER_PAGE = 8;

function VolunteerAttendanceHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const reportRef = useRef();

  // Helper function to safely format date values string into YYYY-MM-DD format
  const formatDateString = (dateVal) => {
    if (!dateVal) return "—";
    return dateVal.split("T")[0];
  };

  // Wrapped fetchHistory inside useCallback to fix React dependency arrays cleanly
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // FIXED: Endpoint changed from /volunteerAttendance/volunteer/ to /volunteer-attendance/volunteer/ to match server.js
      const res = await API.get(`/volunteer-attendance/volunteer/${id}`);
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load attendance history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Reset to page 1 whenever the filters change so the user isn't stuck on an empty page
  useEffect(() => {
    setPage(1);
  }, [search, fromDate, toDate]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const status = item.status || "";
      const remarks = item.remarks || "";
      const query = search.toLowerCase();

      const matchSearch =
        status.toLowerCase().includes(query) ||
        remarks.toLowerCase().includes(query);

      // Extract the raw YYYY-MM-DD string part for exact date evaluations
      const normalizedItemDate = item.date ? item.date.split("T")[0] : "";

      let matchDate = true;
      if (fromDate) matchDate = normalizedItemDate >= fromDate;
      if (matchDate && toDate) matchDate = normalizedItemDate <= toDate;

      return matchSearch && matchDate;
    });
  }, [records, search, fromDate, toDate]);

  const stats = useMemo(() => {
    const present = filteredRecords.filter((r) => r.status === "Present").length;
    const absent = filteredRecords.filter((r) => r.status === "Absent").length;
    const halfDay = filteredRecords.filter((r) => r.status === "Half Day").length;
    const wfh = filteredRecords.filter((r) => r.status === "Work From Home").length;
    const totalHours = filteredRecords.reduce(
      (total, r) => total + (Number(r.hoursWorked) || 0),
      0
    );
    const total = filteredRecords.length;
    const attendancePct = total > 0 ? Math.round(((present + halfDay + wfh) / total) * 100) : 0;

    return { present, absent, halfDay, wfh, totalHours, attendancePct, total };
  }, [filteredRecords]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ROWS_PER_PAGE));

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredRecords.slice(start, start + ROWS_PER_PAGE);
  }, [filteredRecords, page]);

  const downloadCSV = () => {
    const headers = ["Date", "Status", "CheckIn", "CheckOut", "Hours", "Remarks"];

    const escapeCell = (value) => {
      const str = String(value ?? "");
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const rows = filteredRecords.map((r) =>
      [formatDateString(r.date), r.status, r.checkIn, r.checkOut, r.hoursWorked, r.remarks]
        .map(escapeCell)
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "VolunteerAttendance.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteAttendance = async (recordId) => {
    const ok = window.confirm("Delete this attendance record? This cannot be undone.");
    if (!ok) return;

    try {
      // FIXED: Endpoint changed from /volunteerAttendance/ to /volunteer-attendance/ to match server.js
      await API.delete(`/volunteer-attendance/${recordId}`);
      fetchHistory();
    } catch (err) {
      console.error(err);
      window.alert("Could not delete this record. Please try again.");
    }
  };

  const editAttendance = (record) => {
    // FIXED: Standardized application route layout navigation targeting kebab-case setup
    navigate(`/volunteer-attendance/edit/${record._id}`);
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save("VolunteerAttendance.pdf");
  };

  return (
    <div className="vah-page">
      <style>{styles}</style>

      <div ref={reportRef} className="vah-report">
        <div className="vah-header">
          <div>
            <h1>Volunteer Attendance</h1>
            <p className="vah-subtitle">
              {stats.total} record{stats.total !== 1 ? "s" : ""} · {stats.attendancePct}% attendance
            </p>
          </div>

          <div className="vah-actions">
            <button className="vah-btn vah-btn-outline" onClick={downloadPDF}>
              Export PDF
            </button>
            <button className="vah-btn vah-btn-outline" onClick={downloadCSV}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="vah-filters">
          <input
            type="text"
            className="vah-input"
            placeholder="Search status or remarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="date"
            className="vah-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="vah-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          {(search || fromDate || toDate) && (
            <button
              className="vah-btn vah-btn-ghost"
              onClick={() => {
                setSearch("");
                setFromDate("");
                setToDate("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="vah-cards">
          <Card title="Present" value={stats.present} color={STATUS_COLORS.Present} />
          <Card title="Absent" value={stats.absent} color={STATUS_COLORS.Absent} />
          <Card title="Half Day" value={stats.halfDay} color={STATUS_COLORS["Half Day"]} />
          <Card title="WFH" value={stats.wfh} color={STATUS_COLORS["Work From Home"]} />
          <Card title="Total Hours" value={stats.totalHours} color="#7c3aed" />
          <Card title="Attendance %" value={`${stats.attendancePct}%`} color="#0f766e" />
        </div>

        {loading && <p className="vah-state">Loading attendance history...</p>}
        {!loading && error && <p className="vah-state vah-error">{error}</p>}
        {!loading && !error && filteredRecords.length === 0 && (
          <p className="vah-state">No attendance records match your filters.</p>
        )}

        {!loading && !error && filteredRecords.length > 0 && (
          <div className="vah-table-wrap">
            <table className="vah-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record) => (
                  <tr key={record._id}>
                    <td>{formatDateString(record.date)}</td>
                    <td>
                      <span
                        className="vah-badge"
                        style={{
                          backgroundColor: `${STATUS_COLORS[record.status] || "#64748b"}1a`,
                          color: STATUS_COLORS[record.status] || "#64748b",
                        }}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>{record.checkIn || "—"}</td>
                    <td>{record.checkOut || "—"}</td>
                    <td>{record.hoursWorked || "0"}</td>
                    <td>{record.remarks || "—"}</td>
                    <td>
                      <div className="vah-row-actions">
                        <button
                          className="vah-btn vah-btn-small vah-btn-outline"
                          onClick={() => editAttendance(record)}
                        >
                          Edit
                        </button>
                        <button
                          className="vah-btn vah-btn-small vah-btn-danger"
                          onClick={() => deleteAttendance(record._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && filteredRecords.length > 0 && (
        <div className="vah-pagination">
          <button
            className="vah-btn vah-btn-outline vah-btn-small"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="vah-page-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="vah-btn vah-btn-outline vah-btn-small"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="vah-card" style={{ borderTopColor: color }}>
      <h3 style={{ color }}>{title}</h3>
      <p className="vah-card-value">{value}</p>
    </div>
  );
}

const styles = `
  .vah-page {
    font-family: "Segoe UI", Roboto, -apple-system, sans-serif;
    color: #1e293b;
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px;
  }
  .vah-report { background: #ffffff; }
  .vah-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }
  .vah-header h1 { margin: 0; font-size: 24px; }
  .vah-subtitle { margin: 4px 0 0; color: #64748b; font-size: 14px; }
  .vah-actions { display: flex; gap: 10px; }
  .vah-link { text-decoration: none; }

  .vah-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .vah-input {
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
  }
  .vah-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #2563eb22; }

  .vah-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  .vah-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-top: 3px solid #94a3b8;
    border-radius: 10px;
    padding: 14px 16px;
  }
  .vah-card h3 { margin: 0 0 6px; font-size: 13px; font-weight: 600; }
  .vah-card-value { margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; }

  .vah-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; }
  .vah-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 700px; }
  .vah-table thead th {
    background: #2563eb;
    color: #fff;
    text-align: left;
    padding: 12px 14px;
    font-weight: 600;
  }
  .vah-table tbody td { padding: 12px 14px; border-top: 1px solid #e2e8f0; }
  .vah-table tbody tr:hover { background: #f8fafc; }

  .vah-badge {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    display: inline-block;
  }

  .vah-row-actions { display: flex; gap: 8px; }

  .vah-btn {
    border: none;
    border-radius: 7px;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .vah-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .vah-btn-small { padding: 6px 10px; font-size: 12px; }
  .vah-btn-outline { background: #fff; border: 1px solid #cbd5e1; color: #1e293b; }
  .vah-btn-outline:hover:not(:disabled) { background: #f1f5f9; }
  .vah-btn-ghost { background: transparent; color: #2563eb; }
  .vah-btn-danger { background: #fee2e2; color: #dc2626; }
  .vah-btn-danger:hover { background: #fecaca; }

  .vah-state { padding: 30px; text-align: center; color: #64748b; }
  .vah-error { color: #dc2626; }

  .vah-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 18px;
  }
  .vah-page-info { font-size: 13px; color: #64748b; }
`;

export default VolunteerAttendanceHistory;
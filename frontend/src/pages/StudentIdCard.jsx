import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ArrowLeft, CreditCard, Printer, Download, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import API, { getUploadUrl } from "../api";

function StudentIdCard() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/students/${id}`);
        setStudent(res.data);
      } catch (error) {
        console.error("Error fetching student:", error);
        showError("Error loading student ID card data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, showError]);

  const printCard = () => {
    window.print();
  };

  const downloadPDF = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      // Center card on A4 page
      pdf.addImage(imgData, "PNG", 55, 30, 100, 150);
      pdf.save(`Student_ID_${student?.rollNumber || student?.name}.pdf`);
      showSuccess("ID Card PDF downloaded!");
    } catch (err) {
      console.error(err);
      showError("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "12px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "50%", marginBottom: "12px" }}>
          <Loader2 size={24} className="animate-spin" />
        </div>
        <h3>Loading Student ID Card...</h3>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Student Not Found</h2>
        <Link to="/students" className="btn btn-primary" style={{ marginTop: "16px" }}>
          Return to Student Directory
        </Link>
      </div>
    );
  }

  const qrData = JSON.stringify({
    org: "Sudisha Foundation",
    program: "Mission Akshar",
    rollNumber: student.rollNumber,
    name: student.name,
    class: student.class,
    phone: student.phone || "",
  });

  return (
    <div>
      <div className="page-header no-print">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/students" className="btn btn-secondary btn-icon" title="Back to Students">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={22} color="var(--primary)" /> Student Identity Card
              </h1>
              <p>{student.name} &bull; Roll No: {student.rollNumber}</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <button onClick={printCard} className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Printer size={16} /> Print ID Card
          </button>
          <button onClick={downloadPDF} disabled={downloading} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {downloading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download High-Res PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* ID Card Display Area */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
        <div
          ref={cardRef}
          className="printable-area"
          style={{
            width: "380px",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
            border: "2px solid #2563eb",
            overflow: "hidden",
            position: "relative",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#0f172a"
          }}
        >
          {/* Card Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              color: "#ffffff",
              padding: "18px 16px 14px",
              textAlign: "center",
              position: "relative"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
              <img src="/logo.png" alt="Logo" style={{ width: "24px", height: "24px", objectFit: "contain", filter: "brightness(0) invert(1)" }} onError={(e) => { e.target.style.display = 'none'; }} />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#ffffff", letterSpacing: "0.02em" }}>
                SUDISHA FOUNDATION
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#bfdbfe", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Mission Akshar &bull; Student Identity Card
            </p>
          </div>

          {/* Photo & Badge */}
          <div style={{ padding: "20px 24px 16px", textAlign: "center" }}>
            <div style={{ position: "relative", width: "110px", height: "110px", margin: "0 auto 12px" }}>
              {student.photo ? (
                <img
                  src={getUploadUrl(student.photo)}
                  alt={student.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #2563eb",
                    boxShadow: "0 4px 10px rgba(37,99,235,0.2)"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    border: "4px solid #2563eb"
                  }}
                >
                  {student.name?.charAt(0) || "S"}
                </div>
              )}
            </div>

            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1e3a8a", margin: "0 0 2px" }}>
              {student.name}
            </h3>
            <span
              style={{
                display: "inline-block",
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "2px 10px",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: 700,
                border: "1px solid #bfdbfe",
                marginBottom: "14px"
              }}
            >
              Class: {student.class}
            </span>

            {/* Table Details */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "10px",
                padding: "12px 14px",
                textAlign: "left",
                fontSize: "0.825rem",
                border: "1px solid #e2e8f0",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 12px"
              }}
            >
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>ROLL NUMBER</span>
                <strong style={{ color: "#0f172a", fontFamily: "'JetBrains Mono', monospace" }}>{student.rollNumber}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>ADMISSION DATE</span>
                <strong style={{ color: "#0f172a" }}>{student.admissionDate || "—"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>FATHER'S NAME</span>
                <strong style={{ color: "#0f172a" }}>{student.fatherName || "—"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>EMERGENCY CONTACT</span>
                <strong style={{ color: "#0f172a" }}>{student.phone || "—"}</strong>
              </div>
            </div>

            {/* QR Code & Authority Seal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "0 10px" }}>
              <div style={{ textAlign: "center" }}>
                <QRCodeCanvas value={qrData} size={70} />
                <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>Scan to Verify</div>
              </div>

              <div style={{ textAlign: "center" }}>
                <img src="/signature.png" alt="Signature" style={{ width: "90px", height: "32px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
                <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "2px", fontSize: "0.65rem", fontWeight: 700, color: "#1e3a8a" }}>
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div
            style={{
              background: "#1e293b",
              color: "#f8fafc",
              padding: "6px 12px",
              textAlign: "center",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.02em"
            }}
          >
            Sudisha Foundation &bull; www.sudishafoundation.org
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentIdCard;
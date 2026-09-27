import { useEffect, useState, useRef, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ArrowLeft, CreditCard, Printer, Download, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";
import API, { getUploadUrl } from "../api";

function InternIdCard() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const userRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  const backLink = userRole === "intern" ? "/intern-portal" : "/interns";

  const [intern, setIntern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const fetchIntern = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/interns/${id}`);
        setIntern(res.data);
      } catch (error) {
        console.error("Error fetching intern:", error);
        showError("Error loading intern ID card data");
      } finally {
        setLoading(false);
      }
    };

    fetchIntern();
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
      pdf.addImage(imgData, "PNG", 55, 30, 100, 150);
      pdf.save(`Intern_ID_${intern?.internId || intern?.name}.pdf`);
      showSuccess("Intern ID Card PDF downloaded!");
    } catch (err) {
      console.error(err);
      showError("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
        <h3>Loading Intern ID Card...</h3>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Intern Not Found</h2>
        <Link to={backLink} className="btn btn-primary" style={{ marginTop: "16px" }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (userRole === "intern" && !intern.allowIdCard) {
    return (
      <div className="card" style={{ maxWidth: "500px", margin: "60px auto", padding: "36px 30px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "16px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "50%", marginBottom: "16px" }}>
          <CreditCard size={40} />
        </div>
        <h2>ID Card Not Yet Approved</h2>
        <p style={{ marginTop: "8px", marginBottom: "24px", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Your official digital identity card has not been approved for viewing by the administrator yet.
        </p>
        <Link to="/intern-portal" className="btn btn-primary">
          Return to Intern Portal
        </Link>
      </div>
    );
  }

  const qrData = JSON.stringify({
    org: "Sudisha Foundation",
    type: "Intern",
    internId: intern.internId,
    name: intern.name,
    department: intern.department,
    validUntil: intern.endDate,
  });

  return (
    <div>
      <div className="page-header no-print">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to={backLink} className="btn btn-secondary btn-icon" title={userRole === "intern" ? "Back to Portal" : "Back to Interns"}>
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={24} style={{ color: "var(--primary)" }} /> Intern Identity Card
              </h1>
              <p>{intern.name} &bull; ID: {intern.internId}</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <button onClick={printCard} className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Printer size={16} /> Print ID Card
          </button>
          <button onClick={downloadPDF} disabled={downloading} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {downloading ? (
              <>
                <Loader2 size={16} className="spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download High-Res PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
        <div
          ref={cardRef}
          className="printable-area"
          style={{
            width: "380px",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
            border: "2px solid #7c3aed",
            overflow: "hidden",
            position: "relative",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#0f172a"
          }}
        >
          {/* Card Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
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
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#e9d5ff", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Official Intern Identity Badge
            </p>
          </div>

          {/* Photo & Details */}
          <div style={{ padding: "20px 24px 16px", textAlign: "center" }}>
            <div style={{ position: "relative", width: "110px", height: "110px", margin: "0 auto 12px" }}>
              {intern.photo ? (
                <img
                  src={getUploadUrl(intern.photo)}
                  alt={intern.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #7c3aed",
                    boxShadow: "0 4px 10px rgba(124,58,237,0.2)"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "rgba(124,58,237,0.1)",
                    color: "#7c3aed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    border: "4px solid #7c3aed"
                  }}
                >
                  {intern.name?.charAt(0) || "I"}
                </div>
              )}
            </div>

            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#4f46e5", margin: "0 0 2px" }}>
              {intern.name}
            </h3>
            <span
              style={{
                display: "inline-block",
                background: "rgba(124,58,237,0.1)",
                color: "#7c3aed",
                padding: "2px 10px",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: 700,
                border: "1px solid rgba(124,58,237,0.3)",
                marginBottom: "14px"
              }}
            >
              {intern.department || "Intern"}
            </span>

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
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>INTERN ID</span>
                <strong style={{ color: "#0f172a", fontFamily: "'JetBrains Mono', monospace" }}>{intern.internId}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>COLLEGE</span>
                <strong style={{ color: "#0f172a" }}>{intern.college || "—"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>START DATE</span>
                <strong style={{ color: "#0f172a" }}>{intern.startDate}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>VALID TILL</span>
                <strong style={{ color: "#0f172a" }}>{intern.endDate}</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "0 10px" }}>
              <div style={{ textAlign: "center" }}>
                <QRCodeCanvas value={qrData} size={70} />
                <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>Scan to Verify</div>
              </div>

              <div style={{ textAlign: "center" }}>
                <img src="/signature.png" alt="Signature" style={{ width: "90px", height: "32px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
                <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "2px", fontSize: "0.65rem", fontWeight: 700, color: "#4f46e5" }}>
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#1e1b4b",
              color: "#f8fafc",
              padding: "6px 12px",
              textAlign: "center",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.02em"
            }}
          >
            Sudisha Foundation &bull; empower@sudishafoundation.org
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternIdCard;
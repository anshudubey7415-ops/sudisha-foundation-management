import { useEffect, useRef, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "react-qr-code";
import { ArrowLeft, Award, Printer, Download, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";
import API from "../api";

function InternCertificate() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const userRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  const backLink = userRole === "intern" ? "/intern-portal" : "/interns";

  const [intern, setIntern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchIntern = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/interns/${id}`);
        setIntern(res.data);
      } catch (error) {
        console.error("Error fetching intern:", error);
        showError("Failed to fetch intern certificate details");
      } finally {
        setLoading(false);
      }
    };

    fetchIntern();
  }, [id, showError]);

  const printCertificate = () => {
    window.print();
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      // A4 Landscape: 297 x 210 mm
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      pdf.save(`Certificate_${intern?.name || 'Intern'}.pdf`);
      showSuccess("Certificate PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      showError("Failed to generate certificate PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
        <h3>Generating Official Internship Certificate...</h3>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Intern Record Not Found</h2>
        <Link to={backLink} className="btn btn-primary" style={{ marginTop: "16px" }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (userRole === "intern" && !intern.allowCertificate) {
    return (
      <div className="card" style={{ maxWidth: "500px", margin: "60px auto", padding: "36px 30px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "16px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "50%", marginBottom: "16px" }}>
          <Award size={40} />
        </div>
        <h2>Certificate Not Yet Approved</h2>
        <p style={{ marginTop: "8px", marginBottom: "24px", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Your Certificate of Internship has not been released or approved by the administrator yet.
        </p>
        <Link to="/intern-portal" className="btn btn-primary">
          Return to Intern Portal
        </Link>
      </div>
    );
  }

  const certificateNumber = intern.certificateNumber || `SF-CERT-${new Date().getFullYear()}-${intern.internId?.replace(/[^0-9]/g, '').slice(-3) || '001'}`;
  const verificationURL = `${window.location.origin}/verify/${certificateNumber}`;

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
                <Award size={24} style={{ color: "var(--primary)" }} /> Internship Certificate
              </h1>
              <p>{intern.name} &bull; Certificate No: {certificateNumber}</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <button onClick={printCertificate} className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Printer size={16} /> Print Certificate
          </button>
          <button onClick={downloadPDF} disabled={downloading} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {downloading ? (
              <>
                <Loader2 size={16} className="spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download Certificate (PDF)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Certificate Container */}
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
        <div
          ref={certificateRef}
          className="printable-area"
          style={{
            width: "1050px",
            height: "740px",
            background: "#ffffff",
            padding: "36px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.18)",
            border: "12px solid #1e3a8a",
            position: "relative",
            fontFamily: "'Plus Jakarta Sans', 'Times New Roman', serif",
            color: "#0f172a",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Inner Golden Border */}
          <div
            style={{
              border: "3px solid #d97706",
              height: "100%",
              padding: "24px 36px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "center",
              position: "relative",
              background: "radial-gradient(circle at center, #ffffff 0%, #fdfbf7 100%)"
            }}
          >
            {/* Header / Logo */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "6px" }}>
                <img src="/logo.png" alt="Logo" style={{ width: "55px", height: "55px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
                <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1e3a8a", margin: 0, letterSpacing: "0.05em", fontFamily: "'Outfit', sans-serif" }}>
                  SUDISHA FOUNDATION
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Registered Non-Governmental Organization &bull; Empowering Communities
              </p>
            </div>

            {/* Certificate Title */}
            <div>
              <div
                style={{
                  display: "inline-block",
                  borderBottom: "2px solid #d97706",
                  paddingBottom: "4px",
                  margin: "6px 0 10px"
                }}
              >
                <h2
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: "#b45309",
                    margin: 0,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  Certificate of Internship
                </h2>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "1rem", color: "#475569", fontStyle: "italic" }}>
                This is proudly presented to
              </p>
            </div>

            {/* Recipient Name */}
            <div>
              <h1
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 800,
                  color: "#1e3a8a",
                  margin: "6px 0",
                  fontFamily: "'Outfit', serif",
                  letterSpacing: "-0.01em",
                  borderBottom: "1px dashed #cbd5e1",
                  display: "inline-block",
                  paddingBottom: "4px"
                }}
              >
                {intern.name}
              </h1>
            </div>

            {/* Certificate Text */}
            <div style={{ maxWidth: "820px", margin: "0 auto", fontSize: "1.05rem", lineHeight: 1.6, color: "#334155" }}>
              <p style={{ margin: 0 }}>
                bearing Intern ID <strong style={{ color: "#1e3a8a" }}>{intern.internId}</strong> from{" "}
                <strong style={{ color: "#1e3a8a" }}>{intern.college || "University"}</strong> has successfully completed the
                professional internship in the <strong style={{ color: "#1e3a8a" }}>{intern.department}</strong> Department at Sudisha Foundation from{" "}
                <strong>{intern.startDate}</strong> to <strong>{intern.endDate}</strong>.
              </p>
              <p style={{ marginTop: "8px", fontSize: "0.95rem", color: "#64748b" }}>
                During the internship tenure, the candidate demonstrated exemplary diligence, teamwork, and commitment toward the Foundation's vision.
              </p>
            </div>

            {/* Footer Signatures, QR & Serial */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "10px", padding: "0 20px" }}>
              {/* QR Verification */}
              <div style={{ textAlign: "center" }}>
                <QRCode value={verificationURL} size={70} />
                <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginTop: "4px" }}>
                  Scan to Verify
                </div>
              </div>

              {/* Certificate No Badge */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Certificate Serial No:</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", fontWeight: 800, color: "#b45309" }}>
                  {certificateNumber}
                </div>
              </div>

              {/* Signature */}
              <div style={{ textAlign: "center" }}>
                <img src="/signature.png" alt="Signature" style={{ width: "130px", height: "45px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
                <div style={{ borderTop: "2px solid #1e3a8a", width: "180px", paddingTop: "4px", fontSize: "0.8rem", fontWeight: 800, color: "#1e3a8a" }}>
                  Authorized Signatory
                </div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Sudisha Foundation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternCertificate;
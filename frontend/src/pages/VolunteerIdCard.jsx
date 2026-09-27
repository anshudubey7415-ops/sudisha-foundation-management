import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ArrowLeft, CreditCard, Printer, Download, Loader2, Award } from "lucide-react";
import { useToast } from "../context/ToastContext";
import API, { getUploadUrl } from "../api";

function VolunteerIdCard() {
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/volunteers/${id}`);
        setVolunteer(res.data);
      } catch (error) {
        console.error("Error fetching volunteer:", error);
        showError("Error loading volunteer ID card data");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
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
      pdf.save(`Volunteer_ID_${volunteer?.volunteerId || volunteer?.name}.pdf`);
      showSuccess("Volunteer ID Card downloaded!");
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
        <h3>Loading Volunteer ID Card...</h3>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Volunteer Not Found</h2>
        <Link to="/volunteers" className="btn btn-primary" style={{ marginTop: "16px" }}>
          Return to Volunteer Directory
        </Link>
      </div>
    );
  }

  const qrData = JSON.stringify({
    org: "Sudisha Foundation",
    type: "Volunteer",
    id: volunteer.volunteerId,
    name: volunteer.name,
    phone: volunteer.phone,
    badge: volunteer.badge || "Beginner",
  });

  return (
    <div>
      <div className="page-header no-print">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/volunteers" className="btn btn-secondary btn-icon" title="Back to Volunteers">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={24} style={{ color: "var(--primary)" }} /> Volunteer Identity Card
              </h1>
              <p>{volunteer.name} &bull; ID: {volunteer.volunteerId}</p>
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
            border: "2px solid #f59e0b",
            overflow: "hidden",
            position: "relative",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#0f172a"
          }}
        >
          {/* Card Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
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
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#fef3c7", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Official Volunteer Badge
            </p>
          </div>

          {/* Photo & Details */}
          <div style={{ padding: "20px 24px 16px", textAlign: "center" }}>
            <div style={{ position: "relative", width: "110px", height: "110px", margin: "0 auto 12px" }}>
              {volunteer.photo ? (
                <img
                  src={getUploadUrl(volunteer.photo)}
                  alt={volunteer.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #f59e0b",
                    boxShadow: "0 4px 10px rgba(245,158,11,0.2)"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "rgba(245,158,11,0.1)",
                    color: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    border: "4px solid #f59e0b"
                  }}
                >
                  {volunteer.name?.charAt(0) || "V"}
                </div>
              )}
            </div>

            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#b45309", margin: "0 0 2px" }}>
              {volunteer.name}
            </h3>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "rgba(245,158,11,0.1)",
                color: "#b45309",
                padding: "2px 10px",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: 700,
                border: "1px solid rgba(245,158,11,0.3)",
                marginBottom: "14px"
              }}
            >
              <Award size={14} /> {volunteer.badge || "Volunteer"}
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
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>VOLUNTEER ID</span>
                <strong style={{ color: "#0f172a", fontFamily: "'JetBrains Mono', monospace" }}>{volunteer.volunteerId}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>JOINING DATE</span>
                <strong style={{ color: "#0f172a" }}>{volunteer.joiningDate ? volunteer.joiningDate.split("T")[0] : "—"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>CONTACT NO</span>
                <strong style={{ color: "#0f172a" }}>{volunteer.phone || "—"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, display: "block" }}>HOURS LOGGED</span>
                <strong style={{ color: "#b45309" }}>{volunteer.totalHours || 0} hrs</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "0 10px" }}>
              <div style={{ textAlign: "center" }}>
                <QRCodeCanvas value={qrData} size={70} />
                <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>Scan to Verify</div>
              </div>

              <div style={{ textAlign: "center" }}>
                <img src="/signature.png" alt="Signature" style={{ width: "90px", height: "32px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
                <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "2px", fontSize: "0.65rem", fontWeight: 700, color: "#b45309" }}>
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#78350f",
              color: "#fef3c7",
              padding: "6px 12px",
              textAlign: "center",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.02em"
            }}
          >
            Sudisha Foundation &bull; Volunteer Community Network
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerIdCard;
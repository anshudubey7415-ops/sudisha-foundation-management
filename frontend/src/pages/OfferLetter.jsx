import { useEffect, useRef, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ArrowLeft, FileText, Printer, Download, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";
import API from "../api";

function OfferLetter() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const userRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  const backLink = userRole === "intern" ? "/intern-portal" : "/interns";

  const [intern, setIntern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const letterRef = useRef();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchIntern = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/interns/${id}`);
        setIntern(res.data);
      } catch (err) {
        console.error("Error fetching intern:", err);
        showError("Failed to fetch intern details");
      } finally {
        setLoading(false);
      }
    };

    fetchIntern();
  }, [id, showError]);

  const printLetter = () => {
    window.print();
  };

  const downloadPDF = async () => {
    if (!letterRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(letterRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      // A4 dimensions: 210 x 297 mm
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`Offer_Letter_${intern?.name || 'Intern'}.pdf`);
      showSuccess("Offer Letter downloaded successfully!");
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
        <h3>Generating Official Offer Letter...</h3>
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

  if (userRole === "intern" && !intern.allowOfferLetter) {
    return (
      <div className="card" style={{ maxWidth: "500px", margin: "60px auto", padding: "36px 30px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "16px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "50%", marginBottom: "16px" }}>
          <Loader2 size={40} style={{ display: "none" }} />
          <FileText size={40} />
        </div>
        <h2>Offer Letter Not Yet Approved</h2>
        <p style={{ marginTop: "8px", marginBottom: "24px", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Your official Offer Letter is currently locked and requires administrator approval before it can be viewed or downloaded.
        </p>
        <Link to="/intern-portal" className="btn btn-primary">
          Return to Intern Portal
        </Link>
      </div>
    );
  }

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
                <FileText size={24} style={{ color: "var(--primary)" }} /> Internship Offer Letter
              </h1>
              <p>{intern.name} &bull; {intern.department}</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <button onClick={printLetter} className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Printer size={16} /> Print Letter
          </button>
          <button onClick={downloadPDF} disabled={downloading} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {downloading ? (
              <>
                <Loader2 size={16} className="spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download Official PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
        <div
          ref={letterRef}
          className="printable-area"
          style={{
            width: "800px",
            minHeight: "1050px",
            background: "#ffffff",
            padding: "50px 60px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            border: "1px solid #e2e8f0",
            fontFamily: "'Plus Jakarta Sans', 'Georgia', serif",
            color: "#1e293b",
            lineHeight: 1.6,
            position: "relative"
          }}
        >
          {/* Official Letterhead Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #1e3a8a", paddingBottom: "20px", marginBottom: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img src="/logo.png" alt="Sudisha Foundation Logo" style={{ width: "70px", height: "70px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
              <div>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1e3a8a", margin: 0, letterSpacing: "-0.01em" }}>
                  SUDISHA FOUNDATION
                </h1>
                <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
                  Empowering Communities, Transforming Lives &bull; Reg. NGO
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#64748b" }}>
              <div>contact@sudishafoundation.org</div>
              <div>www.sudishafoundation.org</div>
            </div>
          </div>

          {/* Reference & Date */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "28px", fontSize: "0.9rem", fontWeight: 600 }}>
            <div>
              <span style={{ color: "#64748b" }}>Ref No: </span>
              <span style={{ color: "#1e3a8a", fontFamily: "'JetBrains Mono', monospace" }}>SF/OL/{intern.internId}</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Date: </span>
              <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Recipient */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>To,</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e3a8a" }}>{intern.name}</div>
            {intern.college && <div style={{ fontSize: "0.9rem", color: "#475569" }}>{intern.college}</div>}
            {intern.email && <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{intern.email}</div>}
          </div>

          {/* Subject */}
          <div style={{ background: "#f8fafc", padding: "10px 16px", borderRadius: "6px", borderLeft: "4px solid #2563eb", marginBottom: "24px" }}>
            <strong style={{ color: "#1e3a8a", fontSize: "1rem" }}>
              Subject: Offer of Internship in {intern.department}
            </strong>
          </div>

          {/* Letter Body */}
          <div style={{ fontSize: "0.95rem", textAlign: "justify", marginBottom: "30px" }}>
            <p style={{ marginBottom: "16px" }}>
              Dear <strong>{intern.name}</strong>,
            </p>

            <p style={{ marginBottom: "16px" }}>
              On behalf of <strong>Sudisha Foundation</strong>, we are pleased to offer you the position of <strong>Intern</strong> in our <strong>{intern.department}</strong> department. We were impressed with your credentials, motivation, and dedication toward social impact and educational advancement.
            </p>

            <p style={{ marginBottom: "16px" }}>
              Your internship program is scheduled for the duration from <strong>{intern.startDate}</strong> to <strong>{intern.endDate}</strong>. During this tenure, you will work under the guidance of our leadership team and assigned mentors to contribute to our mission and projects.
            </p>

            <p style={{ marginBottom: "16px" }}>
              <strong>Key Terms & Highlights:</strong>
            </p>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "6px" }}><strong>Intern ID:</strong> {intern.internId}</li>
              <li style={{ marginBottom: "6px" }}><strong>Designated Department:</strong> {intern.department}</li>
              <li style={{ marginBottom: "6px" }}><strong>Reporting Mentor:</strong> {intern.mentor || "Sudisha Foundation Core Team"}</li>
              <li style={{ marginBottom: "6px" }}>Upon successful completion of all assigned milestones and attendance, you will be awarded an official <strong>Certificate of Internship</strong> and recommendation.</li>
            </ul>

            <p style={{ marginBottom: "24px" }}>
              We welcome you to the Sudisha Foundation family and look forward to a mutually fulfilling and impactful association.
            </p>

            <p style={{ marginBottom: "0" }}>
              Warm regards and best wishes,
            </p>
          </div>

          {/* Signatory Footer */}
          <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <img src="/signature.png" alt="Authorized Signature" style={{ width: "160px", height: "55px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
              <div style={{ borderTop: "2px solid #1e3a8a", width: "200px", paddingTop: "6px" }}>
                <div style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "0.95rem" }}>Authorized Signatory</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Sudisha Foundation</div>
              </div>
            </div>

            <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#94a3b8" }}>
              <div>Official Document SF/OL/{intern.internId}</div>
              <div>Digitally signed and generated via Sudisha Portal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferLetter;
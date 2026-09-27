import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import API from "../api";

function CertificateVerification() {
  const { certificateNumber } = useParams();
  const navigate = useNavigate();

  const [searchCode, setSearchCode] = useState(certificateNumber || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (certificateNumber) {
      setSearchCode(certificateNumber);
      verifyCertificate(certificateNumber);
    }
  }, [certificateNumber]);

  const verifyCertificate = async (code) => {
    if (!code) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await API.get(`/verify/certificate/${code.trim()}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
      setData({ verified: false });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCode.trim()) {
      navigate(`/verify/${searchCode.trim()}`);
      verifyCertificate(searchCode.trim());
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 100%)",
        color: "#f8fafc",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: "680px", width: "100%" }}>
        {/* Foundation Branding Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link to="/login" style={{ textDecoration: "none", color: "inherit", display: "inline-block" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                fontWeight: 800,
                boxShadow: "0 0 24px rgba(99, 102, 241, 0.4)",
              }}
            >
              <img
                src="/logo.png"
                alt="Sudisha Foundation logo"
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit" }}
              />
            </div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Sudisha Foundation
            </h1>
          </Link>
          <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.95rem" }}>
            Official Certificate & Credential Verification Registry
          </p>
        </div>

        {/* Verification Search Bar */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "28px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Enter Certificate Serial (e.g. SF-INT-2026-XXXX)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(15, 23, 42, 0.8)",
                color: "#ffffff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !searchCode.trim()}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              {loading ? "Verifying..." : "Verify Credential"}
            </button>
          </form>
        </div>

        {/* Result Area */}
        {loading ? (
          <div
            style={{
              background: "rgba(30, 41, 59, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Loader2 size={36} className="spin" style={{ color: "#6366f1" }} />
            <h3 style={{ margin: 0, fontWeight: 600, color: "#cbd5e1" }}>Verifying Record with Registry...</h3>
          </div>
        ) : hasSearched && data?.verified ? (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.85)",
              border: "2px solid #10b981",
              borderRadius: "16px",
              padding: "36px",
              boxShadow: "0 0 32px rgba(16, 185, 129, 0.2)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Status Header */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                  padding: "4px 14px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Authentic Certificate Verified
              </span>
              <h2 style={{ margin: "14px 0 0", fontSize: "1.6rem", fontWeight: 800, color: "#ffffff" }}>
                {data.name}
              </h2>
            </div>

            {/* Record Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                padding: "20px",
                borderRadius: "12px",
                background: "rgba(30, 41, 59, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                marginBottom: "24px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Certificate No.</div>
                <div style={{ fontWeight: 700, color: "#f8fafc", fontFamily: "monospace", fontSize: "0.95rem", marginTop: "2px" }}>
                  {data.certificateNumber || certificateNumber}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Intern ID</div>
                <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.95rem", marginTop: "2px" }}>
                  {data.internId || "—"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Domain / Dept</div>
                <div style={{ fontWeight: 600, color: "#a5b4fc", fontSize: "0.95rem", marginTop: "2px" }}>
                  {data.department || "General"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Institution</div>
                <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.95rem", marginTop: "2px" }}>
                  {data.college || "N/A"}
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Internship Duration</div>
                <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.95rem", marginTop: "2px" }}>
                  {data.startDate} to {data.endDate}
                </div>
              </div>
            </div>

            {/* Official seal footer */}
            <div style={{ textAlign: "center", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "18px", fontSize: "0.82rem", color: "#94a3b8" }}>
              Verified by <strong>Sudisha Foundation Digital Credential Authority</strong>.
              <br />
              This record matches the immutable foundation database archive.
            </div>
          </div>
        ) : hasSearched ? (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.85)",
              border: "2px solid #ef4444",
              borderRadius: "16px",
              padding: "36px",
              textAlign: "center",
              boxShadow: "0 0 32px rgba(239, 68, 68, 0.2)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <XCircle size={32} />
            </div>
            <h3 style={{ margin: "0 0 8px 0", color: "#ef4444", fontSize: "1.3rem" }}>Certificate Not Found</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.92rem", margin: "0 0 20px 0" }}>
              No active certificate was found matching the code <strong>"{searchCode}"</strong>.
              Please check the certificate serial number and re-enter.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              border: "1px dashed rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              padding: "40px 24px",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            Enter a certificate serial number above or scan the QR code to verify validity.
          </div>
        )}

        {/* Back Link */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link to="/login" style={{ color: "#a5b4fc", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={14} /> Return to Staff & Member Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CertificateVerification;
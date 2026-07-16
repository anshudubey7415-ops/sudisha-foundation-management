import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "react-qr-code";

function InternCertificate() {
  const { id } = useParams();
  const [intern, setIntern] = useState(null);
  const certificateRef = useRef();

  useEffect(() => {
    // Function ko useEffect ke andar move kar diya
    const fetchIntern = async () => {
      try {
        const res = await API.get(`/interns/${id}`);
        setIntern(res.data);
      } catch (error) {
        console.error("Error fetching intern:", error);
      }
    };

    fetchIntern();
  }, [id]); // id dependency add kar di

  const downloadPDF = async () => {
    const canvas = await html2canvas(certificateRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
    pdf.save(`Certificate_${intern.name}.pdf`);
  };

  if (!intern) return <h2>Loading...</h2>;

  const verificationURL = `http://localhost:5173/verify/${intern.certificateNumber}`;

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={downloadPDF}
        style={{
          background: "#16a34a",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Download Certificate
      </button>

      <div
        ref={certificateRef}
        style={{
          background: "white",
          padding: "40px",
          border: "10px solid #2563eb",
          textAlign: "center",
          maxWidth: "1100px",
          margin: "auto",
        }}
      >
        <img src="/logo.png" alt="Logo" style={{ width: "100px" }} />
        <h1 style={{ color: "#1e3a8a" }}>SUDISHA FOUNDATION</h1>
        <h2>CERTIFICATE OF INTERNSHIP</h2>
        <br />
        <p>This is to certify that</p>
        <h1 style={{ color: "#16a34a" }}>{intern.name}</h1>
        <p>
          bearing Intern ID {intern.internId} has successfully completed the
          internship in {intern.department} Department.
        </p>
        <p>
          Internship Duration: {intern.startDate} to {intern.endDate}
        </p>
        <h3>Certificate No: {intern.certificateNumber}</h3>
        <br />
        <QRCode value={verificationURL} size={120} />
        <p>Scan QR to Verify Certificate</p>
        <br />
        <img src="/signature.png" alt="Signature" style={{ width: "180px" }} />
        <h4>Authorized Signatory</h4>
        <p>Sudisha Foundation</p>
      </div>
    </div>
  );
}

export default InternCertificate;
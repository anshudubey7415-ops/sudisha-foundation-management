import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function OfferLetter() {
  const { id } = useParams();
  const [intern, setIntern] = useState(null);
  const letterRef = useRef();

  useEffect(() => {
    // Function ko useEffect ke andar define kiya (Fixed ESLint errors)
    const fetchIntern = async () => {
      try {
        const res = await API.get(`/interns/${id}`);
        setIntern(res.data);
      } catch (err) {
        console.error("Error fetching intern:", err);
      }
    };

    fetchIntern();
  }, [id]); // 'id' dependency add ki

  const downloadPDF = async () => {
    if (!letterRef.current) return;
    const canvas = await html2canvas(letterRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save(`Offer_Letter_${intern.name}.pdf`);
  };

  if (!intern) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={downloadPDF}
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Download PDF
      </button>

      <div
        ref={letterRef}
        style={{
          background: "white",
          padding: "40px",
          maxWidth: "900px",
          margin: "auto",
          border: "1px solid #ddd",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img src="/logo.png" alt="Logo" style={{ width: "90px" }} />
          <h1 style={{ color: "#1e3a8a" }}>SUDISHA FOUNDATION</h1>
          <p>Empowering Communities, Transforming Lives</p>
          <hr />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Ref No: SF/OL/{intern.internId}</p>
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>

        <h2 style={{ textAlign: "center", marginTop: "30px" }}>
          INTERNSHIP OFFER LETTER
        </h2>

        <p>Dear {intern.name},</p>
        <p>
          We are pleased to offer you an Internship opportunity at Sudisha Foundation 
          in the Department of {intern.department}.
        </p>
        <p>
          Internship Duration: {intern.startDate} to {intern.endDate}
        </p>
        <p>
          We look forward to your contribution and wish you a successful internship journey.
        </p>

        <br />
        <br />

        <img src="/signature.png" alt="Signature" style={{ width: "180px" }} />
        <h4>Authorized Signatory</h4>
        <p>Sudisha Foundation</p>
      </div>
    </div>
  );
}

export default OfferLetter;
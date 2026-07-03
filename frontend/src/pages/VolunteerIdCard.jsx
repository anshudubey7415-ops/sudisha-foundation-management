import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import QRCode from "react-qr-code";

function VolunteerIdCard() {
  const { id } = useParams();

  const [volunteer, setVolunteer] =
    useState(null);

  const cardRef = useRef();

  useEffect(() => {
    fetchVolunteer();
  }, []);

  const fetchVolunteer = async () => {
    const res = await API.get(
      `/volunteers/${id}`
    );

    setVolunteer(res.data);
  };

  const downloadPDF =
    async () => {
      const canvas =
        await html2canvas(
          cardRef.current
        );

      const imgData =
        canvas.toDataURL(
          "image/png"
        );

      const pdf =
        new jsPDF(
          "portrait",
          "mm",
          "a4"
        );

      pdf.addImage(
        imgData,
        "PNG",
        10,
        10,
        90,
        55
      );

      pdf.save(
        `${volunteer.name}_Volunteer_ID.pdf`
      );
    };

  if (!volunteer)
    return <h2>Loading...</h2>;

  const qrValue =
    volunteer.verificationId ||
    volunteer.volunteerId;

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={downloadPDF}
        style={{
          background:
            "#16a34a",
          color: "white",
          border: "none",
          padding:
            "10px 20px",
          borderRadius:
            "6px",
          cursor:
            "pointer",
          marginBottom:
            "20px",
        }}
      >
        Download ID Card
      </button>

      <div
        ref={cardRef}
        style={{
          width: "450px",
          border:
            "3px solid #2563eb",
          borderRadius:
            "15px",
          padding: "20px",
          textAlign:
            "center",
          background:
            "white",
        }}
      >
        <img
          src="/logo.png"
          alt="logo"
          style={{
            width: "70px",
          }}
        />

        <h2>
          SUDISHA FOUNDATION
        </h2>

        <h3>
          VOLUNTEER ID CARD
        </h3>

        <hr />

        <h2>
          {volunteer.name}
        </h2>

        <p>
          Volunteer ID:
          {" "}
          {
            volunteer.volunteerId
          }
        </p>

        <p>
          Phone:
          {" "}
          {
            volunteer.phone
          }
        </p>

        <p>
          Status:
          {" "}
          {
            volunteer.status
          }
        </p>

        <QRCode
          value={qrValue}
          size={100}
        />

        <p>
          Scan To Verify
        </p>
      </div>
    </div>
  );
}

export default VolunteerIdCard;
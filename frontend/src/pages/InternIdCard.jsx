import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import QRCode from "react-qr-code";

function InternIdCard() {
  const { id } = useParams();

  const [intern, setIntern] =
    useState(null);

  useEffect(() => {
    fetchIntern();
  }, []);

  const fetchIntern = async () => {
    try {
      const res = await API.get(
        `/interns/${id}`
      );

      setIntern(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const printCard = () => {
    window.print();
  };

  if (!intern) {
    return <h2>Loading...</h2>;
  }

  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <h1>Intern ID Card</h1>

      <div
        id="id-card"
        style={{
          width: "400px",
          border: "2px solid #2563eb",
          borderRadius: "15px",
          padding: "20px",
          backgroundColor:
            "#f8fafc",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#2563eb",
          }}
        >
          Sudisha Foundation
        </h2>

        {intern.photo ? (
          <img
            src={`http://localhost:5000/uploads/${intern.photo}`}
            alt="Intern"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              border:
                "3px solid #2563eb",
            }}
          />
        ) : (
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background:
                "#d1d5db",
              margin: "auto",
            }}
          />
        )}

        <h2>{intern.name}</h2>

        <p>
          <strong>
            Intern ID:
          </strong>{" "}
          {intern.internId}
        </p>

        <p>
          <strong>
            Department:
          </strong>{" "}
          {intern.department}
        </p>

        <p>
          <strong>
            College:
          </strong>{" "}
          {intern.college}
        </p>

        <p>
          <strong>
            Mobile:
          </strong>{" "}
          {intern.phone}
        </p>

        <p>
          <strong>
            Start Date:
          </strong>{" "}
          {intern.startDate}
        </p>

        <p>
          <strong>
            End Date:
          </strong>{" "}
          {intern.endDate}
        </p>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent:
              "center",
          }}
        >
          <QRCode
            value={JSON.stringify({
              id: intern.internId,
              name:
                intern.name,
              department:
                intern.department,
            })}
            size={120}
          />
        </div>
      </div>

      <br />

      <button
        onClick={printCard}
        style={{
          backgroundColor:
            "#16a34a",
          color: "white",
          border: "none",
          padding:
            "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Print ID Card
      </button>
    </div>
  );
}

export default InternIdCard;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

function CertificateVerification() {
  const { certificateNumber } =
    useParams();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    verifyCertificate();
  }, []);

  const verifyCertificate =
    async () => {
      try {
        const res =
          await API.get(
            `/verify/certificate/${certificateNumber}`
          );

        setData(res.data);
      } catch (error) {
        setData({
          verified: false,
        });
      }

      setLoading(false);
    };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>
          Verifying Certificate...
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
      }}
    >
      {data?.verified ? (
        <div
          style={{
            maxWidth: "700px",
            margin: "auto",
            padding: "30px",
            border:
              "2px solid green",
            borderRadius: "10px",
          }}
        >
          <h1
            style={{
              color: "green",
            }}
          >
            Certificate Verified ✅
          </h1>

          <h2>{data.name}</h2>

          <p>
            <strong>
              Intern ID:
            </strong>{" "}
            {data.internId}
          </p>

          <p>
            <strong>
              Department:
            </strong>{" "}
            {data.department}
          </p>

          <p>
            <strong>
              College:
            </strong>{" "}
            {data.college}
          </p>

          <p>
            <strong>
              Certificate No:
            </strong>{" "}
            {
              data.certificateNumber
            }
          </p>

          <p>
            <strong>
              Duration:
            </strong>{" "}
            {data.startDate} to{" "}
            {data.endDate}
          </p>
        </div>
      ) : (
        <div>
          <h1
            style={{
              color: "red",
            }}
          >
            Invalid Certificate ❌
          </h1>

          <p>
            Certificate not found.
          </p>
        </div>
      )}
    </div>
  );
}

export default CertificateVerification;
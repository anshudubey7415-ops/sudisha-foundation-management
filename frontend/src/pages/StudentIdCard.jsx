import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import API from "../api";

function StudentIdCard() {
const { id } = useParams();

const [student, setStudent] = useState(null);

useEffect(() => {
fetchStudent();
}, []);

const fetchStudent = async () => {
try {
const res = await API.get(`/students/${id}`);
setStudent(res.data);
} catch (error) {
console.error(error);
}
};

const printCard = () => {
window.print();
};

if (!student) {
return <h2>Loading...</h2>;
}

return (
<div style={{ padding: "20px" }}> <h1>Student ID Card</h1>


  <div
    id="id-card"
    style={{
      width: "380px",
      border: "2px solid #2563eb",
      borderRadius: "15px",
      padding: "20px",
      background: "white",
    }}
  >
    <h2
      style={{
        textAlign: "center",
        color: "#2563eb",
      }}
    >
      Sudisha Foundation
    </h2>

    <hr />

    <div
      style={{
        textAlign: "center",
      }}
    >
      {student.photo ? (
        <img
          src={`http://localhost:5000/uploads/${student.photo}`}
          alt="student"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div>
          No Photo
        </div>
      )}
    </div>

    <h3>{student.name}</h3>

    <p>
      <strong>Roll No:</strong>{" "}
      {student.rollNumber}
    </p>

    <p>
      <strong>Class:</strong>{" "}
      {student.class}
    </p>

    <p>
      <strong>Father:</strong>{" "}
      {student.fatherName}
    </p>

    <p>
      <strong>Mobile:</strong>{" "}
      {student.phone}
    </p>

    <div
      style={{
        textAlign: "center",
        marginTop: "20px",
      }}
    >
      <QRCodeCanvas
        value={`Roll No: ${student.rollNumber}


Name: ${student.name}
Class: ${student.class}`}
size={120}
/> </div> </div>


  <br />

  <button
    onClick={printCard}
    style={{
      background: "#16a34a",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "5px",
      cursor: "pointer",
    }}
  >
    Print ID Card
  </button>
</div>


);
}

export default StudentIdCard;

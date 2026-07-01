import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

function StudentProfile() {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetchStudent();
    fetchAttendance();
  }, []);

  const fetchStudent = async () => {
    try {
      const res = await API.get(`/students/${id}`);
      setStudent(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance");

      const studentRecords = res.data.filter(
        (record) => record.student?._id === id
      );

      studentRecords.sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      );

      setAttendance(studentRecords);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) {
      alert("Please select a photo");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("photo", photo);

      await API.post(
        `/students/upload/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert("Photo Uploaded Successfully");

      fetchStudent();
    } catch (error) {
      console.error(error);
      alert("Photo Upload Failed");
    }
  };

  if (!student) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Loading Student...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Student Profile</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "20px",
          background: "#f9fafb",
          maxWidth: "900px",
        }}
      >
        {/* Photo Section */}

        {student.photo ? (
          <img
            src={`http://localhost:5000/uploads/${student.photo}`}
            alt="Student"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #2563eb",
              marginBottom: "20px",
            }}
          />
        ) : (
          <div
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "#ddd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "18px",
              marginBottom: "20px",
            }}
          >
            No Photo
          </div>
        )}

        <br />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setPhoto(e.target.files[0])
          }
        />

        <br />
        <br />

        <button
          onClick={uploadPhoto}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Upload Photo
        </button>

        <hr />

        {/* Student Details */}

        <h2>
          {student.rollNumber} - {student.name}
        </h2>

        <p>
          <strong>Class:</strong>{" "}
          {student.class}
        </p>

        <p>
          <strong>Age:</strong>{" "}
          {student.age}
        </p>

        <p>
          <strong>Gender:</strong>{" "}
          {student.gender}
        </p>

        <p>
          <strong>Admission Date:</strong>{" "}
          {student.admissionDate}
        </p>

        <p>
          <strong>Father Name:</strong>{" "}
          {student.fatherName}
        </p>

        <p>
          <strong>Mother Name:</strong>{" "}
          {student.motherName}
        </p>

        <p>
          <strong>Mobile:</strong>{" "}
          {student.phone}
        </p>

        <p>
          <strong>Address:</strong>{" "}
          {student.address}
        </p>

        <hr />

        {/* Attendance Summary */}

        <h2>Attendance Summary</h2>

        <p>
          <strong>Present Days:</strong>{" "}
          {student.presentDays || 0}
        </p>

        <p>
          <strong>Total Attendance Days:</strong>{" "}
          {student.totalAttendanceDays || 0}
        </p>

        <p>
          <strong>Attendance Percentage:</strong>{" "}
          {student.attendancePercentage || 0}%
        </p>

        <hr />

        {/* Attendance History */}

        <h2>Attendance History</h2>

        {attendance.length === 0 ? (
          <p>No Attendance Records Found</p>
        ) : (
          <table
            border="1"
            cellPadding="10"
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td>{record.date}</td>

                  <td
                    style={{
                      color:
                        record.status ===
                        "Present"
                          ? "green"
                          : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StudentProfile;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Students() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Function ko useEffect ke andar move kar diya
    const fetchStudents = async () => {
      try {
        const res = await API.get("/students");
        setStudents(res.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []); // Empty dependency array

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/students/${id}`);
      alert("Student Deleted Successfully");
      
      // State se remove karke UI update kiya (better performance)
      setStudents(students.filter((student) => student._id !== id));
    } catch (error) {
      console.error(error);
      alert("Error deleting student");
    }
  };

  const filteredStudents = students.filter((student) =>
    `${student.rollNumber} ${student.name} ${student.class}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Students</h1>

      <input
        type="text"
        placeholder="Search by Roll Number, Name or Class..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "12px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {filteredStudents.length === 0 ? (
        <p>No Students Found</p>
      ) : (
        filteredStudents.map((student) => (
          <div
            key={student._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
              backgroundColor: "#f9fafb",
            }}
          >
            <h2>{student.rollNumber} - {student.name}</h2>
            <p><strong>Class:</strong> {student.class}</p>

            <div style={{ marginTop: "15px" }}>
              <button
                onClick={() => navigate(`/student/${student._id}`)}
                style={{ backgroundColor: "#16a34a", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}
              >
                View Profile
              </button>
              <button
                onClick={() => navigate(`/student-id/${student._id}`)}
                style={{ backgroundColor: "#7c3aed", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}
              >
                ID Card
              </button>
              <button
                onClick={() => navigate(`/edit-student/${student._id}`)}
                style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}
              >
                Edit Student
              </button>
              <button
                onClick={() => deleteStudent(student._id)}
                style={{ backgroundColor: "#dc2626", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" }}
              >
                Delete Student
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Students;
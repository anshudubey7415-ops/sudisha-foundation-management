import { useEffect, useState } from "react";
import API from "../api";

function InternAttendance() {
  const [interns, setInterns] = useState([]);

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      const res = await API.get("/interns");
      setInterns(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const markAttendance = async (
    internId,
    status
  ) => {
    try {
      const res = await API.post(
        "/intern-attendance/mark",
        {
          intern: internId,
          status,
        }
      );

      alert(
        res.data.message ||
          `Marked ${status}`
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Attendance Error"
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Intern Attendance</h1>

      {interns.map((intern) => {
        const today =
          new Date()
            .toISOString()
            .split("T")[0];

        const attendanceAllowed =
          today <= intern.endDate;

        return (
          <div
            key={intern._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
              background: "#f9fafb",
            }}
          >
            <h3>
              {intern.internId} -{" "}
              {intern.name}
            </h3>

            <p>
              <strong>
                Department:
              </strong>{" "}
              {intern.department}
            </p>

            <p>
              <strong>
                Internship End:
              </strong>{" "}
              {intern.endDate}
            </p>

            {attendanceAllowed ? (
              <>
                <button
                  onClick={() =>
                    markAttendance(
                      intern._id,
                      "Present"
                    )
                  }
                  style={{
                    background:
                      "green",
                    color: "white",
                    border: "none",
                    padding:
                      "10px 15px",
                    borderRadius:
                      "5px",
                    cursor: "pointer",
                  }}
                >
                  Present
                </button>

                <button
                  onClick={() =>
                    markAttendance(
                      intern._id,
                      "Absent"
                    )
                  }
                  style={{
                    background:
                      "red",
                    color: "white",
                    border: "none",
                    padding:
                      "10px 15px",
                    borderRadius:
                      "5px",
                    cursor: "pointer",
                    marginLeft:
                      "10px",
                  }}
                >
                  Absent
                </button>
              </>
            ) : (
              <p
                style={{
                  color: "red",
                  fontWeight:
                    "bold",
                }}
              >
                Internship Completed
                - Attendance Disabled
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default InternAttendance;
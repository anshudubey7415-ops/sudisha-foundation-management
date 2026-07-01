require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const verificationRoutes =
require("./routes/verificationRoutes");

/* Student Routes */
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

/* Intern Routes */
const internRoutes = require("./routes/internRoutes");
const internAttendanceRoutes = require(
  "./routes/internAttendanceRoutes"
);

connectDB();

const app = express();

/* Middleware */
app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* Upload Folder */
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

/* Student APIs */
app.use(
  "/api/students",
  studentRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

/* Intern APIs */
app.use(
  "/api/interns",
  internRoutes
);

app.use(
  "/api/intern-attendance",
  internAttendanceRoutes
);
app.use(
"/api/verify",
verificationRoutes
);

/* Home */
app.get("/", (req, res) => {
  res.send(
    "Sudisha Foundation API Running"
  );
});

/* 404 */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* Error Handler */
app.use(
  (err, req, res, next) => {
    console.error(err);

    res.status(500).json({
      message:
        "Internal Server Error",
    });
  }
);

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
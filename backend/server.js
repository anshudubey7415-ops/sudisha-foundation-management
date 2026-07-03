require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

/* Route Imports */
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const internRoutes = require("./routes/internRoutes");
const internAttendanceRoutes = require("./routes/internAttendanceRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const volunteerAttendanceRoutes = require("./routes/volunteerAttendanceRoutes");
const verificationRoutes = require("./routes/verificationRoutes");

// Database Se Connect Karein
connectDB();

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Uploads Folder Dynamic Serving */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* API Routes Mapping */
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use("/api/interns", internRoutes);
app.use("/api/intern-attendance", internAttendanceRoutes);

app.use("/api/volunteers", volunteerRoutes);
app.use("/api/volunteer-attendance", volunteerAttendanceRoutes);

app.use("/api/verify", verificationRoutes);

/* Root API Status */
app.get("/", (req, res) => {
  res.send("Sudisha Foundation API Running");
});

/* 404 Route Catch-all */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* Global Error Handler */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

/* Server Start */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
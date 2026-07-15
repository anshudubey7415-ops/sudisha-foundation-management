import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // __dirname fix karne ke liye
import connectDB from "./config/db.js"; // Make sure file extension is .js

/* Route Imports */
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import internRoutes from "./routes/internRoutes.js";
import internAttendanceRoutes from "./routes/internAttendanceRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import volunteerAttendanceRoutes from "./routes/volunteerAttendanceRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";

// __dirname setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  res.status(404).json({ message: "Route not found" });
});

/* Global Error Handler */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

/* Server Start */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
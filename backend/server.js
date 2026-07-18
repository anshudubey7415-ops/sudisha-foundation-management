import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

/* Route Imports */
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import internRoutes from "./routes/internRoutes.js";
import internAttendanceRoutes from "./routes/internAttendanceRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import volunteerAttendanceRoutes from "./routes/volunteerAttendanceRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js"; 
import requestRoutes from './routes/requestRoutes.js';
// 1. UserRoutes yahan import karo
import userRoutes from "./routes/userRoutes.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* API Routes Mapping */
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/intern-attendance", internAttendanceRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/volunteer-attendance", volunteerAttendanceRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes); 
app.use('/api/requests', requestRoutes);
// 2. UserRoutes yahan map karo
app.use("/api/users", userRoutes); 

/* Root API Status */
app.get("/", (req, res) => {
  res.send("Sudisha Foundation API Running");
});

/* 404 & Error Handler */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
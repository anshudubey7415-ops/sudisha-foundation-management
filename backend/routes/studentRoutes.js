import express from "express";
const router = express.Router();

import Student from "../models/student.js";
import Attendance from "../models/Attendance.js";

import multer from "multer";
import path from "path";

/* =========================
Multer Configuration
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
});

/* =========================
Upload Student Photo
========================= */

router.post("/upload/:id", upload.single("photo"), async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        photo: req.file.filename,
      },
      {
        new: true,
      }
    );

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
Add Student
========================= */

router.post("/add", async (req, res) => {
  try {
    const newStudent = await Student.create(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
Get All Students
========================= */

router.get("/", async (req, res) => {
  try {
    const [students, allAttendance] = await Promise.all([
      Student.find().lean(),
      Attendance.find().lean(),
    ]);

    // Build hashmap for instant O(1) lookup
    const attendanceMap = {};
    for (const record of allAttendance) {
      if (!record.student) continue;
      const studentId = record.student.toString();
      if (!attendanceMap[studentId]) {
        attendanceMap[studentId] = { total: 0, present: 0 };
      }
      attendanceMap[studentId].total += 1;
      if (record.status === "Present") {
        attendanceMap[studentId].present += 1;
      }
    }

    const studentsWithAttendance = students.map((student) => {
      const stats = attendanceMap[student._id.toString()] || { total: 0, present: 0 };
      const attendancePercentage =
        stats.total > 0
          ? ((stats.present / stats.total) * 100).toFixed(1)
          : 0;

      return {
        ...student,
        presentDays: stats.present,
        totalAttendanceDays: stats.total,
        attendancePercentage,
      };
    });

    res.json(studentsWithAttendance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
Get Single Student
========================= */

router.get("/:id", async (req, res) => {
  try {
    const foundStudent = await Student.findById(req.params.id);

    if (!foundStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const attendanceRecords = await Attendance.find({
      student: foundStudent._id,
    });

    const totalAttendanceDays = attendanceRecords.length;

    const presentDays = attendanceRecords.filter(
      (record) => record.status === "Present"
    ).length;

    const attendancePercentage =
      totalAttendanceDays > 0
        ? ((presentDays / totalAttendanceDays) * 100).toFixed(1)
        : 0;

    res.json({
      ...foundStudent.toObject(),
      presentDays,
      totalAttendanceDays,
      attendancePercentage,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

import Request from "../models/Request.js";
import { verifyToken } from "../middleware/authMiddleware.js";

/* =========================
Update Student
========================= */

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    if (req.user?.role === "manager") {
      const newRequest = new Request({
        managerId: req.user.id,
        targetUserId: student._id,
        targetName: student.name,
        targetCollection: "students",
        changeType: "edit_student_profile",
        changes: req.body,
        reason: req.body.reason || "Manager submitted student profile update",
      });
      await newRequest.save();
      return res.status(200).json({
        message: "Student profile update request submitted to Admin for approval!",
        pendingApproval: true,
        request: newRequest,
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
Delete Student
========================= */

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    if (req.user?.role === "manager") {
      const newRequest = new Request({
        managerId: req.user.id,
        targetUserId: student._id,
        targetName: student.name,
        targetCollection: "students",
        changeType: "delete_student",
        changes: { action: "delete", name: student.name, details: student },
        reason: req.body?.reason || "Manager requested student deletion",
      });
      await newRequest.save();
      return res.status(200).json({
        message: `Deletion request for student ${student.name} submitted to Admin for approval!`,
        pendingApproval: true,
        request: newRequest,
      });
    }

    await Student.findByIdAndDelete(req.params.id);
    await Attendance.deleteMany({
      student: req.params.id,
    });

    res.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
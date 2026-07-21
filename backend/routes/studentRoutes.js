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
    const students = await Student.find();

    const studentsWithAttendance = await Promise.all(
      students.map(async (student) => {
        const attendanceRecords = await Attendance.find({
          student: student._id,
        });

        const totalAttendanceDays = attendanceRecords.length;

        const presentDays = attendanceRecords.filter(
          (record) => record.status === "Present"
        ).length;

        const attendancePercentage =
          totalAttendanceDays > 0
            ? ((presentDays / totalAttendanceDays) * 100).toFixed(1)
            : 0;

        return {
          ...student.toObject(),
          presentDays,
          totalAttendanceDays,
          attendancePercentage,
        };
      })
    );

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

/* =========================
Update Student
========================= */

router.put("/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

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

router.delete("/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

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
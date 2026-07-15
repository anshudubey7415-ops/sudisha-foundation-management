import express from "express";
const router = express.Router();

import InternAttendance from "../models/InternAttendance.js";
import Intern from "../models/Intern.js";

/* =========================
MARK ATTENDANCE (UPDATED)
========================= */

router.post("/mark", async (req, res) => {
  try {
    // Frontend se 'date' ko extract kiya
    const { intern, status, date } = req.body;

    // Agar date nahi aayi toh aaj ki date fallback rakhi
    const attendanceDate = date || new Date().toISOString().split("T")[0];

    const internData = await Intern.findById(intern);

    if (!internData) {
      return res.status(404).json({
        message: "Intern not found",
      });
    }

    // Internship completion check: ab ye frontend se bheji gayi date se compare karega
    if (attendanceDate > internData.endDate) {
      return res.status(400).json({
        message: "Internship completed. Attendance disabled.",
      });
    }

    // Yahan 'attendanceDate' ka use kiya taaki sahi date par entry bane
    const attendance = await InternAttendance.findOneAndUpdate(
      {
        intern,
        date: attendanceDate,
      },
      {
        status,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
GET ALL ATTENDANCE
========================= */

router.get("/", async (req, res) => {
  try {
    const records = await InternAttendance.find()
      .populate("intern")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
GET ATTENDANCE BY INTERN
========================= */

router.get("/intern/:id", async (req, res) => {
  try {
    const records = await InternAttendance.find({
      intern: req.params.id,
    })
      .populate("intern")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
DELETE ATTENDANCE RECORD
========================= */

router.delete("/:id", async (req, res) => {
  try {
    const attendance = await InternAttendance.findByIdAndDelete(
      req.params.id
    );

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
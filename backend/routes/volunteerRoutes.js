import express from "express";
const router = express.Router();

import Volunteer from "../models/Volunteer.js";
import VolunteerAttendance from "../models/VolunteerAttendance.js";

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

/* ==========================================
    💥 FIXED ROUTE: Get Date-Wise Attendance History
    URL Pattern: /api/volunteers/attendance/date/:date
========================================== */
router.get("/attendance/date/:date", async (req, res) => {
  try {
    const { date } = req.params; // HTML input text format: YYYY-MM-DD

    // Mongoose query through date string structure find mapping
    const records = await VolunteerAttendance.find({ date: date })
      .populate("volunteer", "volunteerId name");

    // Formatting raw query structure to clean frontend ready flat layout
    const formattedRecords = records.map((record) => {
      return {
        _id: record._id,
        status: record.status || "Present",
        hours: record.hoursWorked || 0,
        volunteerId: record.volunteer?.volunteerId || "—",
        name: record.volunteer?.name || "Unknown Volunteer",
      };
    });

    res.json(formattedRecords);
  } catch (error) {
    res.status(500).json({
      message: "Backend routing data mismatch: " + error.message,
    });
  }
});

/* =========================
    Upload Volunteer Photo
========================= */

router.post("/upload/:id", upload.single("photo"), async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      {
        photo: req.file.filename,
      },
      {
        new: true,
      }
    );

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
    Add Volunteer
========================= */

router.post("/add", async (req, res) => {
  try {
    const volunteer = await Volunteer.create(req.body);

    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
    Get All Volunteers
========================= */

router.get("/", async (req, res) => {
  try {
    const [volunteers, allRecords] = await Promise.all([
      Volunteer.find().lean(),
      VolunteerAttendance.find().lean(),
    ]);

    // Build hashmap for instant O(1) lookup
    const attendanceMap = {};
    for (const record of allRecords) {
      if (!record.volunteer) continue;
      const volId = record.volunteer.toString();
      if (!attendanceMap[volId]) {
        attendanceMap[volId] = { total: 0, present: 0, totalHours: 0 };
      }
      attendanceMap[volId].total += 1;
      if (record.status === "Present") {
        attendanceMap[volId].present += 1;
      }
      attendanceMap[volId].totalHours += (record.hoursWorked || 0);
    }

    const data = volunteers.map((volunteer) => {
      const stats = attendanceMap[volunteer._id.toString()] || { total: 0, present: 0, totalHours: 0 };
      const attendancePercentage =
        stats.total > 0
          ? ((stats.present / stats.total) * 100).toFixed(1)
          : 0;

      return {
        ...volunteer,
        presentDays: stats.present,
        totalAttendanceDays: stats.total,
        attendancePercentage,
        totalHours: stats.totalHours,
      };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
    Get Single Volunteer
========================= */

router.get("/:id", async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found",
      });
    }

    const records = await VolunteerAttendance.find({
      volunteer: volunteer._id,
    });

    const totalAttendanceDays = records.length;

    const presentDays = records.filter(
      (record) => record.status === "Present"
    ).length;

    const attendancePercentage =
      totalAttendanceDays > 0
        ? ((presentDays / totalAttendanceDays) * 100).toFixed(1)
        : 0;

    const totalHours = records.reduce(
      (total, record) => total + (record.hoursWorked || 0),
      0
    );

    res.json({
      ...volunteer.toObject(),
      presentDays,
      totalAttendanceDays,
      attendancePercentage,
      totalHours,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
    Update Volunteer
========================= */

router.put("/:id", async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found",
      });
    }

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

import Request from "../models/Request.js";
import { verifyToken } from "../middleware/authMiddleware.js";

/* =========================
    Delete Volunteer
========================= */

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found",
      });
    }

    if (req.user?.role === "manager") {
      const newRequest = new Request({
        managerId: req.user.id,
        targetUserId: volunteer._id,
        targetName: volunteer.name,
        targetCollection: "volunteers",
        changeType: "delete_volunteer",
        changes: { action: "delete", name: volunteer.name, details: volunteer },
        reason: req.body?.reason || "Manager requested volunteer deletion",
      });
      await newRequest.save();
      return res.status(200).json({
        message: `Deletion request for volunteer ${volunteer.name} submitted to Admin for approval!`,
        pendingApproval: true,
        request: newRequest,
      });
    }

    await Volunteer.findByIdAndDelete(req.params.id);
    await VolunteerAttendance.deleteMany({
      volunteer: req.params.id,
    });

    res.json({
      message: "Volunteer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
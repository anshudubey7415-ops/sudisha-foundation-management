import express from "express";
const router = express.Router();

import InternAttendance from "../models/InternAttendance.js";
import Intern from "../models/Intern.js";
import User from "../models/User.js";
import Request from "../models/Request.js";
import { verifyToken, isAdminOrManager } from "../middleware/authMiddleware.js";

// Helper to check if a date string is past date
const isPastDate = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr < today;
};

/* =========================
   MARK ATTENDANCE
========================= */
router.post("/mark", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const { intern, status, date } = req.body;
    const attendanceDate = date || new Date().toISOString().split("T")[0];

    const internData = await Intern.findById(intern);
    if (!internData) {
      return res.status(404).json({ message: "Intern not found" });
    }

    if (attendanceDate > internData.endDate) {
      return res.status(400).json({ message: "Internship completed. Attendance disabled." });
    }

    // If manager modifies past attendance, require admin approval
    if (req.user?.role === "manager" && isPastDate(attendanceDate)) {
      const newRequest = new Request({
        managerId: req.user.id,
        targetUserId: internData._id,
        targetName: `${internData.name} Attendance (${attendanceDate})`,
        targetCollection: "intern_attendance",
        changeType: "edit_intern_attendance",
        changes: { intern, status, date: attendanceDate },
        reason: req.body.reason || `Manager requested intern attendance modification for ${attendanceDate}`,
      });
      await newRequest.save();
      return res.status(200).json({
        message: `Attendance modification request for ${internData.name} (${attendanceDate}) submitted to Admin!`,
        pendingApproval: true,
        request: newRequest,
      });
    }

    const attendance = await InternAttendance.findOneAndUpdate(
      { intern, date: attendanceDate },
      { status },
      { new: true, upsert: true }
    );

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   BULK MARK ATTENDANCE
========================= */
router.post("/bulk", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const { records, date } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No attendance records provided" });
    }

    const firstDate = date || records[0]?.date;

    // If manager modifies past attendance records in bulk
    if (req.user?.role === "manager" && isPastDate(firstDate)) {
      const newRequest = new Request({
        managerId: req.user.id,
        targetCollection: "intern_attendance",
        changeType: "edit_intern_attendance",
        targetName: `Intern Attendance (${firstDate || "Bulk"})`,
        changes: { records, date: firstDate },
        reason: req.body.reason || `Manager requested bulk intern attendance update for ${firstDate}`,
      });
      await newRequest.save();
      return res.status(200).json({
        message: `Bulk attendance modification request for ${firstDate} submitted to Admin!`,
        pendingApproval: true,
        request: newRequest,
      });
    }

    const operations = records.map((record) => ({
      updateOne: {
        filter: { intern: record.intern, date: record.date },
        update: { status: record.status },
        upsert: true,
      },
    }));

    await InternAttendance.bulkWrite(operations);
    res.status(200).json({ message: "Bulk intern attendance updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET ALL ATTENDANCE
========================= */
router.get("/", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const records = await InternAttendance.find()
      .populate("intern")
      .sort({ date: -1 })
      .lean();

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET ATTENDANCE FOR LOGGED IN INTERN (Read Only)
========================= */
router.get("/my/attendance", verifyToken, async (req, res) => {
  try {
    let email = req.user?.email;
    if (!email && req.user?.id) {
      const userDoc = await User.findById(req.user.id);
      if (userDoc) email = userDoc.email;
    }

    if (!email) {
      return res.status(400).json({ message: "No email associated with logged in user." });
    }

    const cleanEmail = email.trim();
    const intern = await Intern.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
    });

    if (!intern) {
      return res.status(404).json({ message: "Intern profile not found for this email." });
    }

    const records = await InternAttendance.find({ intern: intern._id })
      .populate("intern")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET ATTENDANCE BY INTERN
========================= */
router.get("/intern/:id", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const records = await InternAttendance.find({ intern: req.params.id })
      .populate("intern")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   DELETE ATTENDANCE RECORD
========================= */
router.delete("/:id", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const attendance = await InternAttendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json({ message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
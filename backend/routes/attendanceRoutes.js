import express from "express";
import Attendance from "../models/Attendance.js";
import Request from "../models/Request.js";
import { verifyToken, isAdminOrManager } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to check if a date string is past date
const isPastDate = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr < today;
};

// 1. Mark Attendance (Date-aware)
router.post("/mark", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const { student, status, date } = req.body;
    const targetDate = date || new Date().toISOString().split("T")[0];

    // If manager is trying to edit past attendance, require admin approval
    if (req.user?.role === "manager" && isPastDate(targetDate)) {
      const newRequest = new Request({
        managerId: req.user.id,
        targetCollection: "student_attendance",
        changeType: "edit_student_attendance",
        targetName: `Student Attendance (${targetDate})`,
        changes: { student, status, date: targetDate },
        reason: req.body.reason || `Manager requested attendance update for past date ${targetDate}`,
      });
      await newRequest.save();
      return res.status(200).json({
        message: `Attendance edit request for ${targetDate} submitted to Admin for approval!`,
        pendingApproval: true,
        request: newRequest,
      });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { student, date: targetDate },
      { status },
      { new: true, upsert: true }
    );
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Bulk Update/Save (DateWise edit ke liye)
router.post("/bulk", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const { records, date } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No records provided" });
    }

    const firstDate = date || records[0]?.date;

    // If manager is editing past date records, require admin approval
    if (req.user?.role === "manager" && isPastDate(firstDate)) {
      const newRequest = new Request({
        managerId: req.user.id,
        targetCollection: "student_attendance",
        changeType: "edit_student_attendance",
        targetName: `Student Attendance (${firstDate || "Bulk"})`,
        changes: { records, date: firstDate },
        reason: req.body.reason || `Manager modified past attendance logs for ${firstDate || "selected date"}`,
      });
      await newRequest.save();
      return res.status(200).json({
        message: `Attendance modification request for ${firstDate} submitted to Admin for approval!`,
        pendingApproval: true,
        request: newRequest,
      });
    }

    const operations = records.map((record) => ({
      updateOne: {
        filter: { student: record.student, date: record.date },
        update: { status: record.status },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);
    res.status(200).json({ message: "Bulk update successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Get All Records
router.get("/", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const records = await Attendance.find().populate("student").lean();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
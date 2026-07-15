import express from "express";
import Attendance from "../models/Attendance.js"; // Tumhara Attendance model path

const router = express.Router();

// 1. Mark Attendance (Date-aware)
router.post("/mark", async (req, res) => {
  try {
    const { student, status, date } = req.body;
    // Agar date backend se nahi bheji gayi, toh aaj ki date use hogi
    const targetDate = date || new Date().toISOString().split("T")[0];

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
router.post("/bulk", async (req, res) => {
  try {
    const { records } = req.body;
    
    // Har ek record ko update ya insert karne ka logic
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
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find().populate("student");
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
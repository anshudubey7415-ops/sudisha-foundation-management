import express from "express";
const router = express.Router();

import Volunteer from "../models/Volunteer.js";
import VolunteerAttendance from "../models/VolunteerAttendance.js";

/* =========================
   Mark Single Attendance
========================= */

router.post("/mark", async (req, res) => {
  try {
    const { volunteer, date, status, checkIn, checkOut, remarks } = req.body;

    const existing = await VolunteerAttendance.findOne({ volunteer, date });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked for this date" });
    }

    let hoursWorked = 0;
    if (checkIn && checkOut) {
      const start = new Date(`1970-01-01T${checkIn}`);
      const end = new Date(`1970-01-01T${checkOut}`);
      hoursWorked = (end - start) / (1000 * 60 * 60);
      if (hoursWorked < 0) hoursWorked = 0;
    }

    const attendance = await VolunteerAttendance.create({
      volunteer, date, status, checkIn, checkOut, hoursWorked, remarks,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Bulk Manual Attendance
========================= */

router.post("/bulk", async (req, res) => {
  try {
    const { records } = req.body;

    if (!records || records.length === 0) {
      return res.status(400).json({ message: "No attendance records provided" });
    }

    const savedRecords = [];
    for (const record of records) {
      const { volunteer, date, status } = record;
      const existing = await VolunteerAttendance.findOne({ volunteer, date });

      if (existing) {
        const updated = await VolunteerAttendance.findByIdAndUpdate(
          existing._id,
          { status },
          { new: true }
        );
        savedRecords.push(updated);
      } else {
        const newRecord = await VolunteerAttendance.create({ volunteer, date, status });
        savedRecords.push(newRecord);
      }
    }

    res.status(201).json({ message: "Attendance saved successfully", savedRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Get All Attendance
========================= */

router.get("/", async (req, res) => {
  try {
    const records = await VolunteerAttendance.find()
      .populate("volunteer", "volunteerId name")
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Attendance By Volunteer
========================= */

router.get("/volunteer/:id", async (req, res) => {
  try {
    const records = await VolunteerAttendance.find({ volunteer: req.params.id })
      .populate("volunteer", "volunteerId name")
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Update Attendance
========================= */

router.put("/:id", async (req, res) => {
  try {
    const { checkIn, checkOut } = req.body;
    let hoursWorked = 0;

    if (checkIn && checkOut) {
      const start = new Date(`1970-01-01T${checkIn}`);
      const end = new Date(`1970-01-01T${checkOut}`);
      hoursWorked = (end - start) / (1000 * 60 * 60);
      if (hoursWorked < 0) hoursWorked = 0;
    }

    const attendance = await VolunteerAttendance.findByIdAndUpdate(
      req.params.id,
      { ...req.body, hoursWorked },
      { new: true }
    );

    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Delete Attendance
========================= */

router.delete("/:id", async (req, res) => {
  try {
    const attendance = await VolunteerAttendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json({ message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Volunteer Analytics
========================= */

router.get("/analytics/:id", async (req, res) => {
  try {
    const records = await VolunteerAttendance.find({ volunteer: req.params.id });
    const totalAttendanceDays = records.length;
    const presentDays = records.filter((r) => r.status === "Present").length;
    const attendancePercentage = totalAttendanceDays > 0 ? ((presentDays / totalAttendanceDays) * 100).toFixed(1) : 0;
    const totalHours = records.reduce((total, r) => total + (r.hoursWorked || 0), 0);

    res.json({ presentDays, totalAttendanceDays, attendancePercentage, totalHours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
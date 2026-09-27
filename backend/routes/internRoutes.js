import express from "express";
const router = express.Router();

import Intern from "../models/Intern.js";
import InternAttendance from "../models/InternAttendance.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

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

const upload = multer({ storage });

/* =========================
   Upload Photo
========================= */

router.post("/upload/:id", upload.single("photo"), async (req, res) => {
  try {
    const intern = await Intern.findByIdAndUpdate(
      req.params.id,
      { photo: req.file.filename },
      { new: true }
    );
    res.json(intern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Add Intern
========================= */

router.post("/add", async (req, res) => {
  try {
    const count = await Intern.countDocuments();
    const currentYear = new Date().getFullYear();
    const certificateNumber = `SF-CERT-${currentYear}-${String(count + 1).padStart(3, "0")}`;

    const intern = await Intern.create({
      ...req.body,
      certificateNumber,
    });
    res.status(201).json(intern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Get All Interns
========================= */

router.get("/", async (req, res) => {
  try {
    const [interns, allRecords] = await Promise.all([
      Intern.find().lean(),
      InternAttendance.find().lean(),
    ]);

    const attendanceMap = {};
    for (const record of allRecords) {
      const internId = record.intern?.toString();
      if (!internId) continue;
      if (!attendanceMap[internId]) {
        attendanceMap[internId] = { total: 0, present: 0 };
      }
      attendanceMap[internId].total += 1;
      if (record.status === "Present") {
        attendanceMap[internId].present += 1;
      }
    }

    const data = interns.map((intern) => {
      const stats = attendanceMap[intern._id.toString()] || { total: 0, present: 0 };
      const attendancePercentage = stats.total > 0
        ? ((stats.present / stats.total) * 100).toFixed(1)
        : 0;

      return {
        ...intern,
        presentDays: stats.present,
        totalAttendanceDays: stats.total,
        attendancePercentage,
      };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Get Logged-in Intern Profile (Read Only)
========================= */
router.get("/my/profile", verifyToken, async (req, res) => {
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
      return res.status(404).json({ 
        message: `No intern profile matches your registered email (${cleanEmail}). Please contact admin.` 
      });
    }

    const records = await InternAttendance.find({ intern: intern._id });
    const totalAttendanceDays = records.length;
    const presentDays = records.filter((record) => record.status === "Present").length;
    
    const attendancePercentage = totalAttendanceDays > 0
      ? ((presentDays / totalAttendanceDays) * 100).toFixed(1)
      : 0;

    res.json({
      ...intern.toObject(),
      presentDays,
      totalAttendanceDays,
      attendancePercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Get Single Intern
========================= */

router.get("/:id", async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ message: "Intern not found" });

    const records = await InternAttendance.find({ intern: intern._id });
    const totalAttendanceDays = records.length;
    const presentDays = records.filter((record) => record.status === "Present").length;
    
    const attendancePercentage = totalAttendanceDays > 0
      ? ((presentDays / totalAttendanceDays) * 100).toFixed(1)
      : 0;

    res.json({
      ...intern.toObject(),
      presentDays,
      totalAttendanceDays,
      attendancePercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Update Document Permissions
========================= */

router.patch("/:id/document-permissions", verifyToken, async (req, res) => {
  try {
    const { allowIdCard, allowOfferLetter, allowCertificate } = req.body;
    const updateData = {};
    if (typeof allowIdCard === "boolean") updateData.allowIdCard = allowIdCard;
    if (typeof allowOfferLetter === "boolean") updateData.allowOfferLetter = allowOfferLetter;
    if (typeof allowCertificate === "boolean") updateData.allowCertificate = allowCertificate;

    const intern = await Intern.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!intern) return res.status(404).json({ message: "Intern not found" });

    res.json({
      message: "Document access permissions updated successfully",
      intern,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   Update Intern
========================= */

router.put("/:id", async (req, res) => {
  try {
    const intern = await Intern.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!intern) return res.status(404).json({ message: "Intern not found" });
    res.json(intern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

import Request from "../models/Request.js";

/* =========================
   Delete Intern
========================= */

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ message: "Intern not found" });

    if (req.user?.role === "manager") {
      const newRequest = new Request({
        managerId: req.user.id,
        targetUserId: intern._id,
        targetName: intern.name,
        targetCollection: "interns",
        changeType: "delete_intern",
        changes: { action: "delete", name: intern.name, details: intern },
        reason: req.body?.reason || "Manager requested intern deletion",
      });
      await newRequest.save();
      return res.status(200).json({
        message: `Deletion request for intern ${intern.name} submitted to Admin for approval!`,
        pendingApproval: true,
        request: newRequest,
      });
    }

    await Intern.findByIdAndDelete(req.params.id);
    await InternAttendance.deleteMany({ intern: req.params.id });
    res.json({ message: "Intern deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
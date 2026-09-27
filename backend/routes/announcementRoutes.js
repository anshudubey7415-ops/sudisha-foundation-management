import express from "express";
import Announcement from "../models/Announcement.js";
import { verifyToken, isAdminOrManager } from "../middleware/authMiddleware.js";

const router = express.Router();

// Announcement fetch karne ke liye
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 }).lean();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Naya announcement banane ke liye
router.post("/", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const newAnnouncement = new Announcement(req.body);
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Announcement delete karne ke liye
router.delete("/:id", verifyToken, isAdminOrManager, async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
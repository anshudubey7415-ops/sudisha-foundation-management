import express from "express";
import Announcement from "../models/Announcement.js";

const router = express.Router();

// Announcement fetch karne ke liye
router.get("/", async (req, res) => {
  const announcements = await Announcement.find().sort({ date: -1 });
  res.json(announcements);
});

// Naya announcement banane ke liye
router.post("/", async (req, res) => {
  const newAnnouncement = new Announcement(req.body);
  await newAnnouncement.save();
  res.json(newAnnouncement);
});

export default router;
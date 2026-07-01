const express = require("express");
const router = express.Router();

const InternAttendance = require("../models/InternAttendance");
const Intern = require("../models/Intern");

/* =========================
MARK ATTENDANCE
========================= */

router.post("/mark", async (req, res) => {
  try {
    const { intern, status } = req.body;

    const internData = await Intern.findById(intern);

    if (!internData) {
      return res.status(404).json({
        message: "Intern not found",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Internship completed check
    if (today > internData.endDate) {
      return res.status(400).json({
        message:
          "Internship completed. Attendance disabled.",
      });
    }

    const attendance =
      await InternAttendance.findOneAndUpdate(
        {
          intern,
          date: today,
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
    const records =
      await InternAttendance.find()
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
    const records =
      await InternAttendance.find({
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
    const attendance =
      await InternAttendance.findByIdAndDelete(
        req.params.id
      );

    if (!attendance) {
      return res.status(404).json({
        message:
          "Attendance record not found",
      });
    }

    res.json({
      message:
        "Attendance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
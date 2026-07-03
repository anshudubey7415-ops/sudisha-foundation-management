const express = require("express");
const router = express.Router();

const Volunteer = require("../models/Volunteer");
const VolunteerAttendance = require("../models/VolunteerAttendance");

const multer = require("multer");
const path = require("path");

/* =========================
    Multer Configuration
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        path.extname(file.originalname)
    );
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

router.post(
  "/upload/:id",
  upload.single("photo"),
  async (req, res) => {
    try {
      const volunteer =
        await Volunteer.findByIdAndUpdate(
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
  }
);

/* =========================
    Add Volunteer
========================= */

router.post("/add", async (req, res) => {
  try {
    const volunteer =
      await Volunteer.create(req.body);

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
    const volunteers =
      await Volunteer.find();

    const data =
      await Promise.all(
        volunteers.map(
          async (volunteer) => {
            const records =
              await VolunteerAttendance.find(
                {
                  volunteer:
                    volunteer._id,
                }
              );

            const totalAttendanceDays =
              records.length;

            const presentDays =
              records.filter(
                (record) =>
                  record.status ===
                  "Present"
              ).length;

            const attendancePercentage =
              totalAttendanceDays > 0
                ? (
                    (presentDays /
                      totalAttendanceDays) *
                    100
                  ).toFixed(1)
                : 0;

            const totalHours =
              records.reduce(
                (
                  total,
                  record
                ) =>
                  total +
                  (record.hoursWorked ||
                    0),
                0
              );

            return {
              ...volunteer.toObject(),

              presentDays,
              totalAttendanceDays,
              attendancePercentage,
              totalHours,
            };
          }
        )
      );

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
    const volunteer =
      await Volunteer.findById(
        req.params.id
      );

    if (!volunteer) {
      return res.status(404).json({
        message:
          "Volunteer not found",
      });
    }

    const records =
      await VolunteerAttendance.find({
        volunteer:
          volunteer._id,
      });

    const totalAttendanceDays =
      records.length;

    const presentDays =
      records.filter(
        (record) =>
          record.status ===
          "Present"
      ).length;

    const attendancePercentage =
      totalAttendanceDays > 0
        ? (
            (presentDays /
              totalAttendanceDays) *
            100
          ).toFixed(1)
        : 0;

    const totalHours =
      records.reduce(
        (total, record) =>
          total +
          (record.hoursWorked || 0),
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
    const volunteer =
      await Volunteer.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!volunteer) {
      return res.status(404).json({
        message:
          "Volunteer not found",
      });
    }

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
    Delete Volunteer
========================= */

router.delete("/:id", async (req, res) => {
  try {
    const volunteer =
      await Volunteer.findByIdAndDelete(
        req.params.id
      );

    if (!volunteer) {
      return res.status(404).json({
        message:
          "Volunteer not found",
      });
    }

    await VolunteerAttendance.deleteMany(
      {
        volunteer:
          req.params.id,
      }
    );

    res.json({
      message:
        "Volunteer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
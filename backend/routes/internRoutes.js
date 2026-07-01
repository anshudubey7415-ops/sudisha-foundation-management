const express = require("express");
const router = express.Router();

const Intern = require("../models/Intern");
const InternAttendance = require("../models/InternAttendance");

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

/* =========================
   Upload Photo
========================= */

router.post(
  "/upload/:id",
  upload.single("photo"),
  async (req, res) => {
    try {
      const intern =
        await Intern.findByIdAndUpdate(
          req.params.id,
          {
            photo: req.file.filename,
          },
          {
            new: true,
          }
        );

      res.json(intern);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* =========================
   Add Intern
========================= */

router.post("/add", async (req, res) => {
  try {

    const count =
      await Intern.countDocuments();

    const currentYear =
      new Date().getFullYear();

    const certificateNumber =
      `SF-CERT-${currentYear}-${String(
        count + 1
      ).padStart(3, "0")}`;

    const intern =
      await Intern.create({
        ...req.body,
        certificateNumber,
      });

    res.status(201).json(intern);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});
  

/* =========================
   Get All Interns
========================= */

router.get("/", async (req, res) => {
  try {
    const interns = await Intern.find();

    const data =
      await Promise.all(
        interns.map(async (intern) => {
          const records =
            await InternAttendance.find({
              intern: intern._id,
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

          return {
            ...intern.toObject(),

            presentDays,
            totalAttendanceDays,
            attendancePercentage,
          };
        })
      );

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   Get Single Intern
========================= */

router.get("/:id", async (req, res) => {
  try {
    const intern =
      await Intern.findById(
        req.params.id
      );

    if (!intern) {
      return res.status(404).json({
        message: "Intern not found",
      });
    }

    const records =
      await InternAttendance.find({
        intern: intern._id,
      });

    const totalAttendanceDays =
      records.length;

    const presentDays =
      records.filter(
        (record) =>
          record.status === "Present"
      ).length;

    const attendancePercentage =
      totalAttendanceDays > 0
        ? (
            (presentDays /
              totalAttendanceDays) *
            100
          ).toFixed(1)
        : 0;

    res.json({
      ...intern.toObject(),

      presentDays,
      totalAttendanceDays,
      attendancePercentage,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   Update Intern
========================= */

router.put("/:id", async (req, res) => {
  try {
    const intern =
      await Intern.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!intern) {
      return res.status(404).json({
        message: "Intern not found",
      });
    }

    res.json(intern);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   Delete Intern
========================= */

router.delete("/:id", async (req, res) => {
  try {
    const intern =
      await Intern.findByIdAndDelete(
        req.params.id
      );

    if (!intern) {
      return res.status(404).json({
        message: "Intern not found",
      });
    }

    await InternAttendance.deleteMany({
      intern: req.params.id,
    });

    res.json({
      message:
        "Intern deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

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
Upload Student Photo
========================= */

router.post(
"/upload/:id",
upload.single("photo"),
async (req, res) => {
try {
const student =
await Student.findByIdAndUpdate(
req.params.id,
{
photo: req.file.filename,
},
{
new: true,
}
);


  res.json(student);
} catch (error) {
  res.status(500).json({
    message: error.message,
  });
}


}
);

/* =========================
Add Student
========================= */

router.post("/add", async (req, res) => {
try {
const student = await Student.create(
req.body
);


res.status(201).json(student);


} catch (error) {
res.status(500).json({
message: error.message,
});
}
});

/* =========================
Get All Students
========================= */

router.get("/", async (req, res) => {
try {
const students =
await Student.find();


const studentsWithAttendance =
  await Promise.all(
    students.map(async (student) => {
      const attendanceRecords =
        await Attendance.find({
          student: student._id,
        });

      const totalAttendanceDays =
        attendanceRecords.length;

      const presentDays =
        attendanceRecords.filter(
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
        ...student.toObject(),

        presentDays,
        totalAttendanceDays,
        attendancePercentage,
      };
    })
  );

res.json(
  studentsWithAttendance
);


} catch (error) {
res.status(500).json({
message: error.message,
});
}
});

/* =========================
Get Single Student
========================= */

router.get("/:id", async (req, res) => {
try {
const student =
await Student.findById(
req.params.id
);


if (!student) {
  return res.status(404).json({
    message:
      "Student not found",
  });
}

const attendanceRecords =
  await Attendance.find({
    student: student._id,
  });

const totalAttendanceDays =
  attendanceRecords.length;

const presentDays =
  attendanceRecords.filter(
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

res.json({
  ...student.toObject(),

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
Update Student
========================= */

router.put("/:id", async (req, res) => {
try {
const student =
await Student.findByIdAndUpdate(
req.params.id,
req.body,
{
new: true,
}
);


if (!student) {
  return res.status(404).json({
    message:
      "Student not found",
  });
}

res.json(student);


} catch (error) {
res.status(500).json({
message: error.message,
});
}
});

/* =========================
Delete Student
========================= */

router.delete("/:id", async (req, res) => {
try {
const student =
await Student.findByIdAndDelete(
req.params.id
);


if (!student) {
  return res.status(404).json({
    message:
      "Student not found",
  });
}

await Attendance.deleteMany({
  student: req.params.id,
});

res.json({
  message:
    "Student deleted successfully",
});


} catch (error) {
res.status(500).json({
message: error.message,
});
}
});

module.exports = router;

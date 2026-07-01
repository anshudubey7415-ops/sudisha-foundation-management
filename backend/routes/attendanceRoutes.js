const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const ExcelJS = require("exceljs");

// Mark Attendance
router.post("/mark", async (req, res) => {
try {
const { student, status } = req.body;


const today = new Date().toISOString().split("T")[0];

const attendance =
  await Attendance.findOneAndUpdate(
    {
      student,
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

// Get All Attendance Records
router.get("/", async (req, res) => {
try {
const records = await Attendance.find()
.populate("student");


res.json(records);


} catch (error) {
res.status(500).json({
message: error.message,
});
}
});

// Export Attendance Excel
router.get("/export/excel", async (req, res) => {
try {
const records = await Attendance.find()
.populate("student");


const workbook =
  new ExcelJS.Workbook();

const worksheet =
  workbook.addWorksheet(
    "Attendance Report"
  );

worksheet.columns = [
  {
    header: "Roll Number",
    key: "rollNumber",
    width: 20,
  },
  {
    header: "Student Name",
    key: "name",
    width: 30,
  },
  {
    header: "Class",
    key: "class",
    width: 15,
  },
  {
    header: "Date",
    key: "date",
    width: 20,
  },
  {
    header: "Status",
    key: "status",
    width: 15,
  },
];

records.forEach((record) => {
  worksheet.addRow({
    rollNumber:
      record.student?.rollNumber || "",
    name:
      record.student?.name || "",
    class:
      record.student?.class || "",
    date: record.date,
    status: record.status,
  });
});

res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);

res.setHeader(
  "Content-Disposition",
  "attachment; filename=Attendance_Report.xlsx"
);

await workbook.xlsx.write(res);

res.end();


} catch (error) {
res.status(500).json({
message: error.message,
});
}
});

module.exports = router;

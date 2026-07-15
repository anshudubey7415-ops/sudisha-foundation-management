import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    class: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      default: "",
      trim: true,
    },

    admissionDate: {
      type: String,
      required: true,
    },

    fatherName: {
      type: String,
      default: "",
      trim: true,
    },

    motherName: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    /* Student Profile Photo */
    photo: {
      type: String,
      default: "",
    },

    /* Attendance Statistics */
    presentDays: {
      type: Number,
      default: 0,
    },

    totalAttendanceDays: {
      type: Number,
      default: 0,
    },

    attendancePercentage: {
      type: Number,
      default: 0,
    },

    /* Academic Progress */
    syllabusCompleted: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
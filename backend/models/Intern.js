import mongoose from "mongoose";

const internSchema = new mongoose.Schema(
  {
    internId: {
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

    college: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
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

    department: {
      type: String,
      default: "",
      trim: true,
    },

    mentor: {
      type: String,
      default: "",
      trim: true,
    },

    // Internship Duration
    startDate: {
      type: String,
      required: true,
    },

    endDate: {
      type: String,
      required: true,
    },

    // Photo
    photo: {
      type: String,
      default: "",
    },

    // Internship Status
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
    certificateNumber: {
      type: String,
      default: "",
    },

    // Attendance
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
  },
  {
    timestamps: true,
  }
);

const Intern = mongoose.model("Intern", internSchema);

export default Intern;
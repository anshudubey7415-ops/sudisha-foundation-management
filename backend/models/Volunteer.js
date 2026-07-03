const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    // Volunteer ID
    volunteerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },

    dob: {
      type: String,
      default: "",
    },

    photo: {
      type: String,
      default: "",
    },

    // Contact Information
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    emergencyContact: {
      type: String,
      default: "",
      trim: true,
    },

    // Education
    education: {
      type: String,
      default: "",
      trim: true,
    },

    // Skills
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // Interest Areas
    interests: [
      {
        type: String,
        trim: true,
      },
    ],

    // Volunteer Details
    joiningDate: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Project Assignment
    assignedProjects: [
      {
        type: String,
      },
    ],

    // Attendance Stats
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

    // Hours Tracking
    totalHours: {
      type: Number,
      default: 0,
    },

    // Badge System
    badge: {
      type: String,
      enum: [
        "Beginner",
        "Bronze",
        "Silver",
        "Gold",
        "Star Volunteer",
      ],
      default: "Beginner",
    },

    // Volunteer Verification
    verificationId: {
      type: String,
      default: "",
    },

    // Certificate Number
    certificateNumber: {
      type: String,
      default: "",
    },

    // Remarks
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Volunteer",
  volunteerSchema
);
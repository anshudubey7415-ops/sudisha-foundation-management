import mongoose from "mongoose";

const volunteerAttendanceSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Half Day",
        "Work From Home",
      ],
      default: "Present",
    },

    checkIn: {
      type: String,
      default: "",
    },

    checkOut: {
      type: String,
      default: "",
    },

    hoursWorked: {
      type: Number,
      default: 0,
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const VolunteerAttendance = mongoose.model(
  "VolunteerAttendance",
  volunteerAttendanceSchema
);

export default VolunteerAttendance;
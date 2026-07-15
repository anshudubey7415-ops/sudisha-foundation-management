import mongoose from "mongoose";

const internAttendanceSchema = new mongoose.Schema(
  {
    intern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Intern",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

internAttendanceSchema.index(
  {
    intern: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

const InternAttendance = mongoose.model("InternAttendance", internAttendanceSchema);

export default InternAttendance;
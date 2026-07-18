import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  // Yahan hum members ko link karenge
  members: [{
    memberId: { type: mongoose.Schema.Types.ObjectId, required: true },
    memberModel: { type: String, required: true, enum: ['Student', 'Intern', 'Volunteer'] }
  }]
});

export default mongoose.model("Project", projectSchema);
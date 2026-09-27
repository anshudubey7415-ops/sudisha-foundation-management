import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  targetUserId: { 
    type: mongoose.Schema.Types.Mixed, 
    required: false,
    default: null 
  },
  targetName: {
    type: String,
    default: ""
  },
  targetCollection: { 
    type: String, 
    required: true,
    enum: [
      'students', 
      'interns', 
      'volunteers', 
      'student_attendance', 
      'intern_attendance', 
      'volunteer_attendance', 
      'projects',
      'users',
      'passwords'
    ] 
  },
  changeType: { 
    type: String, 
    required: true 
  },
  changes: { 
    type: Object, 
    required: true 
  },
  reason: { 
    type: String,
    default: ""
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
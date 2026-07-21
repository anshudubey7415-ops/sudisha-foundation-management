import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  targetUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  // Nayi field: Isse pata chalega ki update 'students', 'interns' ya 'volunteers' collection mein karna hai
  targetCollection: { 
    type: String, 
    required: true,
    enum: ['students', 'interns', 'volunteers'] 
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
    type: String 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date 
  }
});

requestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.updatedAt = new Date();
  }
  next();
});

export default mongoose.model('Request', requestSchema);
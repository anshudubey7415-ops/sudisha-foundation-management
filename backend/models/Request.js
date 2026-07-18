import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  targetUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  changeType: { 
    type: String, 
    required: true 
  }, // e.g., 'update_profile', 'change_role'
  changes: { 
    type: Object, 
    required: true 
  }, // Jo data change karna hai
  reason: { 
    type: String 
  }, // Request kyun ki ja rahi hai, iska note
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
  } // Jab status update hoga, tab ka timestamp
});

// Pre-save hook: Jab bhi status update ho, updatedAt apne aap set ho jaye
requestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.updatedAt = new Date();
  }
  next();
});

export default mongoose.model('Request', requestSchema);
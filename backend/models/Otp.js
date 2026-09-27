import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Document will expire when current time passes expiresAt
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Otp', otpSchema);

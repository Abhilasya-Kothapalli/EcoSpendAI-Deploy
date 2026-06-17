const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  totalSavings: {
    type: Number,
    default: 0,
  },
  totalCarbonOffset: {
    type: Number,
    default: 0,
  },
  ecoPoints: {
    type: Number,
    default: 0,
  },
  weeklyScore: {
    type: Number,
    default: 100,
  },
  loginStreak: {
    type: Number,
    default: 0,
  },
  lastLoginDate: {
    type: Date,
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  unlockedCertificates: [
    {
      tier: { type: String, required: true }, // e.g., 'Bronze', 'Silver', 'Gold'
      points: { type: Number, required: true },
      unlockedAt: { type: Date, default: Date.now }
    }
  ],
  acceptedChallenges: {
    type: [String],
    default: []
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);

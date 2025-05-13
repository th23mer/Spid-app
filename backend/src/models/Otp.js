const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

// Automatically delete OTP after expiration
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);

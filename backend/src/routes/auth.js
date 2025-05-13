const express = require('express');
const jwt = require('jsonwebtoken');
const Otp = require('../models/Otp');

const router = express.Router();

// Generate and store OTP (mock SMS)
router.post('/request-otp', async (req, res) => {
  const { phone } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.findOneAndUpdate(
    { phone },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  console.log(`Mock SMS to ${phone}: Your OTP is ${code}`);
  res.json({ success: true });
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  const record = await Otp.findOne({ phone });
  if (!record || record.code !== code || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Code invalide ou expiré' });
  }

  const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const Otp = require('../models/Otp');
const User = require('../models/User');
const { Op } = require('sequelize');

const router = express.Router();

// Generate and store OTP (mock SMS)
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Check if user exists, if not return an error
    const user = await User.findOne({
      where: { phone }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé. Veuillez contacter un administrateur pour créer un compte.' });
    }

    // Now find or create the OTP record
    const [otpRecord, created] = await Otp.findOrCreate({
      where: { phone },
      defaults: { code, expiresAt }
    });

    // If record exists, update it
    if (!created) {
      await otpRecord.update({ code, expiresAt });
    }

    console.log(`Mock SMS to ${phone}: Your OTP is ${code}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    const record = await Otp.findOne({
      where: {
        phone,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!record || record.code !== code) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT
router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    req.payload = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Save profile
router.post('/', async (req, res) => {
  const { phone } = req.payload;
  const data = req.body;
  const user = await User.findOneAndUpdate({ phone }, { ...data }, { upsert: true, new: true });
  res.json({ user });
});

module.exports = router;

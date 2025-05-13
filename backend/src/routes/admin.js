const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Admin login route
router.post('/login', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: 'Invalid API key' });
  }
  // Issue a short-lived admin JWT
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Middleware to verify admin JWT
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.admin) throw new Error('Not admin');
    req.admin = true;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Apply admin authentication to all routes below
router.use(adminAuth);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ _id: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

module.exports = router;

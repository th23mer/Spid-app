const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Prospection = require('../models/Prospection');

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
  try {
    const { phone } = req.payload;
    const data = req.body;
    
    // Extract user data and prospection data
    const userData = {};
    const prospectionData = {};
    
    // User data
    if (data.nom) userData.nom = data.nom;
    if (data.prenom) userData.prenom = data.prenom;
    
    // Prospection data
    if (data.zone) prospectionData.zone = data.zone;
    if (data.immeuble) prospectionData.immeuble = data.immeuble;
    if (data.blocImmeuble) prospectionData.blocImmeuble = data.blocImmeuble;
    if (data.appartement) prospectionData.appartement = data.appartement;
    if (data.nomClient) prospectionData.nomClient = data.nomClient;
    if (data.numContact) prospectionData.numContact = data.numContact;
    if (data.resultatProspection) prospectionData.resultatProspection = data.resultatProspection;
    if (data.typeClient) prospectionData.typeClient = data.typeClient;
    
    // Extract location data if present
    if (data.location) {
      prospectionData.latitude = data.location.latitude;
      prospectionData.longitude = data.location.longitude;
      prospectionData.locationTimestamp = data.location.timestamp;
      prospectionData.locationShared = true;
    }
    
    // Find or create user
    const [user, userCreated] = await User.findOrCreate({
      where: { phone },
      defaults: userData
    });
    
    // If user exists, update it
    if (!userCreated && Object.keys(userData).length > 0) {
      await user.update(userData);
    }
    
    // Find or create prospection
    let prospection;
    if (Object.keys(prospectionData).length > 0) {
      // Check if there's an existing prospection for this phone
      prospection = await Prospection.findOne({ where: { phone } });
      
      if (prospection) {
        // Update existing prospection
        await prospection.update(prospectionData);
        await prospection.reload();
      } else {
        // Create new prospection
        prospection = await Prospection.create({ 
          phone, 
          ...prospectionData 
        });
      }
    } else {
      // Just retrieve the prospection if no updates
      prospection = await Prospection.findOne({ where: { phone } });
    }
    
    // Format the response to match the old structure
    const userPlain = user.get({ plain: true });
    const prospectionPlain = prospection ? prospection.get({ plain: true }) : {};
    
    const formattedUser = {
      ...userPlain,
      ...prospectionPlain,
      location: prospectionPlain.latitude ? {
        latitude: prospectionPlain.latitude,
        longitude: prospectionPlain.longitude,
        timestamp: prospectionPlain.locationTimestamp
      } : undefined
    };
    
    res.json({ user: formattedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/', async (req, res) => {
  try {
    const { phone } = req.payload;
    
    // Find the user
    const user = await User.findOne({ where: { phone } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find prospection data if any
    const prospection = await Prospection.findOne({ where: { phone } });
    
    // Format the response
    const userPlain = user.get({ plain: true });
    const prospectionPlain = prospection ? prospection.get({ plain: true }) : {};
    
    const formattedUser = {
      ...userPlain,
      ...prospectionPlain,
      location: prospectionPlain.latitude ? {
        latitude: prospectionPlain.latitude,
        longitude: prospectionPlain.longitude,
        timestamp: prospectionPlain.locationTimestamp
      } : undefined
    };
    
    res.json({ user: formattedUser });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

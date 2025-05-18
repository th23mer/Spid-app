const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Prospection = require('../models/Prospection');
const { Op } = require('sequelize');

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

// Get all users with their prospection data
router.get('/users', async (req, res) => {
  try {
    // Get all users with their prospection data using a join
    const users = await User.findAll({
      include: [{
        model: Prospection,
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });
    
    // Format the response to match the old structure
    const formattedUsers = users.map(user => {
      const plainUser = user.get({ plain: true });
      const prospections = plainUser.Prospections || [];
      const latestProspection = prospections.length > 0 ? prospections[0] : null;
      
      // Merge user and prospection data
      const result = {
        ...plainUser,
        // Add prospection fields if available
        ...(latestProspection ? {
          zone: latestProspection.zone,
          immeuble: latestProspection.immeuble,
          blocImmeuble: latestProspection.blocImmeuble,
          appartement: latestProspection.appartement,
          nomClient: latestProspection.nomClient,
          numContact: latestProspection.numContact,
          resultatProspection: latestProspection.resultatProspection,
          locationShared: latestProspection.locationShared,
          location: latestProspection.latitude ? {
            latitude: latestProspection.latitude,
            longitude: latestProspection.longitude,
            timestamp: latestProspection.locationTimestamp
          } : undefined
        } : {})
      };
      
      // Remove the Prospections array from the result
      delete result.Prospections;
      
      return result;
    });
    
    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user by phone with prospection data
router.get('/users/:phone', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.phone, {
      include: [{
        model: Prospection,
        required: false
      }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the response to match the old structure
    const plainUser = user.get({ plain: true });
    const prospections = plainUser.Prospections || [];
    const latestProspection = prospections.length > 0 ? prospections[0] : null;
    
    // Merge user and prospection data
    const formattedUser = {
      ...plainUser,
      // Add prospection fields if available
      ...(latestProspection ? {
        zone: latestProspection.zone,
        immeuble: latestProspection.immeuble,
        blocImmeuble: latestProspection.blocImmeuble,
        appartement: latestProspection.appartement,
        nomClient: latestProspection.nomClient,
        numContact: latestProspection.numContact,
        resultatProspection: latestProspection.resultatProspection,
        locationShared: latestProspection.locationShared,
        location: latestProspection.latitude ? {
          latitude: latestProspection.latitude,
          longitude: latestProspection.longitude,
          timestamp: latestProspection.locationTimestamp
        } : undefined
      } : {})
    };
    
    // Remove the Prospections array from the result
    delete formattedUser.Prospections;
    
    res.json({ user: formattedUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Create a new user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { phone, nom, prenom } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByPk(phone);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }
    
    // Create new user
    const user = await User.create({ phone, nom, prenom });
    
    res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Update an existing user
router.put('/users/:phone', adminAuth, async (req, res) => {
  try {
    const { nom, prenom } = req.body;
    const user = await User.findByPk(req.params.phone);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    await user.update({ nom, prenom });
    await user.reload();
    
    res.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete a user and all associated prospection data
router.delete('/users/:phone', adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.phone);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete associated prospection data first
    await Prospection.destroy({ where: { phone: req.params.phone } });
    
    // Delete user
    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Get sales performance metrics
router.get('/metrics', async (req, res) => {
  try {
    // Get all users with their prospection data
    const users = await User.findAll({
      include: [{
        model: Prospection,
        required: false
      }],
      attributes: ['phone', 'nom', 'prenom']
    });

    // Calculate metrics
    const metrics = {
      totalUsers: users.length,
      totalProspections: 0,
      salesBySalesperson: [],
      salesByZone: {},
      salesByType: {
        b2b: 0,
        b2c: 0
      },
      resultsDistribution: {
        'Client n\'est pas disponible': 0,
        'Client non intéressé': 0,
        'Vente confirmée': 0
      },
      topPerformers: []
    };

    // Process each user and their prospections
    users.forEach(user => {
      const plainUser = user.get({ plain: true });
      const prospections = plainUser.Prospections || [];
      
      // Count total prospections
      metrics.totalProspections += prospections.length;
      
      // Count confirmed sales for this salesperson
      const confirmedSales = prospections.filter(p => p.resultatProspection === 'Vente confirmée').length;
      
      // Add to salesBySalesperson if they have any prospections
      if (prospections.length > 0) {
        metrics.salesBySalesperson.push({
          name: `${plainUser.nom || ''} ${plainUser.prenom || ''}`.trim() || plainUser.phone,
          phone: plainUser.phone,
          totalProspections: prospections.length,
          confirmedSales: confirmedSales,
          conversionRate: prospections.length > 0 ? (confirmedSales / prospections.length * 100).toFixed(1) : 0
        });
      }
      
      // Process each prospection
      prospections.forEach(p => {
        // Count by result type
        if (p.resultatProspection) {
          metrics.resultsDistribution[p.resultatProspection] = 
            (metrics.resultsDistribution[p.resultatProspection] || 0) + 1;
        }
        
        // Count by zone
        if (p.zone) {
          metrics.salesByZone[p.zone] = metrics.salesByZone[p.zone] || {
            total: 0,
            confirmed: 0
          };
          metrics.salesByZone[p.zone].total++;
          
          if (p.resultatProspection === 'Vente confirmée') {
            metrics.salesByZone[p.zone].confirmed++;
          }
        }
        
        // Count by client type (B2B/B2C)
        if (p.typeClient) {
          const type = p.typeClient.toLowerCase();
          if (type === 'b2b' || type === 'b2c') {
            metrics.salesByType[type]++;
          }
        }
      });
    });
    
    // Sort salesBySalesperson by confirmed sales (descending)
    metrics.salesBySalesperson.sort((a, b) => b.confirmedSales - a.confirmedSales);
    
    // Get top 5 performers
    metrics.topPerformers = metrics.salesBySalesperson.slice(0, 5);
    
    // Convert salesByZone to array for easier consumption by frontend
    metrics.salesByZoneArray = Object.entries(metrics.salesByZone).map(([zone, data]) => ({
      zone,
      total: data.total,
      confirmed: data.confirmed,
      conversionRate: data.total > 0 ? (data.confirmed / data.total * 100).toFixed(1) : 0
    }));
    
    // Convert resultsDistribution to array for charts
    metrics.resultsDistributionArray = Object.entries(metrics.resultsDistribution).map(([result, count]) => ({
      name: result,
      value: count
    }));
    
    // Convert salesByType to array for charts
    metrics.salesByTypeArray = Object.entries(metrics.salesByType).map(([type, count]) => ({
      name: type.toUpperCase(),
      value: count
    }));
    
    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
});

module.exports = router;

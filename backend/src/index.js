const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const User = require('./models/User');
const Otp = require('./models/Otp');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

// We're not defining any relationships between models to avoid foreign key constraints
// This allows OTPs to be created without requiring a User to exist first
// We'll handle the relationship in the application logic instead

// Function to sync all models with the database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL database
sequelize
  .authenticate()
  .then(() => {
    console.log('PostgreSQL connected');
    // Sync models with database
    return syncDatabase();
  })
  .catch(err => console.error('PostgreSQL connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

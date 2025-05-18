const sequelize = require('../config/database');
const User = require('../models/User');
const Otp = require('../models/Otp');
const Prospection = require('../models/Prospection');

// Note: The relationships between models are now defined in the model files
// User-Prospection: One-to-Many relationship (one user can have multiple prospections)
// User-Otp: One-to-Many relationship (one user can have multiple OTPs)

// Function to initialize the database
async function initializeDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');

    // Sync all models with the database
    // The order matters because of the relationships
    // First sync User model (parent)
    await User.sync({ force: true });
    console.log('User model synchronized successfully.');
    
    // Then sync Prospection model (child with foreign key to User)
    await Prospection.sync({ force: true });
    console.log('Prospection model synchronized successfully.');
    
    // Then sync Otp model (child with foreign key to User)
    await Otp.sync({ force: true });
    console.log('Otp model synchronized successfully.');
    
    // Create sample data if needed
    console.log('Creating sample data...');
    
    // Create a sample user
    const user = await User.create({
      phone: '123456789',
      nom: 'Doe',
      prenom: 'John'
    });
    
    // Create a sample prospection for the user
    await Prospection.create({
      phone: '123456789',
      zone: 'Zone A',
      immeuble: 'Immeuble 1',
      blocImmeuble: 'Bloc A',
      appartement: 'Apt 101',
      nomClient: 'Client Test',
      numContact: '987654321',
      resultatProspection: 'Client non intéressé',
      typeClient: 'B2B',
      locationShared: false
    });
    
    console.log('Sample data created successfully.');
    console.log('Database initialization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to initialize the database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();

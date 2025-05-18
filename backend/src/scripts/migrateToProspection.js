const sequelize = require('../config/database');
const { DataTypes, QueryTypes } = require('sequelize');
const User = require('../models/User');
const Prospection = require('../models/Prospection');

async function migrateData() {
  try {
    console.log('Starting migration process...');
    
    // Get a connection to run raw queries
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if the new tables exist
    const tables = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'", { 
      type: QueryTypes.SELECT 
    });
    const tableNames = tables.map(t => t.name);
    
    console.log('Existing tables:', tableNames);
    
    // Step 1: Create a backup of the current Users table
    console.log('Creating backup of Users table...');
    await sequelize.query('CREATE TABLE IF NOT EXISTS Users_Backup AS SELECT * FROM Users');
    
    // Step 2: Get all existing user data
    console.log('Fetching existing user data...');
    const existingUsers = await sequelize.query('SELECT * FROM Users', { 
      type: QueryTypes.SELECT 
    });
    
    console.log(`Found ${existingUsers.length} existing users to migrate`);
    
    // Step 3: Sync the new models to create the tables with the new structure
    console.log('Creating new table structure...');
    await User.sync({ force: false, alter: true });
    await Prospection.sync({ force: false, alter: true });
    
    // Step 4: Migrate the data
    console.log('Migrating data to new structure...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const oldUser of existingUsers) {
      try {
        // Create or update user in new structure
        const [user, created] = await User.findOrCreate({
          where: { phone: oldUser.phone },
          defaults: {
            nom: oldUser.nomClient || null,
            prenom: null // No prenom in old structure
          }
        });
        
        // Create prospection record
        await Prospection.create({
          phone: oldUser.phone,
          zone: oldUser.zone,
          immeuble: oldUser.immeuble,
          blocImmeuble: oldUser.blocImmeuble,
          appartement: oldUser.appartement,
          nomClient: oldUser.nomClient,
          numContact: oldUser.numContact,
          resultatProspection: oldUser.resultatProspection,
          locationShared: oldUser.locationShared,
          latitude: oldUser.latitude,
          longitude: oldUser.longitude,
          locationTimestamp: oldUser.locationTimestamp,
          createdAt: oldUser.createdAt,
          updatedAt: oldUser.updatedAt
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error migrating user ${oldUser.phone}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Migration completed: ${successCount} users migrated successfully, ${errorCount} errors`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateData().then(() => {
  console.log('Migration script completed');
  process.exit(0);
}).catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Prospection = sequelize.define('Prospection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'phone'
    }
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  immeuble: {
    type: DataTypes.STRING,
    allowNull: true
  },
  blocImmeuble: {
    type: DataTypes.STRING,
    allowNull: true
  },
  appartement: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nomClient: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numContact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resultatProspection: {
    type: DataTypes.STRING,
    allowNull: true
  },
  typeClient: {
    type: DataTypes.STRING,
    allowNull: true
  },
  locationShared: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  locationTimestamp: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

// Define the association
Prospection.belongsTo(User, { foreignKey: 'phone' });
User.hasMany(Prospection, { foreignKey: 'phone' });

module.exports = Prospection;

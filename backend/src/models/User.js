const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  zone: String,
  immeuble: String,
  blocImmeuble: String,
  appartement: String,
  nomClient: String,
  numContact: String,
  locationShared: { type: Boolean, default: false },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date
  }
});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  hallName: { type: String, required: true },
  capacity: { type: Number, required: true },
  block: { type: String, required: true }
}, { timestamps: true });

// Halls remain in a central repository but can be queried or copied if needed.
// For now, we use a central 'Halls' collection.
module.exports = mongoose.model('Hall', hallSchema);

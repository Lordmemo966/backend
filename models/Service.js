const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  icon:    { type: String, default: '🔧' },
  name:    { type: String, required: true },
  description: { type: String, default: '' },
  order:   { type: Number, default: 0 },
  active:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);

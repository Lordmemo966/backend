const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  date:    { type: String, required: true, unique: true }, // YYYY-MM-DD
  total:   { type: Number, default: 0 },
  pages:   {
    home:    { type: Number, default: 0 },
    gallery: { type: Number, default: 0 },
    admin:   { type: Number, default: 0 },
    stats:   { type: Number, default: 0 },
  },
  waClicks: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Stats', statsSchema);

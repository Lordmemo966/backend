const mongoose = require('mongoose');

const hourSchema = new mongoose.Schema({
  day:    { type: String, required: true },
  open:   { type: String, default: '09:00' },
  close:  { type: String, default: '21:00' },
  closed: { type: Boolean, default: false },
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  phone:       { type: String, default: '' },
  whatsapp:    { type: String, default: '' },
  email:       { type: String, default: '' },
  address:     { type: String, default: '' },
  note:        { type: String, default: '' },
  social: {
    facebook:  { type: String, default: '#' },
    instagram: { type: String, default: '#' },
    youtube:   { type: String, default: '#' },
    twitter:   { type: String, default: '#' },
  },
  hours:       [hourSchema],
  maintenance: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);

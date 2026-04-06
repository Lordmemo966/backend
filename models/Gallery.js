const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, required: true },   // Cloudinary public_id for deletion
  caption:   { type: String, default: '' },
  order:     { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);

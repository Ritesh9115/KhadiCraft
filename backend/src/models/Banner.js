// src/models/Banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subtitle:    { type: String },
  description: { type: String },
  image:       { type: String, required: true },   // Cloudinary URL
  link:        { type: String },
  button_text: { type: String },
  position:    { type: String, enum: ['hero', 'sidebar', 'popup', 'banner'], default: 'hero' },
  sort_order:  { type: Number, default: 0 },
  is_active:   { type: Boolean, default: true },
  starts_at:   { type: Date },
  ends_at:     { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);

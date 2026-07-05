// src/models/MeasurementProfile.js
const mongoose = require('mongoose');

const measurementProfileSchema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },   // e.g. "Office Shirt", "Wedding Suit"
  chest:        { type: Number },
  waist:        { type: Number },
  hips:         { type: Number },
  shoulder:     { type: Number },
  shirt_length: { type: Number },
  pant_length:  { type: Number },
  sleeve_length:{ type: Number },
  neck:         { type: Number },
  thigh:        { type: Number },
  inseam:       { type: Number },
  notes:        { type: String },
  is_default:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MeasurementProfile', measurementProfileSchema);

// src/models/FabricType.js
const mongoose = require('mongoose');

const fabricTypeSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  is_active:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('FabricType', fabricTypeSchema);

// src/models/Setting.js
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  group: { type: String, default: 'general' },
}, { timestamps: true });

// Static get helper
settingSchema.statics.get = async function (key, defaultValue = null) {
  const s = await this.findOne({ key });
  return s ? s.value : defaultValue;
};

// Static set helper
settingSchema.statics.set = async function (key, value, group = 'general') {
  return this.findOneAndUpdate({ key }, { value, group }, { upsert: true, new: true });
};

module.exports = mongoose.model('Setting', settingSchema);

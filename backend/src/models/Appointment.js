// src/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointment_number: { type: String, unique: true },
  user_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:             { type: String, enum: ['shop_visit', 'home_visit', 'measurement', 'consultation', 'fabric_selection'], required: true },
  appointment_date: { type: Date, required: true },
  time_slot:        { type: String, required: true },
  purpose:          { type: String, required: true },
  notes:            { type: String },
  admin_notes:      { type: String },
  status:           { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'], default: 'pending' },
  assigned_staff_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

appointmentSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

// Auto-generate appointment_number before save
appointmentSchema.pre('save', async function(next) {
  if (!this.appointment_number) {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.appointment_number = `APT-${ts}${rnd}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);


// src/models/CustomOrder.js
const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
  stage:        { type: String, required: true },
  status:       { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  completed_at: { type: Date },
  notes:        { type: String },
}, { timestamps: true });

const customOrderSchema = new mongoose.Schema({
  user_id:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  custom_order_number:  { type: String, required: true, unique: true },
  style_type:           { type: String, required: true },
  fabric_product_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  fabric_name:          { type: String },
  fabric_preference:    { type: String },
  measurement_profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MeasurementProfile' },
  measurements:         { type: mongoose.Schema.Types.Mixed },  // JSON object
  // Individual measurement columns
  chest:          { type: Number },
  waist:          { type: Number },
  hips:           { type: Number },
  shoulder:       { type: Number },
  shirt_length:   { type: Number },
  pant_length:    { type: Number },
  sleeve_length:  { type: Number },
  neck:           { type: Number },
  thigh:          { type: Number },
  inseam:         { type: Number },
  special_instructions: { type: String },
  notes:          { type: String },
  admin_notes:    { type: String },
  tailor_notes:   { type: String },
  reference_images: [{ type: mongoose.Schema.Types.Mixed }],  // array of { path, original_name, uploaded_at }
  status:         {
    type: String,
    enum: ['pending', 'confirmed', 'fabric_selected', 'measurement_received', 'cutting',
           'stitching', 'finishing', 'quality_check', 'ready', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimated_price:      { type: Number },
  final_price:          { type: Number },
  payment_status:       { type: String, enum: ['pending', 'advance_paid', 'fully_paid', 'refunded'], default: 'pending' },
  assigned_tailor_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estimated_ready_date: { type: Date },
  actual_ready_date:    { type: Date },
  stages:               [stageSchema],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

customOrderSchema.virtual('assignedTailor', {
  ref: 'User',
  localField: 'assigned_tailor_id',
  foreignField: '_id',
  justOne: true,
});

customOrderSchema.virtual('measurementProfile', {
  ref: 'MeasurementProfile',
  localField: 'measurement_profile_id',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('CustomOrder', customOrderSchema);

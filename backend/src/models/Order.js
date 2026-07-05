// src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id:  { type: mongoose.Schema.Types.ObjectId, default: null },   // sub-doc id
  product_name:{ type: String },   // snapshot at time of order
  product_sku: { type: String },
  variant_info:{ type: mongoose.Schema.Types.Mixed },  // snapshot
  quantity:    { type: Number, required: true, min: 1 },
  price:       { type: Number, required: true },
  total:       { type: Number, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const orderSchema = new mongoose.Schema({
  user_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_number:     { type: String, required: true, unique: true },
  shipping_address: { type: mongoose.Schema.Types.Mixed, required: true }, // snapshot
  shipping_address_id: { type: mongoose.Schema.Types.ObjectId },
  payment_method:   { type: String, enum: ['cod', 'online', 'upi', 'bank_transfer', 'razorpay'], required: true },
  payment_status:   { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  status:           { type: String, enum: ['pending', 'confirmed', 'processing', 'ready', 'dispatched', 'delivered', 'cancelled', 'returned'], default: 'pending' },
  notes:            { type: String },
  admin_notes:      { type: String },
  tailor_notes:     { type: String },
  assigned_tailor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  measurements:     { type: mongoose.Schema.Types.Mixed }, // Store JSON adjustments/measurements
  subtotal:         { type: Number, default: 0 },
  shipping_cost:    { type: Number, default: 0 },
  tax:              { type: Number, default: 0 },
  total:            { type: Number, default: 0 },
  tracking_number:  { type: String },
  courier:          { type: String },
  estimated_delivery:{ type: String },
  delivered_at:     { type: Date },
  payment_id:       { type: String },
  paid_at:          { type: Date },
  items:            [orderItemSchema],
  deleted_at:       { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Order', orderSchema);

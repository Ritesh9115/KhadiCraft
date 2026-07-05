// src/models/InventoryLog.js
const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  product_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type:          { type: String, enum: ['stock_in', 'stock_out', 'adjustment', 'damage', 'sale', 'return'], required: true },
  quantity:      { type: Number, required: true },
  stock_before:  { type: Number, required: true },
  stock_after:   { type: Number, required: true },
  reference_type:{ type: String },   // 'manual', 'order', 'return', etc.
  reference_id:  { type: mongoose.Schema.Types.ObjectId },
  notes:         { type: String },
  created_by:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);

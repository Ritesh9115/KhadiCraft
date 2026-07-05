// src/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  title:      { type: String },
  body:       { type: String },
  images:     [{ type: String }],
  is_approved:{ type: Boolean, default: false },
  admin_reply:{ type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

reviewSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

// One review per user per product
reviewSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

// src/models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  slug:       { type: String, required: true, unique: true, lowercase: true },
  description:{ type: String },
  image:      { type: String },                              // Cloudinary URL
  parent_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  sort_order: { type: Number, default: 0 },
  is_active:  { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id',
});

module.exports = mongoose.model('Category', categorySchema);

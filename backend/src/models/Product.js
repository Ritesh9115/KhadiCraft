// src/models/Product.js
const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
  image_path: { type: String, required: true },   // Cloudinary URL
  is_primary: { type: Boolean, default: false },
  sort_order: { type: Number, default: 0 },
}, { timestamps: true });

const productVariantSchema = new mongoose.Schema({
  size:      { type: String },
  color:     { type: String },
  color_hex: { type: String },
  sku:       { type: String },
  price:     { type: Number },
  stock:     { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  category_id:             { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  fabric_type_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'FabricType' },
  name:                    { type: String, required: true, trim: true },
  slug:                    { type: String, required: true, unique: true, lowercase: true },
  sku:                     { type: String, unique: true, sparse: true },
  short_description:       { type: String },
  description:             { type: String },
  price:                   { type: Number, required: true, min: 0 },
  sale_price:              { type: Number, default: null },
  cost_price:              { type: Number, default: null },
  stock:                   { type: Number, default: 0, min: 0 },
  low_stock_alert:         { type: Number, default: 10 },
  weight:                  { type: Number },
  unit:                    { type: String, default: 'piece' },
  product_type:            { type: String, enum: ['simple', 'variable', 'fabric_meter', 'custom'], default: 'simple' },
  is_active:               { type: Boolean, default: true },
  is_featured:             { type: Boolean, default: false },
  is_custom_available:     { type: Boolean, default: false },
  is_wholesale_available:  { type: Boolean, default: true },
  wholesale_min_qty:       { type: Number, default: 10 },
  wholesale_price:         { type: Number, default: null },
  thumbnail:               { type: String, default: null },   // Cloudinary URL
  tags:                    [{ type: String }],
  views:                   { type: Number, default: 0 },
  meta_title:              { type: String },
  meta_description:        { type: String },
  images:                  [productImageSchema],
  variants:                [productVariantSchema],
  deleted_at:              { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual: effective price
productSchema.virtual('effective_price').get(function () {
  return this.sale_price ?? this.price;
});

// Virtual: is_low_stock
productSchema.virtual('is_low_stock').get(function () {
  return this.stock > 0 && this.stock <= this.low_stock_alert;
});

// Virtual: is_out_of_stock
productSchema.virtual('is_out_of_stock').get(function () {
  return this.stock <= 0;
});

// Soft-delete scope helper (use in queries: { deleted_at: null })
productSchema.statics.active = function () {
  return this.where({ deleted_at: null });
};

module.exports = mongoose.model('Product', productSchema);

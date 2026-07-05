// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label:         { type: String, default: 'Home' },
  full_name:     { type: String, required: true },
  phone:         { type: String, required: true },
  address_line1: { type: String, required: true },
  address_line2: { type: String },
  city:          { type: String, required: true },
  state:         { type: String, required: true },
  pincode:       { type: String, required: true },
  country:       { type: String, default: 'India' },
  is_default:    { type: Boolean, default: false },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:          { type: String, required: true, unique: true, trim: true },
  password:       { type: String, required: true, select: false },
  role:           { type: String, enum: ['customer', 'admin', 'staff', 'tailor'], default: 'customer' },
  avatar:         { type: String, default: null },         // Cloudinary URL
  is_active:      { type: Boolean, default: true },
  email_verified: { type: Boolean, default: false },
  otp:            { type: String, select: false },
  otp_expires_at: { type: Date, select: false },
  preferences:    { type: mongoose.Schema.Types.Mixed, default: {} },
  addresses:      [addressSchema],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isAdmin   = function () { return ['admin', 'staff'].includes(this.role); };
userSchema.methods.isTailor  = function () { return this.role === 'tailor'; };
userSchema.methods.isCustomer= function () { return this.role === 'customer'; };

module.exports = mongoose.model('User', userSchema);

// src/models/WholesaleBuyer.js
const mongoose = require('mongoose');

const wholesaleBuyerSchema = new mongoose.Schema({
  user_id:               { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  business_name:         { type: String, required: true },
  gst_number:            { type: String },
  business_type:         { type: String },
  contact_name:          { type: String },
  email:                 { type: String },
  phone:                 { type: String },
  address:               { type: String },
  city:                  { type: String },
  state:                 { type: String },
  pincode:               { type: String },
  expected_monthly_value:{ type: String },
  products_interested:   [{ type: String }],
  notes:                 { type: String },
  status:                { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  discount_percent:      { type: Number, default: 0 },
  credit_limit:          { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('WholesaleBuyer', wholesaleBuyerSchema);

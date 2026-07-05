// src/models/WholesaleQuote.js
const mongoose = require('mongoose');

const wholesaleQuoteSchema = new mongoose.Schema({
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'WholesaleBuyer' },
  items:       [{ type: mongoose.Schema.Types.Mixed }],
  notes:       { type: String },
  status:      { type: String, enum: ['pending', 'quoted', 'accepted', 'rejected', 'expired'], default: 'pending' },
  quoted_amount: { type: Number },
  valid_until: { type: Date },
  admin_notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('WholesaleQuote', wholesaleQuoteSchema);

// src/controllers/wholesale.controller.js
const WholesaleBuyer = require('../models/WholesaleBuyer');
const WholesaleQuote = require('../models/WholesaleQuote');

// Public: apply without login
exports.apply = async (req, res) => {
  try {
    const { business_name, gst_number, business_type, address, city, state, pincode, name, email, phone, notes, expected_monthly_value, products_interested } = req.body;
    if (!business_name) return res.status(422).json({ success: false, message: 'Business name is required.' });
    if (!email && !phone) return res.status(422).json({ success: false, message: 'Email or phone is required.' });

    await WholesaleBuyer.create({
      business_name, gst_number, business_type, address, city, state, pincode,
      contact_name: name, email, phone, notes, expected_monthly_value,
      products_interested: Array.isArray(products_interested) ? products_interested : [],
      status: 'pending',
    });

    res.json({ success: true, message: 'Wholesale application received. We will contact you within 2 business days.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Authenticated: register as wholesale buyer
exports.register = async (req, res) => {
  try {
    const existing = await WholesaleBuyer.findOne({ user_id: req.user._id });
    if (existing) return res.status(422).json({ success: false, message: 'You have already registered as a wholesale buyer.' });

    const buyer = await WholesaleBuyer.create({ user_id: req.user._id, ...req.body, status: 'pending' });
    res.status(201).json({ success: true, message: 'Wholesale buyer registration submitted.', data: buyer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.status = async (req, res) => {
  try {
    const buyer = await WholesaleBuyer.findOne({ user_id: req.user._id });
    if (!buyer) return res.json({ success: true, data: null });
    res.json({ success: true, data: buyer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.requestQuote = async (req, res) => {
  try {
    const buyer = await WholesaleBuyer.findOne({ user_id: req.user._id });
    const quote = await WholesaleQuote.create({
      user_id: req.user._id,
      buyer_id: buyer?._id,
      items: req.body.items || [],
      notes: req.body.notes,
      status: 'pending',
    });
    res.status(201).json({ success: true, message: 'Quote request submitted.', data: quote });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.myQuotes = async (req, res) => {
  try {
    const quotes = await WholesaleQuote.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: quotes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

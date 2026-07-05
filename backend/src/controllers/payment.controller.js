// src/controllers/payment.controller.js
const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');

// ─── CREATE RAZORPAY ORDER ───────────────────────────────
// Accepts either:
//   { order_id, amount, currency }  — for placing a specific order payment
//   { amount, currency }            — for generic payment (custom orders, etc.)
exports.createOrder = async (req, res) => {
  try {
    const { order_id, currency } = req.body;
    let amount = parseFloat(req.body.amount);

    if (!amount) {
      return res.status(422).json({ success: false, message: 'Amount is required.' });
    }

    // If order_id is given, validate it
    if (order_id) {
      const order = await Order.findOne({ _id: order_id, user_id: req.user._id, payment_status: 'pending' });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found or already paid.' });
      }
      amount = order.total; // Use actual order total, not client-sent amount (security)
    }

    const key = process.env.RAZORPAY_KEY;
    const secret = process.env.RAZORPAY_SECRET;

    if (!key || !secret) {
      return res.status(500).json({ success: false, message: 'Razorpay credentials not configured.' });
    }

    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount:   Math.round(amount * 100), // paise
        currency: currency || 'INR',
        receipt:  order_id ? `rcpt_ord_${order_id}` : `rcpt_${Date.now()}`,
      },
      {
        auth: { username: key, password: secret },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    res.json({
      success: true,
      data: {
        ...response.data,
        key_id: key,        // return key_id so frontend can init Razorpay widget
      },
    });
  } catch (err) {
    console.error('Razorpay error:', err?.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Payment gateway error.', error: err?.response?.data });
  }
};

// ─── VERIFY PAYMENT ──────────────────────────────────────
exports.verify = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature)
      return res.status(422).json({ success: false, message: 'Razorpay payment fields are required.' });

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });

    // Update order if order_id provided
    if (order_id) {
      const order = await Order.findOne({ _id: order_id, user_id: req.user._id });
      if (order) {
        order.payment_status = 'paid';
        order.payment_id     = razorpay_payment_id;
        order.paid_at        = new Date();
        await order.save();
        return res.json({ success: true, message: 'Payment verified successfully.', data: order });
      }
    }

    res.json({ success: true, message: 'Payment verified successfully.', payment_id: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PAYMENT HISTORY ─────────────────────────────────────
exports.history = async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const skip  = (page - 1) * 20;
    const total = await Order.countDocuments({ user_id: req.user._id, payment_status: 'paid' });
    const payments = await Order.find({ user_id: req.user._id, payment_status: 'paid' })
      .select('order_number total payment_method payment_id paid_at createdAt')
      .sort({ paid_at: -1 })
      .skip(skip).limit(20);
    res.json({ success: true, data: { data: payments, total, current_page: page, last_page: Math.ceil(total / 20) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

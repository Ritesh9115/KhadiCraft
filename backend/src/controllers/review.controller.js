// src/controllers/review.controller.js
const Review = require('../models/Review');

exports.productReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId, is_approved: true })
      .populate('user_id', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.store = async (req, res) => {
  try {
    const { product_id, rating, title, order_id } = req.body;
    // Accept both 'review' (frontend field) and 'body' (model field)
    const body = req.body.body || req.body.review || '';

    if (!product_id || !rating) return res.status(422).json({ success: false, message: 'Product and rating are required.' });

    const exists = await Review.findOne({ user_id: req.user._id, product_id });
    if (exists) return res.status(422).json({ success: false, message: 'You have already reviewed this product.' });

    const review = await Review.create({ user_id: req.user._id, product_id, rating, title, body, order_id });
    res.status(201).json({ success: true, message: 'Review submitted. Pending approval.', data: review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    // Whitelist allowed fields — never let user overwrite product_id, user_id, is_approved
    const { rating, title } = req.body;
    const body = req.body.body || req.body.review;
    if (rating !== undefined) review.rating = rating;
    if (title  !== undefined) review.title  = title;
    if (body   !== undefined) review.body   = body;
    review.is_approved = false; // Reset approval on edit

    await review.save();
    res.json({ success: true, message: 'Review updated.', data: review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.destroy = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

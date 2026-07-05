// src/controllers/admin/orders.controller.js
const Order = require('../../models/Order');
const Review = require('../../models/Review');
const Notification = require('../../models/Notification');

const normalizeOrder = (o) => {
  const obj = o.toObject ? o.toObject() : o;
  
  // Legacy frontend mappings
  const mapped = {
    ...obj,
    id: obj._id?.toString(),
    created_at: obj.createdAt,
    updated_at: obj.updatedAt,
    user: obj.user_id, // Map populated user_id to user
    assigned_tailor: obj.assigned_tailor_id, // Map populated tailor
    shipping_charge: obj.shipping_cost,
    gst_amount: obj.tax,
    paid_amount: ['paid', 'partial'].includes(obj.payment_status) ? obj.total : 0,
  };

  // Map shipping address if it exists
  if (obj.shipping_address) {
    mapped.ship_name = obj.shipping_address.full_name || obj.shipping_address.label;
    mapped.ship_phone = obj.shipping_address.phone;
    mapped.ship_address = obj.shipping_address.address_line1 + (obj.shipping_address.address_line2 ? ', ' + obj.shipping_address.address_line2 : '');
    mapped.ship_city = obj.shipping_address.city;
    mapped.ship_state = obj.shipping_address.state;
    mapped.ship_pincode = obj.shipping_address.pincode;
  }

  // Map items: product_id -> product field for frontend compatibility
  if (obj.items) {
    mapped.items = obj.items.map(item => ({
      ...item,
      id: item._id?.toString(),
      product: item.product_id, // populated product object
    }));
  }

  return mapped;
};

exports.index = async (req, res) => {
  try {
    const query = { deleted_at: null };
    if (req.query.search) query.$or = [{ order_number: { $regex: req.query.search, $options: 'i' } }];
    if (req.query.status)         query.status = req.query.status;
    if (req.query.payment_status) query.payment_status = req.query.payment_status;

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const skip = (page-1) * perPage;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user_id', 'name email phone')
      .populate('assigned_tailor_id', 'name phone')
      .sort({ createdAt: -1 }).skip(skip).limit(perPage);
    res.json({ success: true, data: { data: orders.map(normalizeOrder), total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.show = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, deleted_at: null })
      .populate('user_id', 'name email phone')
      .populate('assigned_tailor_id', 'name email phone')
      .populate('items.product_id', 'name thumbnail');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, deleted_at: null });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    order.status = req.body.status;
    if (req.body.status === 'delivered') order.delivered_at = new Date();
    if (req.body.admin_notes) order.admin_notes = req.body.admin_notes;
    await order.save();

    await Notification.create({ user_id: order.user_id, title: 'Order Status Updated', message: `Your order #${order.order_number} status: ${req.body.status}`, type: 'order' });
    res.json({ success: true, message: 'Order status updated.', data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, deleted_at: null });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    order.payment_status = req.body.payment_status;
    if (req.body.payment_status === 'paid') order.paid_at = new Date();
    await order.save();
    res.json({ success: true, message: 'Payment status updated.', data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateTracking = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, deleted_at: null });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const { tracking_number, courier, estimated_delivery } = req.body;
    if (tracking_number)    order.tracking_number = tracking_number;
    if (courier)            order.courier = courier;
    if (estimated_delivery) order.estimated_delivery = estimated_delivery;
    await order.save();
    res.json({ success: true, message: 'Tracking updated.', data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.generateInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, deleted_at: null }).populate('user_id', 'name email phone').populate('items.product_id', 'name thumbnail');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addNote = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, deleted_at: null });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const existing = order.admin_notes ? order.admin_notes + '\n' : '';
    order.admin_notes = existing + `[${new Date().toLocaleDateString('en-IN')}] ${req.body.note}`;
    await order.save();
    res.json({ success: true, message: 'Note added.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.assignTailor = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { assigned_tailor_id: req.body.tailor_id }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: 'Tailor assigned.', data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.saveAdjustments = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { measurements: req.body.adjustments }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: 'Adjustments saved.', data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── REVIEWS (admin) ─────────────────────────────────────
exports.reviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 20;
    const query = {};
    if (req.query.is_approved !== undefined) query.is_approved = req.query.is_approved === 'true';
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query).populate('user_id', 'name email').populate('product_id', 'name').sort({ createdAt: -1 }).skip((page-1)*perPage).limit(perPage);
    res.json({ success: true, data: { data: reviews, total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { is_approved: true }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review approved.', data: review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.replyReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { admin_reply: req.body.reply }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Reply added.', data: review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// src/controllers/admin/customOrders.controller.js
const CustomOrder = require('../../models/CustomOrder');
const Notification = require('../../models/Notification');

const normalizeOrder = (o) => {
  const obj = o.toObject ? o.toObject() : o;
  
  // Legacy frontend mappings
  const mapped = {
    ...obj,
    id: obj._id?.toString(),
    created_at: obj.createdAt,
    updated_at: obj.updatedAt,
    user: obj.user_id,                    // Map populated user_id -> user
    assigned_tailor: obj.assigned_tailor_id, // Map populated tailor
    shipping_charge: obj.shipping_cost || 0,
    gst_amount: obj.tax || 0,
    paid_amount: ['paid', 'partial'].includes(obj.payment_status) ? obj.total : 0,
    // Ensure dates are strings for frontend
    estimated_ready_date: obj.estimated_ready_date ? new Date(obj.estimated_ready_date).toISOString() : null,
    actual_ready_date: obj.actual_ready_date ? new Date(obj.actual_ready_date).toISOString() : null,
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

  return mapped;
};

exports.index = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      // Search by order number (always) + we filter by customer name after population
      query.custom_order_number = { $regex: req.query.search, $options: 'i' };
    }
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const total = await CustomOrder.countDocuments(query);
    const orders = await CustomOrder.find(query)
      .populate('user_id', 'name email phone')
      .populate('assigned_tailor_id', 'name')
      .sort({ createdAt: -1 })
      .skip((page-1)*perPage).limit(perPage);
    res.json({ success: true, data: { data: orders.map(normalizeOrder), total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.show = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id).populate('user_id', 'name email phone').populate('assigned_tailor_id', 'name email').populate('measurement_profile_id');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    order.status = req.body.status;
    await order.save();
    const populated = await CustomOrder.findById(order._id).populate('user_id', 'name email phone').populate('assigned_tailor_id', 'name email');
    await Notification.create({ user_id: order.user_id, title: 'Custom Order Update', message: `Your custom order #${order.custom_order_number} status: ${req.body.status}`, type: 'custom' });
    res.json({ success: true, message: 'Status updated.', data: normalizeOrder(populated) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.assignTailor = async (req, res) => {
  try {
    const order = await CustomOrder.findByIdAndUpdate(req.params.id, { assigned_tailor_id: req.body.tailor_id }, { new: true }).populate('user_id', 'name email phone').populate('assigned_tailor_id', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: 'Tailor assigned.', data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.setPrice = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.final_price !== undefined) updateData.final_price = req.body.final_price;
    if (req.body.price !== undefined) updateData.final_price = req.body.price; // Fallback for old frontend
    if (req.body.estimated_ready_date !== undefined) updateData.estimated_ready_date = req.body.estimated_ready_date;

    const order = await CustomOrder.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('user_id', 'name email phone').populate('assigned_tailor_id', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: 'Price and date set.', data: normalizeOrder(order) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addNote = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const existing = order.admin_notes ? order.admin_notes + '\n' : '';
    order.admin_notes = existing + `[${new Date().toLocaleDateString('en-IN')}] ${req.body.note}`;
    await order.save();
    res.json({ success: true, message: 'Note added.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getStages = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order.stages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

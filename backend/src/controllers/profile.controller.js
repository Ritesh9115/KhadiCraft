// src/controllers/profile.controller.js
const User = require('../models/User');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// ─── SHOW PROFILE ────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Sort addresses: default first
    user.addresses.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE PROFILE ──────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const exists = await User.findOne({ email, _id: { $ne: user._id } });
      if (exists) return res.status(422).json({ success: false, errors: { email: ['Email already taken.'] } });
      user.email = email;
    }
    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ phone, _id: { $ne: user._id } });
      if (exists) return res.status(422).json({ success: false, errors: { phone: ['Phone already taken.'] } });
      user.phone = phone;
    }
    if (name) user.name = name;

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Profile updated successfully.', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPLOAD AVATAR ───────────────────────────────────────
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(422).json({ success: false, message: 'Avatar image is required.' });
    const avatarUrl = req.file.path || req.file.secure_url || req.file.location;
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });
    res.json({ success: true, message: 'Avatar uploaded successfully.', data: { avatar: avatarUrl, avatar_url: avatarUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Helper: normalize address to include id alias ───────
const normalizeAddr = (a) => ({ ...a.toObject(), id: a._id.toString() });

// ─── ADDRESSES ───────────────────────────────────────────
exports.addresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const sorted = [...user.addresses]
      .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
      .map(normalizeAddr);
    res.json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { full_name, phone, address_line1, address_line2, city, state, pincode, is_default, label } = req.body;
    if (!full_name || !phone || !address_line1 || !city || !state || !pincode)
      return res.status(422).json({ success: false, message: 'Required address fields missing.' });

    const user = await User.findById(req.user._id);

    // If setting as default, unset others
    if (is_default) {
      user.addresses.forEach(a => { a.is_default = false; });
    }

    user.addresses.push({ full_name, phone, address_line1, address_line2, city, state, pincode, label: label || 'Home', is_default: !!is_default });
    await user.save({ validateBeforeSave: false });

    const newAddress = user.addresses[user.addresses.length - 1];
    res.status(201).json({ success: true, message: 'Address added successfully.', data: normalizeAddr(newAddress) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });

    if (req.body.is_default) {
      user.addresses.forEach(a => { if (a._id.toString() !== req.params.id) a.is_default = false; });
    }

    Object.assign(address, req.body);
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Address updated successfully.', data: normalizeAddr(address) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });

    // Check active orders using this address
    const activeOrders = await Order.countDocuments({
      user_id: user._id,
      shipping_address_id: req.params.id,
      status: { $in: ['pending', 'confirmed', 'processing'] },
    });
    if (activeOrders > 0)
      return res.status(422).json({ success: false, message: 'Cannot delete address that is being used in active orders.' });

    address.deleteOne();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Address deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });

    user.addresses.forEach(a => { a.is_default = a._id.toString() === req.params.id; });
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Default address updated successfully.', data: normalizeAddr(address) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── NOTIFICATIONS ───────────────────────────────────────
exports.notifications = async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const skip  = (page - 1) * 20;
    const total = await Notification.countDocuments({ user_id: req.user._id });
    const notifs = await Notification.find({ user_id: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(20);
    res.json({ success: true, data: { data: notifs, total, current_page: page, last_page: Math.ceil(total / 20) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
    notif.is_read = true;
    await notif.save();
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user_id: req.user._id, is_read: false }, { is_read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

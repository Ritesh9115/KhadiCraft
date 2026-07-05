// src/controllers/admin/users.controller.js
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

exports.index = async (req, res) => {
  try {
    const query = {};
    if (req.query.role)   query.role = req.query.role;
    if (req.query.search) query.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }];
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page-1)*perPage).limit(perPage);
    res.json({ success: true, data: { data: users, total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.show = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const { name, email, phone, role, is_active } = req.body;
    if (name)        user.name = name;
    if (email)       user.email = email;
    if (phone)       user.phone = phone;
    if (role)        user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'User updated.', data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggle = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.is_active = !user.is_active;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'suspended'}.`, is_active: user.is_active });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.changeRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'Role updated.', data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.destroy = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.tailors = async (req, res) => {
  try {
    const tailors = await User.find({ role: 'tailor', is_active: true }).select('name email phone avatar');
    res.json({ success: true, data: tailors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.staff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'staff'] }, is_active: true }).select('name email phone role');
    res.json({ success: true, data: staff });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

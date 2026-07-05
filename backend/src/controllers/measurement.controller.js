// src/controllers/measurement.controller.js
const MeasurementProfile = require('../models/MeasurementProfile');

exports.index = async (req, res) => {
  try {
    const profiles = await MeasurementProfile.find({ user_id: req.user._id }).sort({ is_default: -1, createdAt: -1 });
    res.json({ success: true, data: profiles });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.store = async (req, res) => {
  try {
    if (!req.body.name) return res.status(422).json({ success: false, message: 'Profile name is required.' });
    const profile = await MeasurementProfile.create({ user_id: req.user._id, ...req.body });
    res.status(201).json({ success: true, message: 'Measurement profile saved.', data: profile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const profile = await MeasurementProfile.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    // Whitelist allowed fields
    const allowed = ['name', 'chest', 'waist', 'hips', 'shoulder', 'shirt_length', 'pant_length', 'sleeve_length', 'neck', 'thigh', 'inseam', 'notes', 'is_default'];
    allowed.forEach(f => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });

    await profile.save();
    res.json({ success: true, message: 'Measurement profile updated.', data: profile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.destroy = async (req, res) => {
  try {
    const profile = await MeasurementProfile.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });
    res.json({ success: true, message: 'Measurement profile deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.setDefault = async (req, res) => {
  try {
    await MeasurementProfile.updateMany({ user_id: req.user._id }, { is_default: false });
    const profile = await MeasurementProfile.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { is_default: true },
      { new: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });
    res.json({ success: true, message: 'Default measurement profile set.', data: profile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// src/controllers/admin/banners.controller.js
const Banner = require('../../models/Banner');

exports.index = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ sort_order: 1 });
    res.json({ success: true, data: banners });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.store = async (req, res) => {
  try {
    if (!req.body.title) return res.status(422).json({ success: false, message: 'Title is required.' });
    if (!req.file && !req.body.image) return res.status(422).json({ success: false, message: 'Banner image is required.' });
    const image = req.file ? (req.file.path || req.file.secure_url || req.file.location) : req.body.image;
    const banner = await Banner.create({ ...req.body, image });
    res.status(201).json({ success: true, message: 'Banner created.', data: banner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.show = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });
    res.json({ success: true, data: banner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });
    if (req.file) req.body.image = req.file.path || req.file.secure_url || req.file.location;
    Object.assign(banner, req.body);
    await banner.save();
    res.json({ success: true, message: 'Banner updated.', data: banner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.destroy = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggle = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });
    banner.is_active = !banner.is_active;
    await banner.save();
    res.json({ success: true, message: `Banner ${banner.is_active ? 'activated' : 'deactivated'}.` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.reorder = async (req, res) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      await Promise.all(items.map(({ id, sort_order }) => Banner.findByIdAndUpdate(id, { sort_order })));
    }
    res.json({ success: true, message: 'Banners reordered.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

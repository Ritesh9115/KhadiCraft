// src/controllers/admin/fabricTypes.controller.js
const FabricType = require('../../models/FabricType');

exports.index = async (req, res) => {
  try {
    const types = await FabricType.find().sort({ name: 1 });
    res.json({ success: true, data: types });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.store = async (req, res) => {
  try {
    if (!req.body.name) return res.status(422).json({ success: false, message: 'Name is required.' });
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const type = await FabricType.create({ name: req.body.name, slug: req.body.slug || slug, description: req.body.description, is_active: req.body.is_active !== false });
    res.status(201).json({ success: true, message: 'Fabric type created.', data: type });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.show = async (req, res) => {
  try {
    const type = await FabricType.findById(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Fabric type not found.' });
    res.json({ success: true, data: type });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const type = await FabricType.findById(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Fabric type not found.' });
    Object.assign(type, req.body);
    await type.save();
    res.json({ success: true, message: 'Fabric type updated.', data: type });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.destroy = async (req, res) => {
  try {
    await FabricType.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Fabric type deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

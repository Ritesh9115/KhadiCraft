// src/controllers/admin/settings.controller.js
const Setting = require('../../models/Setting');

const SETTING_GROUPS = ['general', 'shipping', 'payment', 'email', 'seo', 'social', 'appointment'];

exports.index = async (req, res) => {
  try {
    const query = {};
    if (req.query.group) query.group = req.query.group;
    const settings = await Setting.find(query);
    const data = {};
    settings.forEach(s => { data[s.key] = s.value; });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const { key, value, group } = req.body;
    if (!key) return res.status(422).json({ success: false, message: 'Key is required.' });
    const setting = await Setting.findOneAndUpdate({ key }, { value, group: group || 'general' }, { upsert: true, new: true });
    res.json({ success: true, message: 'Setting saved.', data: setting });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.bulkUpdate = async (req, res) => {
  try {
    const { settings, group } = req.body;
    if (!settings || typeof settings !== 'object') return res.status(422).json({ success: false, message: 'Settings object required.' });
    await Promise.all(Object.entries(settings).map(([key, value]) =>
      Setting.findOneAndUpdate({ key }, { value, group: group || 'general' }, { upsert: true, new: true })
    ));
    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(422).json({ success: false, message: 'Logo image is required.' });
    const url = req.file.path || req.file.secure_url || req.file.location;
    await Setting.findOneAndUpdate({ key: 'logo' }, { value: url, group: 'general' }, { upsert: true });
    res.json({ success: true, message: 'Logo uploaded.', data: { url } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

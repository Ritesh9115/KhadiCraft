// src/routes/settings.routes.js — Public endpoint (also handled in products.controller)
const router = require('express').Router();
const Setting = require('../models/Setting');

router.get('/', async (req, res) => {
  try {
    const publicKeys = [
      'site_name', 'site_tagline', 'site_phone', 'site_email', 'site_address',
      'logo', 'favicon', 'razorpay_key_id', 'free_shipping_threshold',
      'gst_number', 'social_facebook', 'social_instagram', 'social_whatsapp',
    ];
    const settings = await Setting.find({ key: { $in: publicKeys } });
    const data = {};
    settings.forEach(s => { data[s.key] = s.value; });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

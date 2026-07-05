// src/routes/notification.routes.js
const router = require('express').Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const skip  = (page - 1) * 20;
    const total = await Notification.countDocuments({ user_id: req.user._id });
    const notifs= await Notification.find({ user_id: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(20);
    const unread= await Notification.countDocuments({ user_id: req.user._id, is_read: false });
    res.json({ success: true, data: { data: notifs, total, unread_count: unread, current_page: page, last_page: Math.ceil(total / 20) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// IMPORTANT: read-all MUST come before /:id/read to avoid route collision
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ user_id: req.user._id, is_read: false }, { is_read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/read-all', async (req, res) => {  // Laravel uses PUT
  try {
    await Notification.updateMany({ user_id: req.user._id, is_read: false }, { is_read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id/read', async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user_id: req.user._id }, { is_read: true });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/:id/read', async (req, res) => {  // Laravel uses PUT
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user_id: req.user._id }, { is_read: true });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

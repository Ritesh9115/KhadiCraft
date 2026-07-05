// src/routes/profile.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/profile.controller');
const auth = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');

router.use(auth);
router.get('/',                               ctrl.show);
router.put('/',                               ctrl.update);
router.post('/avatar',  uploadAvatar.single('avatar'), ctrl.uploadAvatar);

// Addresses
router.get('/addresses',                      ctrl.addresses);
router.post('/addresses',                     ctrl.addAddress);
router.put('/addresses/:id',                  ctrl.updateAddress);
router.delete('/addresses/:id',               ctrl.deleteAddress);
router.patch('/addresses/:id/default',        ctrl.setDefaultAddress);
router.put('/addresses/:id/default',          ctrl.setDefaultAddress);

// Notifications
router.get('/notifications',                  ctrl.notifications);
router.patch('/notifications/read-all',       ctrl.markAllRead);    // MUST be before /:id/read
router.patch('/notifications/:id/read',       ctrl.markRead);

module.exports = router;

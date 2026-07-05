// src/routes/auth.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

router.post('/register',        ctrl.register);
router.post('/login',           ctrl.login);
router.post('/logout',          auth, ctrl.logout);
router.get('/me',               auth, ctrl.me);
router.post('/send-otp',        ctrl.sendOtp);
router.post('/verify-otp',      ctrl.verifyOtp);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password',  ctrl.resetPassword);

module.exports = router;

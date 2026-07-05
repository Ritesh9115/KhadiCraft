// src/routes/payment.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const auth = require('../middleware/auth');

router.use(auth);
router.post('/create-order', ctrl.createOrder);
router.post('/verify',       ctrl.verify);
router.get('/history',       ctrl.history);

module.exports = router;

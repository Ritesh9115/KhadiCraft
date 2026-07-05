// src/routes/admin/wholesale.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/wholesale.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));

router.get('/wholesale/buyers',                           ctrl.buyers);
router.get('/wholesale/quotes',                           ctrl.quotes);

// Buyer actions
router.patch('/wholesale/buyers/:id/status',              ctrl.updateBuyerStatus);
router.put('/wholesale/buyers/:id/status',                ctrl.updateBuyerStatus);   // Laravel alias
router.patch('/wholesale/buyers/:id/discount',            ctrl.setDiscount);
router.put('/wholesale/buyers/:id/discount',              ctrl.setDiscount);          // Laravel alias

// Quote actions
router.patch('/wholesale/quotes/:id',                     ctrl.updateQuote);
router.put('/wholesale/quotes/:id',                       ctrl.updateQuote);          // Laravel alias
router.get('/wholesale/quotes/:id/invoice',               ctrl.generateInvoice);

module.exports = router;

// src/routes/admin/orders.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/orders.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));
router.get('/orders',                              ctrl.index);
router.get('/orders/:id',                          ctrl.show);
router.patch('/orders/:id/status',                 ctrl.updateStatus);
router.put('/orders/:id/status',                   ctrl.updateStatus);     // Laravel uses PUT
router.patch('/orders/:id/payment-status',         ctrl.updatePaymentStatus);
router.put('/orders/:id/payment-status',           ctrl.updatePaymentStatus); // Laravel uses PUT
router.patch('/orders/:id/tracking',               ctrl.updateTracking);
router.put('/orders/:id/tracking',                 ctrl.updateTracking);   // Laravel uses PUT
router.put('/orders/:id/assign-tailor',            ctrl.assignTailor);
router.put('/orders/:id/adjustments',              ctrl.saveAdjustments);
router.get('/orders/:id/invoice',                  ctrl.generateInvoice);
router.post('/orders/:id/notes',                   ctrl.addNote);

module.exports = router;

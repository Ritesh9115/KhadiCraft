// src/routes/admin/customOrders.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/customOrders.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));
router.get('/custom-orders',                       ctrl.index);
router.get('/custom-orders/:id',                   ctrl.show);
router.patch('/custom-orders/:id/status',          ctrl.updateStatus);
router.put('/custom-orders/:id/status',            ctrl.updateStatus);      // Laravel PUT
router.patch('/custom-orders/:id/assign-tailor',   ctrl.assignTailor);
router.put('/custom-orders/:id/assign',            ctrl.assignTailor);      // Laravel PUT /assign
router.patch('/custom-orders/:id/price',           ctrl.setPrice);
router.put('/custom-orders/:id/price',             ctrl.setPrice);         // Laravel PUT
router.post('/custom-orders/:id/notes',            ctrl.addNote);
router.get('/custom-orders/:id/stages',            ctrl.getStages);

module.exports = router;

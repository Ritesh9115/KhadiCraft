// src/routes/tailor.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/tailor.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth, role('tailor', 'admin'));

router.get('/dashboard',                      ctrl.dashboard);
router.get('/assigned-orders',                ctrl.assignedOrders);
router.get('/workload',                       ctrl.workload);
router.get('/orders/:id',                     ctrl.orderDetail);
router.patch('/orders/:id/stage',             ctrl.updateStage);
router.put('/orders/:id/stage',               ctrl.updateStage);
router.post('/orders/:id/notes',              ctrl.addNote);

module.exports = router;

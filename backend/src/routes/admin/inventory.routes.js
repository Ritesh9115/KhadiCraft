// src/routes/admin/inventory.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/inventory.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));

router.get('/inventory',                      ctrl.index);
router.get('/inventory/low-stock',            ctrl.lowStock);
router.post('/inventory/adjust',              ctrl.adjust);
router.get('/inventory/logs',                 ctrl.logs);
router.get('/inventory/logs/:productId',      ctrl.productLogs);

module.exports = router;

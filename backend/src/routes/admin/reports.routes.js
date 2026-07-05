// src/routes/admin/reports.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/reports.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));

router.get('/reports/sales',                  ctrl.sales);
router.get('/reports/orders',                 ctrl.orders);
router.get('/reports/products',               ctrl.products);
router.get('/reports/customers',              ctrl.customers);
router.get('/reports/inventory',              ctrl.inventory);
router.get('/reports/custom-orders',          ctrl.customOrders);
router.get('/reports/tailor-performance',     ctrl.tailorPerformance);
router.get('/reports/export',                 ctrl.export);

module.exports = router;

// src/routes/admin/dashboard.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/dashboard.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));
router.get('/dashboard', ctrl.index);
router.get('/dashboard/stats', ctrl.stats);

module.exports = router;

// src/routes/admin/users.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/users.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));

// These match Laravel: /admin/tailors and /admin/staff
router.get('/tailors',                        ctrl.tailors);
router.get('/staff',                          ctrl.staff);

// User CRUD
router.get('/users',                          ctrl.index);
router.get('/users/:id',                      ctrl.show);
router.put('/users/:id',                      ctrl.update);
router.patch('/users/:id/toggle',             ctrl.toggle);
router.put('/users/:id/toggle',               ctrl.toggle);   // Laravel uses PUT
router.patch('/users/:id/role',               ctrl.changeRole);
router.put('/users/:id/role',                 ctrl.changeRole); // Laravel uses PUT
router.delete('/users/:id',                   ctrl.destroy);

module.exports = router;

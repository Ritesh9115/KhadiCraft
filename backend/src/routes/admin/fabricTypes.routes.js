// src/routes/admin/fabricTypes.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/fabricTypes.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));

router.get('/fabric-types',                   ctrl.index);
router.post('/fabric-types',                  ctrl.store);
router.get('/fabric-types/:id',               ctrl.show);
router.put('/fabric-types/:id',               ctrl.update);
router.delete('/fabric-types/:id',            ctrl.destroy);

module.exports = router;

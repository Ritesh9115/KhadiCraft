// src/routes/measurement.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/measurement.controller');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/',                               ctrl.index);
router.post('/',                              ctrl.store);
router.put('/:id',                            ctrl.update);
router.delete('/:id',                         ctrl.destroy);
router.patch('/:id/default',                  ctrl.setDefault);

module.exports = router;

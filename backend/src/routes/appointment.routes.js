// src/routes/appointment.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/appointment.controller');
const auth = require('../middleware/auth');

router.get('/slots',                          ctrl.availableSlots);  // Public (no auth)
router.use(auth);
router.get('/',                               ctrl.index);
router.post('/',                              ctrl.store);
router.get('/:id',                            ctrl.show);
router.patch('/:id/cancel',                   ctrl.cancel);
router.patch('/:id/reschedule',               ctrl.reschedule);

module.exports = router;

// src/routes/order.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/',                              ctrl.index);
router.post('/',                             ctrl.store);
router.get('/:orderNumber/track',            ctrl.track);
router.get('/track/:orderNumber',            ctrl.track); // keeping old just in case
router.get('/:id/invoice',                   ctrl.invoice);
router.get('/invoice/:id',                   ctrl.invoice); // keeping old just in case
router.get('/:orderNumber',                  ctrl.show);
router.patch('/:id/cancel',                  ctrl.cancel);
router.post('/:id/cancel',                   ctrl.cancel); // Frontend uses POST

module.exports = router;

// src/routes/review.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/review.controller');
const auth = require('../middleware/auth');

router.get('/products/:productId', ctrl.productReviews);
router.use(auth);
router.post('/',       ctrl.store);
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.destroy);

module.exports = router;

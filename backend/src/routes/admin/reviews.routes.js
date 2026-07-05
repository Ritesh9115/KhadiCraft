// src/routes/admin/reviews.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/orders.controller'); // Reviews are in orders controller
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));

router.get('/reviews',                        ctrl.reviews);
router.patch('/reviews/:id/approve',          ctrl.approveReview);
router.put('/reviews/:id/approve',            ctrl.approveReview); // Frontend uses PUT
router.post('/reviews/:id/reply',             ctrl.replyReview);
router.put('/reviews/:id/reply',              ctrl.replyReview);   // Frontend uses PUT
router.delete('/reviews/:id',                 ctrl.deleteReview);

module.exports = router;

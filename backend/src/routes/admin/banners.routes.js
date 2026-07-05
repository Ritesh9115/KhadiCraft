// src/routes/admin/banners.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/banners.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { uploadBanner } = require('../../config/cloudinary');

router.use(auth, role('admin', 'staff'));

router.get('/banners',                        ctrl.index);
router.post('/banners', uploadBanner.single('image'), ctrl.store);
router.get('/banners/:id',                    ctrl.show);
router.put('/banners/:id', uploadBanner.single('image'), ctrl.update);
router.delete('/banners/:id',                 ctrl.destroy);
router.patch('/banners/:id/toggle',           ctrl.toggle);
router.post('/banners/reorder',               ctrl.reorder);

module.exports = router;

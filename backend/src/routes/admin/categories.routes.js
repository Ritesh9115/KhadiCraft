// src/routes/admin/categories.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/categories.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { uploadCategory } = require('../../config/cloudinary');

router.use(auth, role('admin', 'staff'));
router.get('/categories',                       ctrl.index);
router.post('/categories', uploadCategory.single('image'), ctrl.store);
router.get('/categories/:id',                   ctrl.show);
router.put('/categories/:id', uploadCategory.single('image'), ctrl.update);
router.delete('/categories/:id',                ctrl.destroy);
router.patch('/categories/:id/toggle',          ctrl.toggle);
router.put('/categories/:id/toggle',            ctrl.toggle); // Laravel alias
router.post('/categories/reorder',              ctrl.reorder);

module.exports = router;

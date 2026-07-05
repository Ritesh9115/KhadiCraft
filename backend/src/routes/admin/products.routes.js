// src/routes/admin/products.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/products.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { uploadProduct } = require('../../config/cloudinary');

router.use(auth, role('admin', 'staff'));
router.get('/products',                       ctrl.index);
router.post('/products', uploadProduct.single('thumbnail'), ctrl.store);
router.get('/products/:id',                   ctrl.show);
router.put('/products/:id', uploadProduct.single('thumbnail'), ctrl.update);
router.delete('/products/:id',                ctrl.destroy);
router.post('/products/:id/images', uploadProduct.array('images', 10), ctrl.uploadImages);
router.delete('/products/:id/images/:imgId',  ctrl.deleteImage);
router.patch('/products/:id/stock',           ctrl.updateStock);
router.put('/products/:id/stock',             ctrl.updateStock);
router.patch('/products/:id/toggle',          ctrl.toggle);
router.put('/products/:id/toggle',            ctrl.toggle);
router.patch('/products/:id/toggle-featured', ctrl.toggleFeatured);
router.put('/products/:id/toggle-featured',   ctrl.toggleFeatured);
router.post('/products/bulk-action',          ctrl.bulkAction);
// Variants
router.post('/products/:id/variants',         ctrl.addVariant);
router.put('/products/:id/variants/:vid',     ctrl.updateVariant);
router.delete('/products/:id/variants/:vid',  ctrl.deleteVariant);

module.exports = router;

// src/routes/customOrder.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/customOrder.controller');
const auth = require('../middleware/auth');
const { uploadCustom } = require('../config/cloudinary');

router.use(auth);
router.get('/',                               ctrl.index);
router.post('/',    uploadCustom.array('reference_images', 5), ctrl.store);
router.get('/:number',                        ctrl.show);
router.patch('/:id/cancel',                   ctrl.cancel);
router.post('/:id/cancel',                    ctrl.cancel); // Frontend uses POST
router.post('/:id/reference-images', uploadCustom.array('images', 5), ctrl.uploadReference);
router.post('/:id/upload-reference', uploadCustom.array('images', 5), ctrl.uploadReference); // Frontend uses upload-reference

module.exports = router;

// src/routes/product.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/product.controller');

// Products
router.get('/products',                           ctrl.index);
router.get('/products/:slug',                     ctrl.show);
// Categories
router.get('/categories',                         ctrl.categories);
router.get('/categories/:slug',                   ctrl.categoryProducts); // Laravel: /categories/{slug}
// Fabric types
router.get('/fabric-types',                       ctrl.fabricTypes);
// Banners
router.get('/banners',                            ctrl.publicBanners);
// Public settings — two aliases (both in use by frontend)
router.get('/settings/public',                    ctrl.publicSettings);
router.get('/settings',                           ctrl.publicSettings);

module.exports = router;

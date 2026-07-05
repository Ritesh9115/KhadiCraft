// src/routes/admin/settings.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/settings.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { uploadSettings } = require('../../config/cloudinary');

router.use(auth, role('admin', 'staff'));

router.get('/settings',                       ctrl.index);
router.post('/settings',                      ctrl.update);    // single key/value
router.put('/settings',                       ctrl.bulkUpdate); // Laravel: PUT /admin/settings (bulk)
router.post('/settings/bulk',                 ctrl.bulkUpdate);
router.post('/settings/logo',   uploadSettings.single('logo'), ctrl.uploadLogo);
router.post('/settings/upload', uploadSettings.single('file'), ctrl.uploadLogo); // Laravel alias

module.exports = router;

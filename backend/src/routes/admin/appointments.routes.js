// src/routes/admin/appointments.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/appointments.controller');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth, role('admin', 'staff'));

// IMPORTANT: specific paths before /:id wildcard
router.get('/appointments/calendar',              ctrl.calendar);
router.get('/appointments',                       ctrl.index);
router.get('/appointments/:id',                   ctrl.show);
router.patch('/appointments/:id/status',          ctrl.updateStatus);
router.put('/appointments/:id/status',            ctrl.updateStatus);    // Laravel PUT
router.patch('/appointments/:id/assign-staff',    ctrl.assignStaff);
router.put('/appointments/:id/assign',            ctrl.assignStaff);     // Laravel: PUT /assign
router.post('/appointments/:id/notes',            ctrl.addNote);

// Time slots — Laravel: /admin/time-slots
router.get('/time-slots',                         ctrl.timeSlots);
router.post('/time-slots',                        ctrl.createSlot);
router.put('/time-slots/:id',                     ctrl.updateSlot);
router.delete('/time-slots/:id',                  ctrl.deleteSlot);

module.exports = router;


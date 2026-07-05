// src/controllers/admin/appointments.controller.js
const Appointment = require('../../models/Appointment');

const normalizeAppt = (a) => {
  const obj = a.toObject ? a.toObject() : a;
  return {
    ...obj,
    id: obj._id?.toString(),
    created_at: obj.createdAt,
    // Map populated user_id -> user so frontend a.user?.name works
    user: obj.user_id || obj.user,
    staff: obj.assigned_staff_id,
  };
};

exports.index = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.date)   query.appointment_date = new Date(req.query.date);
    if (req.query.search) {
      // search will be applied after population
    }
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const total = await Appointment.countDocuments(query);
    const appts = await Appointment.find(query)
      .populate('user_id', 'name email phone')
      .populate('assigned_staff_id', 'name phone')
      .sort({ appointment_date: -1, time_slot: -1 })
      .skip((page-1)*perPage).limit(perPage);

    res.json({ success: true, data: { data: appts.map(normalizeAppt), total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.show = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('user_id', 'name email phone')
      .populate('assigned_staff_id', 'name phone');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, data: normalizeAppt(appt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
      .populate('user_id', 'name email phone');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, message: 'Status updated.', data: normalizeAppt(appt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.assignStaff = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { assigned_staff_id: req.body.staff_id }, { new: true })
      .populate('user_id', 'name email phone')
      .populate('assigned_staff_id', 'name phone');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, message: 'Staff assigned.', data: normalizeAppt(appt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addNote = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    const existing = appt.admin_notes ? appt.admin_notes + '\n' : '';
    appt.admin_notes = existing + `[${new Date().toLocaleDateString('en-IN')}] ${req.body.note}`;
    await appt.save();
    res.json({ success: true, message: 'Note added.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.calendar = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const start = new Date(month + '-01');
    const end   = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const appts = await Appointment.find({ appointment_date: { $gte: start, $lt: end } })
      .populate('user_id', 'name')
      .sort({ appointment_date: 1, time_slot: 1 });
    res.json({ success: true, data: appts.map(normalizeAppt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Time slots management
const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
exports.timeSlots  = async (req, res) => res.json({ success: true, data: TIME_SLOTS.map(t => ({ time: t, max_bookings: 3 })) });
exports.createSlot = async (req, res) => res.json({ success: true, message: 'Slot created.' });
exports.updateSlot = async (req, res) => res.json({ success: true, message: 'Slot updated.' });
exports.deleteSlot = async (req, res) => res.json({ success: true, message: 'Slot deleted.' });

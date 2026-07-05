// src/controllers/appointment.controller.js
const Appointment = require('../models/Appointment');

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

// ─── LIST ────────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const query = { user_id: req.user._id };
    if (req.query.status) query.status = req.query.status;
    if (req.query.type)   query.type   = req.query.type;

    const page  = parseInt(req.query.page) || 1;
    const skip  = (page - 1) * 10;
    const total = await Appointment.countDocuments(query);
    const appts = await Appointment.find(query).sort({ createdAt: -1 }).skip(skip).limit(10);

    res.json({ success: true, data: { data: appts, total, current_page: page, last_page: Math.ceil(total / 10) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── BOOK ────────────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const { type, appointment_date, time_slot, purpose, notes } = req.body;

    if (!type || !appointment_date || !time_slot || !purpose)
      return res.status(422).json({ success: false, message: 'Type, date, time slot and purpose are required.' });

    // Check slot availability (max 3 per slot)
    const count = await Appointment.countDocuments({
      appointment_date: new Date(appointment_date),
      time_slot,
      status: { $ne: 'cancelled' },
    });

    if (count >= 3)
      return res.status(422).json({ success: false, message: 'This time slot is not available. Please choose another time.' });

    const appt = await Appointment.create({
      user_id: req.user._id,
      type,
      appointment_date: new Date(appointment_date),
      time_slot,
      purpose,
      notes,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully.', data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SHOW ────────────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CANCEL ──────────────────────────────────────────────
exports.cancel = async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    if (!['pending', 'confirmed'].includes(appt.status))
      return res.status(422).json({ success: false, message: 'Appointment cannot be cancelled at this stage.' });

    // Check 24-hour rule
    const apptTime = new Date(appt.appointment_date);
    const hoursUntil = (apptTime - new Date()) / 36e5;
    if (hoursUntil < 24)
      return res.status(422).json({ success: false, message: 'Appointments must be cancelled at least 24 hours in advance.' });

    appt.status = 'cancelled';
    await appt.save();

    res.json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESCHEDULE ──────────────────────────────────────────
exports.reschedule = async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    if (!['pending', 'confirmed'].includes(appt.status))
      return res.status(422).json({ success: false, message: 'Appointment cannot be rescheduled at this stage.' });

    const { appointment_date, time_slot } = req.body;

    const count = await Appointment.countDocuments({
      appointment_date: new Date(appointment_date),
      time_slot,
      status: { $ne: 'cancelled' },
      _id: { $ne: appt._id },
    });

    if (count >= 3)
      return res.status(422).json({ success: false, message: 'This time slot is not available. Please choose another time.' });

    appt.appointment_date = new Date(appointment_date);
    appt.time_slot = time_slot;
    appt.status = 'pending';
    await appt.save();

    res.json({ success: true, message: 'Appointment rescheduled successfully.', data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── AVAILABLE SLOTS ─────────────────────────────────────
exports.availableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(422).json({ success: false, message: 'Date is required.' });

    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    const currentTime = new Date().toTimeString().slice(0, 5);

    const slots = await Promise.all(TIME_SLOTS.map(async (slot) => {
      if (isToday && slot <= currentTime) {
        return { time: slot, available: false, booked_count: 3, max_bookings: 3 };
      }
      const bookedCount = await Appointment.countDocuments({
        appointment_date: new Date(date),
        time_slot: slot,
        status: { $ne: 'cancelled' },
      });
      return { time: slot, available: bookedCount < 3, booked_count: bookedCount, max_bookings: 3 };
    }));

    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

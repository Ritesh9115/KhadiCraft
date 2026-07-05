// src/controllers/tailor.controller.js
const CustomOrder = require('../models/CustomOrder');
const Notification = require('../models/Notification');

const STAGE_ORDER = [
  'pending', 'confirmed', 'fabric_selected',
  'measurement_received', 'cutting', 'stitching',
  'finishing', 'quality_check', 'ready', 'dispatched', 'delivered'
];

const stageLabel = (stage) => ({
  pending:               'Order Pending',
  confirmed:             'Order Confirmed',
  fabric_selected:       'Fabric Selected',
  measurement_received:  'Measurements Received',
  cutting:               'Cutting',
  stitching:             'Stitching',
  finishing:             'Finishing',
  quality_check:         'Quality Check',
  ready:                 'Ready for Dispatch',
  dispatched:            'Dispatched',
  delivered:             'Delivered',
}[stage] || stage.replace('_', ' '));

const getNextStage = (current) => {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
};

// ─── DASHBOARD ───────────────────────────────────────────
exports.dashboard = async (req, res) => {
  try {
    const tailorId = req.user._id;
    const orders = await CustomOrder.find({ assigned_tailor_id: tailorId }).populate('user_id', 'name email phone');

    const inProgressStatuses = ['fabric_selected', 'measurement_received', 'cutting', 'stitching', 'finishing', 'quality_check'];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const delayed = orders.filter(o =>
      o.estimated_ready_date && new Date(o.estimated_ready_date) < now &&
      !['ready', 'delivered', 'cancelled'].includes(o.status)
    );

    const dueToday = orders.filter(o => {
      if (!o.estimated_ready_date) return false;
      const d = new Date(o.estimated_ready_date);
      return d.toDateString() === now.toDateString() && !['delivered', 'cancelled'].includes(o.status);
    });

    const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

    const normaliseOrder = (o) => {
      const obj = o.toObject ? o.toObject() : o;
      return {
        ...obj,
        id: obj._id?.toString(),
        created_at: obj.createdAt,
        user: obj.user_id,   // populated object { name, email, phone }
        estimated_ready_date: obj.estimated_ready_date ? new Date(obj.estimated_ready_date).toISOString() : null,
      };
    };

    res.json({
      success: true,
      data: {
        total:           orders.length,
        active:          active.length,
        in_progress:     orders.filter(o => inProgressStatuses.includes(o.status)).length,
        ready_today:     orders.filter(o => o.status === 'ready').length,
        due_today:       dueToday.length,
        delayed:         delayed.length,
        completed_month: orders.filter(o => o.status === 'delivered' && new Date(o.updatedAt) >= startOfMonth).length,
        orders:          active.map(normaliseOrder),
        delayed_orders:  delayed.map(normaliseOrder),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ASSIGNED ORDERS ─────────────────────────────────────
exports.assignedOrders = async (req, res) => {
  try {
    const query = {
      assigned_tailor_id: req.user._id,
      status: { $nin: ['delivered', 'cancelled'] }
    };
    if (req.query.status) query.status = req.query.status;

    const statusOrder = { cutting: 1, stitching: 2, finishing: 3, quality_check: 4, ready: 5, fabric_selected: 6, measurement_received: 7, confirmed: 8 };
    const orders = await CustomOrder.find(query).populate('user_id', 'name email phone');
    orders.sort((a, b) => (statusOrder[a.status] || 9) - (statusOrder[b.status] || 9));

    const normalised = orders.map(o => {
      const obj = o.toObject();
      return {
        ...obj,
        id: obj._id?.toString(),
        created_at: obj.createdAt,
        user: obj.user_id,           // frontend reads o.user?.name
        assigned_tailor: obj.assigned_tailor_id,
        estimated_ready_date: obj.estimated_ready_date ? new Date(obj.estimated_ready_date).toISOString() : null,
      };
    });

    res.json({ success: true, data: normalised });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ORDER DETAIL ────────────────────────────────────────
exports.orderDetail = async (req, res) => {
  try {
    const order = await CustomOrder.findOne({ _id: req.params.id, assigned_tailor_id: req.user._id })
      .populate('user_id', 'name email phone')
      .populate('measurement_profile_id');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const completedStages = {};
    order.stages.forEach(s => { completedStages[s.stage] = s; });
    const currentIdx = STAGE_ORDER.indexOf(order.status);

    const stageProgress = STAGE_ORDER.map((stage, idx) => ({
      stage,
      label:        stageLabel(stage),
      status:       completedStages[stage]?.status || 'pending',
      is_current:   stage === order.status,
      is_done:      idx < currentIdx,
      completed_at: completedStages[stage]?.completed_at || null,
      notes:        completedStages[stage]?.notes || null,
    }));

    // Normalise response so frontend can read order.user?.name
    const obj = order.toObject();
    const normalised = {
      ...obj,
      id: obj._id?.toString(),
      created_at: obj.createdAt,
      user: obj.user_id,           // populated: { name, email, phone }
      assigned_tailor: obj.assigned_tailor_id,
      estimated_ready_date: obj.estimated_ready_date ? new Date(obj.estimated_ready_date).toISOString() : null,
      actual_ready_date: obj.actual_ready_date ? new Date(obj.actual_ready_date).toISOString() : null,
    };

    res.json({ success: true, data: normalised, stage_progress: stageProgress, next_stage: getNextStage(order.status) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE STAGE ────────────────────────────────────────
exports.updateStage = async (req, res) => {
  try {
    const { stage, notes } = req.body;
    if (!stage || !STAGE_ORDER.includes(stage))
      return res.status(422).json({ success: false, message: 'Invalid stage.' });

    const order = await CustomOrder.findOne({ _id: req.params.id, assigned_tailor_id: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const currentIdx = STAGE_ORDER.indexOf(order.status);
    const newIdx     = STAGE_ORDER.indexOf(stage);
    if (newIdx < currentIdx)
      return res.status(422).json({ success: false, message: 'Cannot go back to a previous stage. Contact admin if needed.' });

    const old = order.status;
    order.status = stage;

    // Update or create stage log
    const existingStageIdx = order.stages.findIndex(s => s.stage === stage);
    if (existingStageIdx >= 0) {
      order.stages[existingStageIdx].status = 'completed';
      order.stages[existingStageIdx].completed_at = new Date();
      order.stages[existingStageIdx].notes = notes;
    } else {
      order.stages.push({ stage, status: 'completed', completed_at: new Date(), notes });
    }

    if (stage === 'ready') order.actual_ready_date = new Date();
    await order.save();

    // Notify customer
    const stageMessages = {
      cutting:       'Your order is now in the cutting stage. Our tailor has started working on your garment! ✂️',
      stitching:     'Stitching has begun on your custom order! 🧵',
      finishing:     'Your garment is in the finishing stage — almost done! 🎨',
      quality_check: 'Your order is undergoing quality check to ensure perfect fit and finish! ✅',
      ready:         'Great news! Your custom order is READY! We will dispatch it soon. 🎉',
    };

    if (stageMessages[stage]) {
      await Notification.create({
        user_id:    order.user_id,
        title:      `Custom Order Update — ${stageLabel(stage)}`,
        message:    `${stageMessages[stage]} Order: #${order.custom_order_number}`,
        type:       'custom',
        action_url: `/account/custom-orders/${order.custom_order_number}`,
      });
    }

    res.json({
      success:    true,
      message:    `Stage updated: ${stageLabel(old)} → ${stageLabel(stage)}`,
      old_stage:  old,
      new_stage:  stage,
      next_stage: getNextStage(stage),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADD NOTE ────────────────────────────────────────────
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(422).json({ success: false, message: 'Note is required.' });

    const order = await CustomOrder.findOne({ _id: req.params.id, assigned_tailor_id: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const timestamp = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const existing = order.tailor_notes ? order.tailor_notes + '\n\n' : '';
    order.tailor_notes = `${existing}[${timestamp}] ${note}`;
    await order.save();

    res.json({ success: true, message: 'Note saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── WORKLOAD ────────────────────────────────────────────
exports.workload = async (req, res) => {
  try {
    const tailorId = req.user._id;
    const orders = await CustomOrder.find({ assigned_tailor_id: tailorId });
    const byStatus = {};
    orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const completedThisMonth = orders.filter(o => o.status === 'delivered' && new Date(o.updatedAt) >= startOfMonth).length;

    res.json({ success: true, data: { by_status: byStatus, completed_this_month: completedThisMonth } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

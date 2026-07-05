// src/controllers/customOrder.controller.js
const CustomOrder = require('../models/CustomOrder');

const MEASURE_FIELDS = ['chest','waist','hips','shoulder','shirt_length','pant_length','sleeve_length','neck','thigh','inseam'];

const STAGE_LABELS = {
  pending:               { label: 'Order Pending',         description: 'Your order has been received and is under review.' },
  confirmed:             { label: 'Order Confirmed',        description: 'Your order has been confirmed and is being processed.' },
  fabric_selected:       { label: 'Fabric Selected',        description: 'Fabric has been selected for your order.' },
  measurement_received:  { label: 'Measurements Received',  description: 'Your measurements have been received and verified.' },
  cutting:               { label: 'Cutting',                description: 'Your garment is being cut according to measurements.' },
  stitching:             { label: 'Stitching',              description: 'Your garment is being stitched.' },
  finishing:             { label: 'Finishing',              description: 'Final finishing touches are being applied.' },
  quality_check:         { label: 'Quality Check',          description: 'Your garment is undergoing quality inspection.' },
  ready:                 { label: 'Ready for Dispatch',     description: 'Your garment is ready and will be dispatched soon.' },
  dispatched:            { label: 'Dispatched',             description: 'Your order has been dispatched.' },
  delivered:             { label: 'Delivered',              description: 'Your order has been delivered successfully.' },
};

// ─── LIST ────────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const query = { user_id: req.user._id };
    if (req.query.status) query.status = req.query.status;

    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 10;
    const total = await CustomOrder.countDocuments(query);
    const orders = await CustomOrder.find(query)
      .populate('assigned_tailor_id', 'name')
      .sort({ createdAt: -1 }).skip(skip).limit(10);

    // Normalise for frontend
    const normalised = orders.map(o => {
      const obj = o.toObject();
      return {
        ...obj,
        id: obj._id?.toString(),
        created_at: obj.createdAt,
        updated_at: obj.updatedAt,
        assigned_tailor: obj.assigned_tailor_id,
        estimated_ready_date: obj.estimated_ready_date ? new Date(obj.estimated_ready_date).toISOString() : null,
      };
    });

    res.json({ success: true, data: { data: normalised, total, current_page: page, last_page: Math.ceil(total / 10) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STORE ───────────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const { style_type } = req.body;
    if (!style_type) return res.status(422).json({ success: false, message: 'Style type is required.' });

    const orderNumber = 'CUST-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

    // Build measurements object
    const measurementsJson = {};
    MEASURE_FIELDS.forEach(f => {
      if (req.body[f] !== undefined && req.body[f] !== '') measurementsJson[f] = parseFloat(req.body[f]);
    });

    // Handle uploaded reference images (Cloudinary URLs from multer)
    let referenceImages = [];
    if (req.files && req.files.length > 0) {
      referenceImages = req.files.map(f => ({
        path: f.path || f.secure_url || f.location,
        original_name: f.originalname,
        uploaded_at: new Date().toISOString(),
      }));
    }

    const orderData = {
      user_id: req.user._id,
      custom_order_number: orderNumber,
      style_type,
      fabric_product_id:    req.body.fabric_product_id || null,
      fabric_name:          req.body.fabric_name,
      fabric_preference:    req.body.fabric_preference,
      measurement_profile_id: req.body.measurement_profile_id || null,
      measurements:         Object.keys(measurementsJson).length > 0 ? measurementsJson : null,
      special_instructions: req.body.special_instructions,
      notes:                req.body.notes,
      estimated_ready_date: req.body.estimated_ready_date || null,
      status: 'pending',
      reference_images: referenceImages,
      stages: [{ stage: 'pending', status: 'completed', completed_at: new Date(), notes: 'Order placed successfully' }],
    };

    // Individual measurement fields
    MEASURE_FIELDS.forEach(f => {
      if (req.body[f]) orderData[f] = parseFloat(req.body[f]);
    });

    const order = await CustomOrder.create(orderData);

    res.status(201).json({ success: true, message: 'Custom order placed successfully.', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SHOW ────────────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const order = await CustomOrder.findOne({ user_id: req.user._id, custom_order_number: req.params.number })
      .populate('assigned_tailor_id', 'name email phone')
      .populate('measurement_profile_id');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const obj = order.toObject();
    const data = {
      ...obj,
      id: obj._id?.toString(),
      created_at: obj.createdAt,
      updated_at: obj.updatedAt,
      assigned_tailor: obj.assigned_tailor_id, // frontend uses order.assigned_tailor?.name
      estimated_ready_date: obj.estimated_ready_date ? new Date(obj.estimated_ready_date).toISOString() : null,
      actual_ready_date: obj.actual_ready_date ? new Date(obj.actual_ready_date).toISOString() : null,
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CANCEL ──────────────────────────────────────────────
exports.cancel = async (req, res) => {
  try {
    const order = await CustomOrder.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (!['pending', 'confirmed'].includes(order.status))
      return res.status(422).json({ success: false, message: 'Order cannot be cancelled at this stage.' });

    order.status = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Custom order cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPLOAD REFERENCE ────────────────────────────────────
exports.uploadReference = async (req, res) => {
  try {
    const order = await CustomOrder.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (!['pending', 'confirmed', 'fabric_selected'].includes(order.status))
      return res.status(422).json({ success: false, message: 'Reference images cannot be uploaded at this stage.' });

    if (!req.files || req.files.length === 0)
      return res.status(422).json({ success: false, message: 'Please upload at least one image.' });

    const newImages = req.files.map(f => ({
      path: f.path || f.secure_url || f.location,
      original_name: f.originalname,
      uploaded_at: new Date().toISOString(),
    }));

    const existing = Array.isArray(order.reference_images) ? order.reference_images : [];
    order.reference_images = [...existing, ...newImages];
    await order.save();

    res.json({ success: true, message: 'Reference images uploaded successfully.', data: newImages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

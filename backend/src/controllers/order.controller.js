// src/controllers/order.controller.js
const Order = require('../models/Order');
const Product = require('../models/Product');

const calculateShipping = (subtotal) => subtotal >= 999 ? 0 : 50;

const getOrderTimeline = (order) => {
  const statuses = ['pending', 'confirmed', 'processing', 'ready', 'dispatched', 'delivered'];
  const labels = {
    pending:    { title: 'Order Placed',         desc: 'Your order has been received.' },
    confirmed:  { title: 'Order Confirmed',      desc: 'Your order has been confirmed and is being processed.' },
    processing: { title: 'Processing',           desc: 'Your order is being prepared for shipment.' },
    ready:      { title: 'Ready for Dispatch',   desc: 'Your order is ready and will be dispatched soon.' },
    dispatched: { title: 'Dispatched',           desc: `Your order has been dispatched via ${order.courier || 'courier'}.` },
    delivered:  { title: 'Delivered',            desc: 'Your order has been delivered successfully.' },
    cancelled:  { title: 'Order Cancelled',      desc: 'Your order has been cancelled.' },
  };

  const currentIdx = statuses.indexOf(order.status);
  const timeline = [];

  if (order.status === 'cancelled') {
    timeline.push({ status: 'pending', title: 'Order Placed', description: 'Your order was received.', is_completed: true, completed_at: order.createdAt });
    timeline.push({ status: 'cancelled', title: 'Order Cancelled', description: 'Your order has been cancelled.', is_completed: true, completed_at: order.updatedAt });
    return timeline;
  }

  statuses.forEach((s, idx) => {
    const info = labels[s];
    if (idx <= currentIdx) {
      timeline.push({ status: s, title: info.title, description: info.desc, is_completed: true, completed_at: order.updatedAt });
    }
  });

  return timeline;
};

// ─── LIST ORDERS ─────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const query = { user_id: req.user._id, deleted_at: null };
    if (req.query.status) query.status = req.query.status;

    const page    = parseInt(req.query.page) || 1;
    const perPage = 10;
    const skip    = (page - 1) * perPage;
    const total   = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip).limit(perPage);

    // Normalise: map _id -> id, createdAt -> created_at for frontend
    const normalised = orders.map(o => {
      const obj = o.toObject();
      return {
        ...obj,
        id: obj._id?.toString(),
        created_at: obj.createdAt,
        updated_at: obj.updatedAt,
        items: (obj.items || []).map(item => ({ ...item, id: item._id?.toString() })),
      };
    });

    res.json({ success: true, data: { data: normalised, total, current_page: page, last_page: Math.ceil(total / perPage) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PLACE ORDER ─────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const { items, shipping_address_id, payment_method, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(422).json({ success: false, message: 'Order items are required.' });
    if (!shipping_address_id || !payment_method)
      return res.status(422).json({ success: false, message: 'Shipping address and payment method are required.' });

    // Get shipping address from user
    const user = req.user;
    const shippingAddress = user.addresses.id(shipping_address_id);
    if (!shippingAddress)
      return res.status(422).json({ success: false, message: 'Shipping address not found.' });

    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.product_id, deleted_at: null });
      if (!product) return res.status(422).json({ success: false, message: `Product not found.` });

      if (product.stock < item.quantity)
        return res.status(422).json({ success: false, message: `Product '${product.name}' is out of stock.` });

      let variant = null;
      if (item.variant_id) {
        variant = product.variants.id(item.variant_id);
        if (!variant) return res.status(422).json({ success: false, message: 'Variant not found.' });
        if (variant.stock < item.quantity)
          return res.status(422).json({ success: false, message: 'Variant is out of stock.' });
      }

      const price = (variant ? variant.price : null) ?? product.sale_price ?? product.price;
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id:   product._id,
        variant_id:   variant ? variant._id : null,
        product_name: product.name,
        product_sku:  product.sku,
        variant_info: variant ? { size: variant.size, color: variant.color } : null,
        quantity:     item.quantity,
        price,
        total: itemTotal,
      });

      // Deduct stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
      if (variant) {
        await Product.updateOne(
          { _id: product._id, 'variants._id': variant._id },
          { $inc: { 'variants.$.stock': -item.quantity } }
        );
      }
    }

    const shippingCost = calculateShipping(totalAmount);
    const tax = totalAmount * 0.18;
    const finalTotal = totalAmount + shippingCost + tax;

    const order = await Order.create({
      user_id: user._id,
      order_number: orderNumber,
      shipping_address: shippingAddress.toObject(),
      shipping_address_id,
      payment_method,
      payment_status: 'pending',
      status: 'pending',
      notes: notes || '',
      subtotal: totalAmount,
      shipping_cost: shippingCost,
      tax,
      total: finalTotal,
      items: orderItems,
    });

    res.status(201).json({ success: true, message: 'Order placed successfully.', data: order });
  } catch (err) {
    res.status(422).json({ success: false, message: err.message });
  }
};

// ─── SHOW ORDER ──────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const order = await Order.findOne({ user_id: req.user._id, order_number: req.params.orderNumber, deleted_at: null })
      .populate('items.product_id', 'name thumbnail slug');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const obj = order.toObject();
    // Normalise items: map product_id object -> product key so frontend (item.product) works
    obj.items = (obj.items || []).map(item => ({
      ...item,
      id: item._id?.toString(),
      product: item.product_id, // populated object
    }));
    obj.id = obj._id?.toString();
    obj.created_at = obj.createdAt;
    obj.updated_at = obj.updatedAt;

    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CANCEL ORDER ────────────────────────────────────────
exports.cancel = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user_id: req.user._id, deleted_at: null });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (!['pending', 'confirmed'].includes(order.status))
      return res.status(422).json({ success: false, message: 'Order cannot be cancelled at this stage.' });

    order.status = 'cancelled';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product_id, { $inc: { stock: item.quantity } });
      if (item.variant_id) {
        await Product.updateOne(
          { _id: item.product_id, 'variants._id': item.variant_id },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      }
    }

    res.json({ success: true, message: 'Order cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TRACK ORDER ─────────────────────────────────────────
exports.track = async (req, res) => {
  try {
    const order = await Order.findOne({ user_id: req.user._id, order_number: req.params.orderNumber, deleted_at: null });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const tracking = {
      order_number:       order.order_number,
      status:             order.status,
      payment_status:     order.payment_status,
      tracking_number:    order.tracking_number,
      courier:            order.courier,
      estimated_delivery: order.estimated_delivery,
      delivered_at:       order.delivered_at,
      timeline:           getOrderTimeline(order),
    };

    res.json({ success: true, data: tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── INVOICE (JSON for now — PDF requires puppeteer/pdf-lib) ─
exports.invoice = async (req, res) => {
  try {
    const order = await Order.findOne({ user_id: req.user._id, _id: req.params.id, deleted_at: null })
      .populate('items.product_id', 'name thumbnail');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// src/controllers/admin/reports.controller.js
const Order = require('../../models/Order');
const CustomOrder = require('../../models/CustomOrder');
const User = require('../../models/User');
const Product = require('../../models/Product');

const getDateRange = (req) => {
  // Support both from/to (frontend) and start_date/end_date (legacy)
  const startStr = req.query.from || req.query.start_date;
  const endStr   = req.query.to   || req.query.end_date;
  const start = startStr ? new Date(startStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end   = endStr   ? new Date(endStr)   : new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

exports.sales = async (req, res) => {
  try {
    const { start, end } = getDateRange(req);
    const group = req.query.group_by || 'day';
    const dateFormat = group === 'month' ? '%Y-%m' : '%Y-%m-%d';

    const rows = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' }, deleted_at: null } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
      { $project: { date: '$_id', revenue: 1, orders: 1, _id: 0 } },
    ]);

    const summaryAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' }, deleted_at: null } },
      { $group: { _id: null, total_revenue: { $sum: '$total' }, total_orders: { $sum: 1 }, avg_order_value: { $avg: '$total' } } },
    ]);

    const s = summaryAgg[0] || {};
    res.json({
      success: true,
      data: {
        summary: {
          total_revenue: Math.round(s.total_revenue || 0),
          total_orders: s.total_orders || 0,
          avg_order_value: Math.round(s.avg_order_value || 0),
        },
        columns: ['date', 'orders', 'revenue'],
        rows,
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.orders = async (req, res) => {
  try {
    const { start, end } = getDateRange(req);
    const breakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, deleted_at: null } },
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $project: { status: '$_id', count: 1, revenue: 1, _id: 0 } },
    ]);

    const total = breakdown.reduce((s, r) => s + r.count, 0);
    const revenue = breakdown.reduce((s, r) => s + r.revenue, 0);

    res.json({
      success: true,
      data: {
        summary: {
          total_orders: total,
          total_revenue: Math.round(revenue),
          cancelled: breakdown.find(b => b.status === 'cancelled')?.count || 0,
          delivered: breakdown.find(b => b.status === 'delivered')?.count || 0,
        },
        columns: ['status', 'count', 'revenue'],
        rows: breakdown,
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.products = async (req, res) => {
  try {
    const { start, end } = getDateRange(req);
    const rows = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, deleted_at: null } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product_id', name: { $first: '$items.product_name' }, sold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
      { $sort: { revenue: -1 } },
      { $limit: 20 },
      { $project: { product: '$name', units_sold: '$sold', revenue: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          top_products: rows.length,
          total_units_sold: rows.reduce((s, r) => s + r.units_sold, 0),
          total_revenue: Math.round(rows.reduce((s, r) => s + r.revenue, 0)),
        },
        columns: ['product', 'units_sold', 'revenue'],
        rows,
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.customers = async (req, res) => {
  try {
    const { start, end } = getDateRange(req);
    const newCustomers   = await User.countDocuments({ role: 'customer', createdAt: { $gte: start, $lte: end } });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    res.json({
      success: true,
      data: {
        summary: { new_customers: newCustomers, total_customers: totalCustomers },
        columns: [],
        rows: [],
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.inventory = async (req, res) => {
  try {
    const [lowStock, outOfStock, total] = await Promise.all([
      Product.find({ $expr: { $and: [{ $lte: ['$stock', '$low_stock_alert'] }, { $gt: ['$stock', 0] }] }, deleted_at: null }).select('name sku stock low_stock_alert'),
      Product.find({ stock: 0, deleted_at: null }).select('name sku stock'),
      Product.countDocuments({ deleted_at: null }),
    ]);
    res.json({ success: true, data: { total_products: total, low_stock: lowStock, out_of_stock: outOfStock } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.customOrders = async (req, res) => {
  try {
    const { start, end } = getDateRange(req);
    const data = await CustomOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.tailorPerformance = async (req, res) => {
  try {
    const { start, end } = getDateRange(req);
    const rows = await CustomOrder.aggregate([
      { $match: { assigned_tailor_id: { $ne: null }, createdAt: { $gte: start, $lte: end } } },
      { $group: {
          _id: '$assigned_tailor_id',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }
      }},
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'tailor' } },
      { $unwind: '$tailor' },
      { $project: { tailor_name: '$tailor.name', total_orders: '$total', completed_orders: '$completed', _id: 0 } },
      { $sort: { completed_orders: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          total_tailors: rows.length,
          total_orders: rows.reduce((s, r) => s + r.total_orders, 0),
          completed_orders: rows.reduce((s, r) => s + r.completed_orders, 0),
        },
        columns: ['tailor_name', 'total_orders', 'completed_orders'],
        rows,
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.export = async (req, res) => {
  res.json({ success: true, message: 'Export queued.' });
};

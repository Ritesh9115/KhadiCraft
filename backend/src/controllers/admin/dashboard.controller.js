// src/controllers/admin/dashboard.controller.js
const Order = require('../../models/Order');
const CustomOrder = require('../../models/CustomOrder');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Appointment = require('../../models/Appointment');

exports.index = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayOrders, todayRevenue, monthRevenue, totalOrders,
      pendingOrders, customOrders, todayAppointments, pendingAppointments,
      totalCustomers, newCustomersMonth, lowStockProducts, outOfStock, totalProducts,
      recentOrders, recentCustom, upcomingAppointments,
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow }, deleted_at: null }),
      Order.aggregate([{ $match: { createdAt: { $gte: today, $lt: tomorrow }, payment_status: 'paid', deleted_at: null } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth }, payment_status: 'paid', deleted_at: null } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ deleted_at: null }),
      Order.countDocuments({ status: 'pending', deleted_at: null }),
      CustomOrder.countDocuments({ status: { $in: ['pending', 'confirmed', 'cutting', 'stitching', 'finishing'] } }),
      Appointment.countDocuments({ appointment_date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({ $expr: { $and: [{ $lte: ['$stock', '$low_stock_alert'] }, { $gt: ['$stock', 0] }] }, deleted_at: null }),
      Product.countDocuments({ stock: 0, deleted_at: null }),
      Product.countDocuments({ is_active: true, deleted_at: null }),
      Order.find({ deleted_at: null }).populate('user_id', 'name email').sort({ createdAt: -1 }).limit(8),
      CustomOrder.find().populate('user_id', 'name email').sort({ createdAt: -1 }).limit(5),
      Appointment.find({ appointment_date: { $gte: today }, status: 'confirmed' }).populate('user_id', 'name email phone').sort({ appointment_date: 1, time_slot: 1 }).limit(5),
    ]);

    // Monthly revenue for last 12 months
    const monthlyRevenue = await getMonthlyRevenue();
    const orderStatusBreakdown = await getStatusBreakdown();

    res.json({
      success: true,
      data: {
        today_orders:          todayOrders,
        today_revenue:         todayRevenue[0]?.total || 0,
        month_revenue:         monthRevenue[0]?.total || 0,
        total_orders:          totalOrders,
        pending_orders:        pendingOrders,
        custom_orders:         customOrders,
        today_appointments:    todayAppointments,
        pending_appointments:  pendingAppointments,
        total_customers:       totalCustomers,
        new_customers_month:   newCustomersMonth,
        low_stock_products:    lowStockProducts,
        out_of_stock:          outOfStock,
        total_products:        totalProducts,
        recent_orders:         recentOrders,
        recent_custom:         recentCustom,
        upcoming_appointments: upcomingAppointments,
        monthly_revenue:       monthlyRevenue,
        order_status_breakdown: orderStatusBreakdown,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const range = parseInt(req.query.range) || 30;
    const start = new Date(); start.setDate(start.getDate() - range);

    const revenue = await Order.aggregate([
      { $match: { createdAt: { $gte: start }, payment_status: 'paid', deleted_at: null } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
      { $project: { date: '$_id', total: 1, count: 1, _id: 0 } },
    ]);

    res.json({ success: true, data: revenue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function getMonthlyRevenue() {
  const results = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const agg = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, payment_status: 'paid', deleted_at: null } },
      { $group: { _id: null, revenue: { $sum: '$total' } } },
    ]);
    results.push({ month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), revenue: agg[0]?.revenue || 0 });
  }
  return results;
}

async function getStatusBreakdown() {
  const agg = await Order.aggregate([
    { $match: { deleted_at: null } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const result = {};
  agg.forEach(a => { result[a._id] = a.count; });
  return result;
}

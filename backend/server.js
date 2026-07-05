// server.js — KhadiCraft MERN Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

const app = express();

// ─── Connect Database ─────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────
const authRoutes          = require('./src/routes/auth.routes');
const productRoutes       = require('./src/routes/product.routes');
const orderRoutes         = require('./src/routes/order.routes');
const customOrderRoutes   = require('./src/routes/customOrder.routes');
const appointmentRoutes   = require('./src/routes/appointment.routes');
const profileRoutes       = require('./src/routes/profile.routes');
const measurementRoutes   = require('./src/routes/measurement.routes');
const reviewRoutes        = require('./src/routes/review.routes');
const paymentRoutes       = require('./src/routes/payment.routes');
const wholesaleRoutes     = require('./src/routes/wholesale.routes');
const chatbotRoutes       = require('./src/routes/chatbot.routes');
const notificationRoutes  = require('./src/routes/notification.routes');

// Admin routes
const adminDashRoutes     = require('./src/routes/admin/dashboard.routes');
const adminProductRoutes  = require('./src/routes/admin/products.routes');
const adminCategoryRoutes = require('./src/routes/admin/categories.routes');
const adminOrderRoutes    = require('./src/routes/admin/orders.routes');
const adminCustomRoutes   = require('./src/routes/admin/customOrders.routes');
const adminApptRoutes     = require('./src/routes/admin/appointments.routes');
const adminUserRoutes     = require('./src/routes/admin/users.routes');
const adminInventoryRoutes= require('./src/routes/admin/inventory.routes');
const adminWholesaleRoutes= require('./src/routes/admin/wholesale.routes');
const adminReportRoutes   = require('./src/routes/admin/reports.routes');
const adminSettingRoutes  = require('./src/routes/admin/settings.routes');
const adminBannerRoutes   = require('./src/routes/admin/banners.routes');
const adminReviewRoutes   = require('./src/routes/admin/reviews.routes');
const adminFabricRoutes   = require('./src/routes/admin/fabricTypes.routes');
const tailorRoutes        = require('./src/routes/tailor.routes');

// Mount all routes under /api
app.use('/api/auth',           authRoutes);
app.use('/api',                productRoutes);       // /api/products, /api/categories, etc.
app.use('/api/orders',         orderRoutes);
app.use('/api/custom-orders',  customOrderRoutes);
app.use('/api/appointments',   appointmentRoutes);
app.use('/api/profile',        profileRoutes);
app.use('/api/measurements',   measurementRoutes);
app.use('/api/reviews',        reviewRoutes);
app.use('/api/payments',       paymentRoutes);
app.use('/api/wholesale',      wholesaleRoutes);
app.use('/api/chatbot',        chatbotRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/settings',       require('./src/routes/settings.routes'));

// Admin
app.use('/api/admin',          adminDashRoutes);
app.use('/api/admin',          adminProductRoutes);
app.use('/api/admin',          adminCategoryRoutes);
app.use('/api/admin',          adminOrderRoutes);
app.use('/api/admin',          adminCustomRoutes);
app.use('/api/admin',          adminApptRoutes);
app.use('/api/admin',          adminUserRoutes);
app.use('/api/admin',          adminInventoryRoutes);
app.use('/api/admin',          adminWholesaleRoutes);
app.use('/api/admin',          adminReportRoutes);
app.use('/api/admin',          adminSettingRoutes);
app.use('/api/admin',          adminBannerRoutes);
app.use('/api/admin',          adminReviewRoutes);
app.use('/api/admin',          adminFabricRoutes);

// Tailor
app.use('/api/tailor',         tailorRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'KhadiCraft API running', timestamp: new Date() });
});

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 KhadiCraft API running on http://localhost:${PORT}/api`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

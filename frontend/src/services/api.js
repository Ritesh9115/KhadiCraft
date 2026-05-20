// src/services/api.js  — COMPLETE FIXED VERSION
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// ── Auth token ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Handle 401 ──────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kc_token');
      localStorage.removeItem('kc_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── AUTH ────────────────────────────────────────────────────
export const authAPI = {
  register:       (d) => api.post('/auth/register', d),
  login:          (d) => api.post('/auth/login', d),
  logout:         ()  => api.post('/auth/logout'),
  me:             ()  => api.get('/auth/me'),
  sendOtp:        (d) => api.post('/auth/send-otp', d),
  verifyOtp:      (d) => api.post('/auth/verify-otp', d),
  forgotPassword: (d) => api.post('/auth/forgot-password', d),
  resetPassword:  (d) => api.post('/auth/reset-password', d),
};

// ── PRODUCTS ────────────────────────────────────────────────
export const productAPI = {
  list:        (p) => api.get('/products', { params: p }),
  show:        (slug) => api.get(`/products/${slug}`),
  categories:  ()  => api.get('/categories'),
  byCategory:  (slug, p) => api.get(`/categories/${slug}`, { params: p }),
  fabricTypes: ()  => api.get('/fabric-types'),
  banners:     ()  => api.get('/banners'),
  settings:    ()  => api.get('/settings/public'),
};

// ── ORDERS ──────────────────────────────────────────────────
export const orderAPI = {
  list:    ()   => api.get('/orders'),
  show:    (n)  => api.get(`/orders/${n}`),
  place:   (d)  => api.post('/orders', d),
  cancel:  (id) => api.post(`/orders/${id}/cancel`),
  track:   (n)  => api.get(`/orders/${n}/track`),
  invoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
};

// ── CUSTOM ORDERS ───────────────────────────────────────────
export const customOrderAPI = {
  list:            ()        => api.get('/custom-orders'),
  show:            (num)     => api.get(`/custom-orders/${num}`),
  place:           (d)       => api.post('/custom-orders', d),
  cancel:          (id)      => api.post(`/custom-orders/${id}/cancel`),
  uploadReference: (id, fd)  => api.post(`/custom-orders/${id}/upload-reference`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ── APPOINTMENTS ────────────────────────────────────────────
export const appointmentAPI = {
  list:       ()       => api.get('/appointments'),
  show:       (id)     => api.get(`/appointments/${id}`),
  slots:      (date)   => api.get('/appointments/slots', { params: { date } }),
  book:       (d)      => api.post('/appointments', d),
  cancel:     (id)     => api.put(`/appointments/${id}/cancel`),
  reschedule: (id, d)  => api.put(`/appointments/${id}/reschedule`, d),
};

// ── PROFILE ─────────────────────────────────────────────────
export const profileAPI = {
  get:               ()         => api.get('/profile'),
  update:            (d)        => api.put('/profile', d),
  uploadAvatar:      (fd)       => api.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAddresses:      ()         => api.get('/profile/addresses'),
  addAddress:        (d)        => api.post('/profile/addresses', d),
  updateAddress:     (id, d)    => api.put(`/profile/addresses/${id}`, d),
  deleteAddress:     (id)       => api.delete(`/profile/addresses/${id}`),
  setDefaultAddress: (id)       => api.put(`/profile/addresses/${id}/default`),
  getNotifications:  ()         => api.get('/notifications'),
  markRead:          (id)       => api.put(`/notifications/${id}/read`),
  markAllRead:       ()         => api.put('/notifications/read-all'),
};

// ── MEASUREMENTS ────────────────────────────────────────────
export const measurementAPI = {
  list:       ()        => api.get('/measurements'),
  add:        (d)       => api.post('/measurements', d),
  update:     (id, d)   => api.put(`/measurements/${id}`, d),
  delete:     (id)      => api.delete(`/measurements/${id}`),
  setDefault: (id)      => api.put(`/measurements/${id}/default`),
};

// ── REVIEWS ─────────────────────────────────────────────────
export const reviewAPI = {
  list:   (productId) => api.get(`/reviews/${productId}`),
  add:    (d)         => api.post('/reviews', d),
  update: (id, d)     => api.put(`/reviews/${id}`, d),
  delete: (id)        => api.delete(`/reviews/${id}`),
};

// ── PAYMENTS ────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (d) => api.post('/payments/create-order', d),
  verify:      (d) => api.post('/payments/verify', d),
  history:     ()  => api.get('/payments/history'),
};

// ── WHOLESALE ───────────────────────────────────────────────
export const wholesaleAPI = {
  register:     (d) => api.post('/wholesale/register', d),
  status:       ()  => api.get('/wholesale/status'),
  requestQuote: (d) => api.post('/wholesale/quote-request', d),
  myQuotes:     ()  => api.get('/wholesale/quotes'),
};

// ── CHATBOT ─────────────────────────────────────────────────
export const chatbotAPI = {
  send: (d) => api.post('/chatbot', d),
};

// ── ADMIN ───────────────────────────────────────────────────
export const adminAPI = {
  // Dashboard
  dashboard: ()    => api.get('/admin/dashboard'),
  stats:     (p)   => api.get('/admin/dashboard/stats', { params: p }),

  // Categories
  categories:     (p)      => api.get('/admin/categories', { params: p }),
  createCategory: (d)      => api.post('/admin/categories', d),
  updateCategory: (id,d)   => api.put(`/admin/categories/${id}`, d),
  deleteCategory: (id)     => api.delete(`/admin/categories/${id}`),
  toggleCategory: (id)     => api.put(`/admin/categories/${id}/toggle`),

  // Products
  products:      (p)       => api.get('/admin/products', { params: p }),
  createProduct:  (fd)     => api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct:  (id,fd)  => api.post(`/admin/products/${id}?_method=PUT`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct:  (id)     => api.delete(`/admin/products/${id}`),
  toggleProduct: (id)      => api.put(`/admin/products/${id}/toggle`),
  updateStock:   (id,d)    => api.put(`/admin/products/${id}/stock`, d),
  bulkAction:    (d)       => api.post('/admin/products/bulk', d),
  uploadImages:  (id, fd)  => api.post(`/admin/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage:   (id, iid) => api.delete(`/admin/products/${id}/images/${iid}`),
  addVariant:    (id, d)   => api.post(`/admin/products/${id}/variants`, d),
  updateVariant: (id,vid,d)=> api.put(`/admin/products/${id}/variants/${vid}`, d),
  deleteVariant: (id, vid) => api.delete(`/admin/products/${id}/variants/${vid}`),
  fabricTypes:   ()        => api.get('/fabric-types'),
  updateCategory: (id, d)  => api.put(`/admin/categories/${id}`, d),
  deleteCategory: (id)     => api.delete(`/admin/categories/${id}`),
  toggleCategory: (id)     => api.put(`/admin/categories/${id}/toggle`),

  // Orders
  orders:           (p)    => api.get('/admin/orders', { params: p }),
  order:            (id)   => api.get(`/admin/orders/${id}`),
  updateOrderStatus:(id,d) => api.put(`/admin/orders/${id}/status`, d),
  updatePayStatus:  (id,d) => api.put(`/admin/orders/${id}/payment-status`, d),
  updateTracking:   (id,d) => api.put(`/admin/orders/${id}/tracking`, d),
  orderInvoice:     (id)   => api.get(`/admin/orders/${id}/invoice`, { responseType: 'blob' }),
  addOrderNote:     (id,d) => api.post(`/admin/orders/${id}/notes`, d),

  // Custom Orders
  customOrders:     (p)    => api.get('/admin/custom-orders', { params: p }),
  customOrder:      (id)   => api.get(`/admin/custom-orders/${id}`),
  updateCustomStatus:(id,d)=> api.put(`/admin/custom-orders/${id}/status`, d),
  assignTailor:     (id,d) => api.put(`/admin/custom-orders/${id}/assign`, d),
  setCustomPrice:   (id,d) => api.put(`/admin/custom-orders/${id}/price`, d),
  addNote:          (id,d) => api.post(`/admin/custom-orders/${id}/notes`, d),
  getStages:        (id)   => api.get(`/admin/custom-orders/${id}/stages`),

  // Appointments
  appointments:     (p)    => api.get('/admin/appointments', { params: p }),
  appointment:      (id)   => api.get(`/admin/appointments/${id}`),
  updateApptStatus: (id,d) => api.put(`/admin/appointments/${id}/status`, d),
  assignApptStaff:  (id,d) => api.put(`/admin/appointments/${id}/assign`, d),
  timeSlots:        ()     => api.get('/admin/time-slots'),
  createSlot:       (d)    => api.post('/admin/time-slots', d),
  updateSlot:       (id,d) => api.put(`/admin/time-slots/${id}`, d),
  deleteSlot:       (id)   => api.delete(`/admin/time-slots/${id}`),

  // Users
  users:       (p)     => api.get('/admin/users', { params: p }),
  user:        (id)    => api.get(`/admin/users/${id}`),
  updateUser:  (id,d)  => api.put(`/admin/users/${id}`, d),
  toggleUser:  (id)    => api.put(`/admin/users/${id}/toggle`),
  changeRole:  (id,d)  => api.put(`/admin/users/${id}/role`, d),
  tailors:     ()      => api.get('/admin/tailors'),
  staff:       ()      => api.get('/admin/staff'),

  // Inventory
  inventory:    (p)    => api.get('/admin/inventory', { params: p }),
  lowStock:     ()     => api.get('/admin/inventory/low-stock'),
  adjustStock:  (d)    => api.post('/admin/inventory/adjust', d),
  inventoryLogs:(p)    => api.get('/admin/inventory/logs', { params: p }),

  // Wholesale
  wholesaleBuyers: (p)    => api.get('/admin/wholesale/buyers', { params: p }),
  updateBuyerStatus: (id,d) => api.put(`/admin/wholesale/buyers/${id}/status`, d),
  setBuyerDiscount: (id,d) => api.put(`/admin/wholesale/buyers/${id}/discount`, d),
  wholesaleQuotes: (p)    => api.get('/admin/wholesale/quotes', { params: p }),
  updateQuote:     (id,d) => api.put(`/admin/wholesale/quotes/${id}`, d),

  // Reports
  salesReport:   (p)   => api.get('/admin/reports/sales', { params: p }),
  orderReport:   (p)   => api.get('/admin/reports/orders', { params: p }),
  productReport: (p)   => api.get('/admin/reports/products', { params: p }),
  tailorReport:  (p)   => api.get('/admin/reports/tailor-performance', { params: p }),
  exportReport:  (t,p) => api.get(`/admin/reports/export/${t}`, { params: p, responseType: 'blob' }),

  // Settings
  settings:       ()   => api.get('/admin/settings'),
  updateSettings: (d)  => api.put('/admin/settings', d),

  // Banners
  banners:       ()      => api.get('/admin/banners'),
  createBanner:  (fd)    => api.post('/admin/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBanner:  (id,fd) => api.post(`/admin/banners/${id}?_method=PUT`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBanner:  (id)    => api.delete(`/admin/banners/${id}`),
  toggleBanner:  (id)    => api.put(`/admin/banners/${id}/toggle`),

  // Reviews
  reviews:       (p)    => api.get('/admin/reviews', { params: p }),
  approveReview: (id)   => api.put(`/admin/reviews/${id}/approve`),
  replyReview:   (id,d) => api.put(`/admin/reviews/${id}/reply`, d),
  deleteReview:  (id)   => api.delete(`/admin/reviews/${id}`),
};

// ── TAILOR ──────────────────────────────────────────────────
export const tailorAPI = {
  dashboard:      ()        => api.get('/tailor/dashboard'),
  assignedOrders: (p)       => api.get('/tailor/assigned-orders', { params: p }),
  orderDetail:    (id)      => api.get(`/tailor/orders/${id}`),
  updateStage:    (id, d)   => api.put(`/tailor/orders/${id}/stage`, d),
  addNote:        (id, d)   => api.post(`/tailor/orders/${id}/notes`, d),
  workload:       ()        => api.get('/tailor/workload'),
};

export default api;

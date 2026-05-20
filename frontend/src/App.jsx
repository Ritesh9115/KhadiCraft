// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './context/authStore';

// Layouts
import CustomerLayout  from './components/ui/CustomerLayout';
import AdminLayout     from './components/admin/AdminLayout';
import TailorLayout   from './components/admin/TailorLayout';

// Auth Pages
import Login           from './pages/auth/Login';
import Register        from './pages/auth/Register';
import VerifyOtp       from './pages/auth/VerifyOtp';
import ForgotPassword  from './pages/auth/ForgotPassword';
import ResetPassword   from './pages/auth/ResetPassword';

// Customer Pages
import Home            from './pages/Home';
import Shop            from './pages/Shop';
import ProductDetail   from './pages/ProductDetail';
import Cart            from './pages/Cart';
import Checkout        from './pages/Checkout';
import OrderSuccess    from './pages/OrderSuccess';
import TrackOrder      from './pages/TrackOrder';
import CustomTailoring from './pages/CustomTailoring';
import Appointments    from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Wholesale       from './pages/Wholesale';

// Account Pages
import Dashboard       from './pages/account/Dashboard';
import MyOrders        from './pages/account/MyOrders';
import OrderDetail     from './pages/account/OrderDetail';
import CustomOrders    from './pages/account/CustomOrders';
import CustomOrderDetail from './pages/account/CustomOrderDetail';
import MyAppointments  from './pages/account/MyAppointments';
import Measurements    from './pages/account/Measurements';
import Addresses       from './pages/account/Addresses';
import Profile         from './pages/account/Profile';
import Notifications   from './pages/account/Notifications';

// Admin Pages
import AdminDashboard  from './pages/admin/Dashboard';
import AdminProducts   from './pages/admin/Products';
import AdminProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/Categories';
import AdminOrders     from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminCustomOrders from './pages/admin/CustomOrders';
import AdminCustomOrderDetail from './pages/admin/CustomOrderDetail';
import AdminAppointments from './pages/admin/Appointments';
import AdminUsers      from './pages/admin/Users';
import AdminInventory  from './pages/admin/Inventory';
import AdminWholesale  from './pages/admin/Wholesale';
import AdminReports    from './pages/admin/Reports';
import AdminSettings   from './pages/admin/Settings';
import AdminBanners    from './pages/admin/Banners';

// Tailor Pages
import TailorDashboard from './pages/tailor/Dashboard';
import TailorOrders    from './pages/tailor/Orders';
import TailorOrderDetail from './pages/tailor/OrderDetail';

// Guards
const PrivateRoute = ({ children }) => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn());
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuthStore();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (!isAdmin())    return <Navigate to="/" replace />;
  return children;
};

const TailorRoute = ({ children }) => {
  const { isLoggedIn, isTailor } = useAuthStore();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (!isTailor())   return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  useEffect(() => {
    const { token, fetchMe } = useAuthStore.getState();
    if (token) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>

        {/* ── AUTH ── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/verify-email"    element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ── CUSTOMER / PUBLIC ── */}
        <Route element={<CustomerLayout />}>
          <Route path="/"                    element={<Home />} />
          <Route path="/shop"                element={<Shop />} />
          <Route path="/shop/:categorySlug"  element={<Shop />} />
          <Route path="/product/:slug"       element={<ProductDetail />} />
          <Route path="/cart"                element={<Cart />} />
          <Route path="/track-order"         element={<TrackOrder />} />
          <Route path="/custom-tailoring"    element={<CustomTailoring />} />
          <Route path="/appointments"        element={<Appointments />} />
          <Route path="/wholesale"           element={<Wholesale />} />

          {/* ── PROTECTED CUSTOMER ── */}
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/order-success/:number" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
          <Route path="/book-appointment" element={<PrivateRoute><BookAppointment /></PrivateRoute>} />

          {/* ── ACCOUNT ── */}
          <Route path="/account" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/account/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/account/orders/:number" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
          <Route path="/account/custom-orders" element={<PrivateRoute><CustomOrders /></PrivateRoute>} />
          <Route path="/account/custom-orders/:number" element={<PrivateRoute><CustomOrderDetail /></PrivateRoute>} />
          <Route path="/account/appointments" element={<PrivateRoute><MyAppointments /></PrivateRoute>} />
          <Route path="/account/measurements" element={<PrivateRoute><Measurements /></PrivateRoute>} />
          <Route path="/account/addresses" element={<PrivateRoute><Addresses /></PrivateRoute>} />
          <Route path="/account/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/account/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        </Route>

        {/* ── ADMIN ── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products"              element={<AdminProducts />} />
          <Route path="products/new"          element={<AdminProductForm />} />
          <Route path="products/:id/edit"     element={<AdminProductForm />} />
          <Route path="categories"            element={<AdminCategories />} />
          <Route path="orders"                element={<AdminOrders />} />
          <Route path="orders/:id"            element={<AdminOrderDetail />} />
          <Route path="custom-orders"         element={<AdminCustomOrders />} />
          <Route path="custom-orders/:id"     element={<AdminCustomOrderDetail />} />
          <Route path="appointments"          element={<AdminAppointments />} />
          <Route path="users"                 element={<AdminUsers />} />
          <Route path="inventory"             element={<AdminInventory />} />
          <Route path="wholesale"             element={<AdminWholesale />} />
          <Route path="reports"               element={<AdminReports />} />
          <Route path="settings"              element={<AdminSettings />} />
          <Route path="banners"               element={<AdminBanners />} />
        </Route>

        {/* ── TAILOR ── */}
        <Route path="/tailor" element={<TailorRoute><TailorLayout /></TailorRoute>}>
          <Route index            element={<TailorDashboard />} />
          <Route path="orders"    element={<TailorOrders />} />
          <Route path="orders/:id" element={<TailorOrderDetail />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

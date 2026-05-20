import React from 'react';
import { Link } from 'react-router-dom';
import { useRoleCheck } from './RoleGuard';

export const AdminOnly = ({ children, fallback = null }) => {
  const { isAdmin } = useRoleCheck();
  return isAdmin() ? children : fallback;
};

export const TailorOnly = ({ children, fallback = null }) => {
  const { isTailor } = useRoleCheck();
  return isTailor() ? children : fallback;
};

export const RoleNavigation = ({ variant = 'desktop' }) => {
  const { user, isAdmin, isTailor, isCustomer } = useRoleCheck();

  const linkClass = variant === 'desktop' 
    ? 'kc-nav-link' 
    : 'mobile-nav-link';

  const buttonClass = variant === 'desktop'
    ? 'kc-icon-btn'
    : 'mobile-nav-button';

  const getNavigationItems = () => {
    const items = [];

    // Admin navigation
    if (isAdmin()) {
      items.push({
        type: 'link',
        label: 'Admin Panel',
        path: '/admin',
        icon: '⚙️',
        color: '#C5933A',
        description: 'Manage products, orders, customers, and settings'
      });
    }

    // Tailor navigation
    if (isTailor()) {
      items.push({
        type: 'link',
        label: 'Tailor Panel',
        path: '/tailor',
        icon: '✂️',
        color: '#8B5CF6',
        description: 'View assigned orders and update progress'
      });
    }

    // Customer navigation (all logged-in users)
    if (user) {
      items.push({
        type: 'link',
        label: 'My Account',
        path: '/account',
        icon: '👤',
        color: '#1B4332',
        description: 'View profile, orders, and measurements'
      });
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  if (variant === 'desktop') {
    return (
      <div className="role-navigation">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={buttonClass}
            title={item.description}
            style={{
              background: item.color,
              color: '#fff',
              textDecoration: 'none'
            }}
          >
            {item.icon}
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className="mobile-role-navigation">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="mobile-nav-button"
            style={{
              display: 'block',
              padding: '12px',
              background: item.color,
              color: '#fff',
              textAlign: 'center',
              borderRadius: '2px',
              fontSize: '0.85rem',
              textDecoration: 'none',
              marginBottom: '8px'
            }}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>
    );
  }

  return null;
};

export const RoleQuickActions = () => {
  const { user, isAdmin, isTailor } = useRoleCheck();

  const getQuickActions = () => {
    const actions = [];

    if (isAdmin()) {
      actions.push(
        { label: 'New Product', path: '/admin/products/create', icon: '➕' },
        { label: 'Pending Orders', path: '/admin/orders?status=pending', icon: '📋' },
        { label: 'Low Stock', path: '/admin/inventory?stock=low', icon: '⚠️' },
        { label: 'Today Appointments', path: '/admin/appointments', icon: '📅' }
      );
    }

    if (isTailor()) {
      actions.push(
        { label: 'My Orders', path: '/tailor/orders', icon: '📦' },
        { label: 'Dashboard', path: '/tailor', icon: '📊' },
        { label: 'Workload', path: '/tailor/workload', icon: '⏱️' }
      );
    }

    return actions;
  };

  const quickActions = getQuickActions();

  if (quickActions.length === 0) return null;

  return (
    <div className="role-quick-actions">
      <h4>Quick Actions</h4>
      <div className="quick-actions-grid">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="quick-action-card"
          >
            <span className="quick-action-icon">{action.icon}</span>
            <span className="quick-action-label">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const RoleDashboard = () => {
  const { user, isAdmin, isTailor, isCustomer } = useRoleCheck();

  if (isAdmin()) {
    return (
      <div className="role-dashboard-welcome">
        <div className="welcome-header">
          <h2>Welcome back, {user?.name}!</h2>
          <p className="role-badge">Administrator</p>
        </div>
        <div className="admin-quick-stats">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-content">
              <h3>Manage Orders</h3>
              <p>View and process all customer orders</p>
              <Link to="/admin/orders" className="stat-link">View Orders →</Link>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏷️</span>
            <div className="stat-content">
              <h3>Product Management</h3>
              <p>Add, edit, and manage your product catalog</p>
              <Link to="/admin/products" className="stat-link">Manage Products →</Link>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-content">
              <h3>Customer Support</h3>
              <p>Manage customers, appointments, and inquiries</p>
              <Link to="/admin/users" className="stat-link">View Customers →</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTailor()) {
    return (
      <div className="role-dashboard-welcome">
        <div className="welcome-header">
          <h2>Welcome back, {user?.name}!</h2>
          <p className="role-badge">Tailor</p>
        </div>
        <div className="tailor-quick-stats">
          <div className="stat-card">
            <span className="stat-icon">✂️</span>
            <div className="stat-content">
              <h3>Assigned Orders</h3>
              <p>View your current custom tailoring assignments</p>
              <Link to="/tailor/orders" className="stat-link">My Orders →</Link>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-content">
              <h3>Work Dashboard</h3>
              <p>Track your progress and workload</p>
              <Link to="/tailor" className="stat-link">Dashboard →</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCustomer()) {
    return (
      <div className="role-dashboard-welcome">
        <div className="welcome-header">
          <h2>Welcome back, {user?.name}!</h2>
          <p className="role-badge">Customer</p>
        </div>
        <div className="customer-quick-stats">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-content">
              <h3>My Orders</h3>
              <p>Track your orders and view order history</p>
              <Link to="/account/orders" className="stat-link">View Orders →</Link>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✂️</span>
            <div className="stat-content">
              <h3>Custom Orders</h3>
              <p>View your custom tailoring orders</p>
              <Link to="/account/custom-orders" className="stat-link">Custom Orders →</Link>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📏</span>
            <div className="stat-content">
              <h3>Measurements</h3>
              <p>Manage your measurement profiles</p>
              <Link to="/account/measurements" className="stat-link">Measurements →</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

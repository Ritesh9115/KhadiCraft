import React from 'react';
import { useAuthStore } from '../../context/authStore';

export const RoleGuard = ({ children, roles, fallback = null }) => {
  const { user, isLoggedIn } = useAuthStore();

  if (!isLoggedIn()) {
    return fallback;
  }

  if (!roles.includes(user?.role)) {
    return fallback;
  }

  return children;
};

export const AdminOnly = ({ children, fallback = null }) => {
  return (
    <RoleGuard roles={['admin', 'staff']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

export const TailorOnly = ({ children, fallback = null }) => {
  return (
    <RoleGuard roles={['tailor']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

export const CustomerOnly = ({ children, fallback = null }) => {
  return (
    <RoleGuard roles={['customer']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

// Higher-order component for role-based access
export const withRoleGuard = (Component, { roles, fallback = null }) => {
  return (props) => (
    <RoleGuard roles={roles} fallback={fallback}>
      <Component {...props} />
    </RoleGuard>
  );
};

// Hook for role checking
export const useRoleCheck = () => {
  const { user, isLoggedIn, isAdmin, isTailor } = useAuthStore();

  return {
    user,
    isLoggedIn,
    isAdmin,
    isTailor,
    isCustomer: () => user?.role === 'customer',
    isStaff: () => user?.role === 'staff',
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role),
    canAccess: (requiredRoles) => isLoggedIn() && requiredRoles.includes(user?.role),
  };
};

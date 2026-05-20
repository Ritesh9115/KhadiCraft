import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/authStore';
import App from '../App';
import RoleGuard from '../components/ui/RoleGuard';
import { RoleNavigation, RoleDashboard } from '../components/ui/RoleNavigation';

// Mock API responses
jest.mock('../services/api', () => ({
  authAPI: {
    me: jest.fn(() => Promise.resolve({
      data: {
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer'
        }
      }
    }))
  }
}));

// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Role-Based Access Control', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('RoleGuard allows access for correct role', async () => {
    const mockUser = { id: 1, name: 'Admin User', role: 'admin' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleGuard roles={['admin']}>
          <div data-testid="admin-content">Admin Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });
  });

  test('RoleGuard denies access for wrong role', async () => {
    const mockUser = { id: 1, name: 'Customer User', role: 'customer' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleGuard roles={['admin']} fallback={<div data-testid="access-denied">Access Denied</div>}>
          <div data-testid="admin-content">Admin Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });
  });

  test('RoleGuard denies access for unauthenticated user', () => {
    render(
      <TestWrapper>
        <RoleGuard roles={['admin']} fallback={<div data-testid="login-required">Login Required</div>}>
          <div data-testid="admin-content">Admin Content</div>
        </RoleGuard>
      </TestWrapper>
    );

    expect(screen.getByTestId('login-required')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  test('AdminOnly component works correctly', async () => {
    const mockUser = { id: 1, name: 'Admin User', role: 'admin' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleGuard.AdminOnly>
          <div data-testid="admin-only">Admin Only Content</div>
        </RoleGuard.AdminOnly>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-only')).toBeInTheDocument();
    });
  });

  test('TailorOnly component works correctly', async () => {
    const mockUser = { id: 1, name: 'Tailor User', role: 'tailor' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleGuard.TailorOnly>
          <div data-testid="tailor-only">Tailor Only Content</div>
        </RoleGuard.TailorOnly>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('tailor-only')).toBeInTheDocument();
    });
  });

  test('CustomerOnly component works correctly', async () => {
    const mockUser = { id: 1, name: 'Customer User', role: 'customer' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleGuard.CustomerOnly>
          <div data-testid="customer-only">Customer Only Content</div>
        </RoleGuard.CustomerOnly>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('customer-only')).toBeInTheDocument();
    });
  });
});

describe('Role Navigation', () => {
  test('RoleNavigation shows admin options for admin users', async () => {
    const mockUser = { id: 1, name: 'Admin User', role: 'admin' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleNavigation variant="desktop" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTitle('Admin Panel')).toBeInTheDocument();
    });
  });

  test('RoleNavigation shows tailor options for tailor users', async () => {
    const mockUser = { id: 1, name: 'Tailor User', role: 'tailor' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleNavigation variant="desktop" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTitle('Tailor Panel')).toBeInTheDocument();
    });
  });

  test('RoleNavigation shows account options for all logged-in users', async () => {
    const mockUser = { id: 1, name: 'Customer User', role: 'customer' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleNavigation variant="desktop" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTitle('Account')).toBeInTheDocument();
    });
  });
});

describe('Role Dashboard', () => {
  test('RoleDashboard shows admin dashboard for admin users', async () => {
    const mockUser = { id: 1, name: 'Admin User', role: 'admin' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
      expect(screen.getByText('Manage Orders')).toBeInTheDocument();
      expect(screen.getByText('Product Management')).toBeInTheDocument();
    });
  });

  test('RoleDashboard shows tailor dashboard for tailor users', async () => {
    const mockUser = { id: 1, name: 'Tailor User', role: 'tailor' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Tailor')).toBeInTheDocument();
      expect(screen.getByText('Assigned Orders')).toBeInTheDocument();
      expect(screen.getByText('Work Dashboard')).toBeInTheDocument();
    });
  });

  test('RoleDashboard shows customer dashboard for customer users', async () => {
    const mockUser = { id: 1, name: 'Customer User', role: 'customer' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <RoleDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('My Orders')).toBeInTheDocument();
      expect(screen.getByText('Custom Orders')).toBeInTheDocument();
    });
  });
});

describe('Route Protection', () => {
  test('Admin routes are protected', async () => {
    const mockUser = { id: 1, name: 'Customer User', role: 'customer' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Try to navigate to admin route
    window.history.pushState({}, '/admin', '/admin');

    await waitFor(() => {
      // Should redirect to home or show access denied
      expect(window.location.pathname).not.toBe('/admin');
    });
  });

  test('Tailor routes are protected', async () => {
    const mockUser = { id: 1, name: 'Customer User', role: 'customer' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Try to navigate to tailor route
    window.history.pushState({}, '/tailor', '/tailor');

    await waitFor(() => {
      // Should redirect to home or show access denied
      expect(window.location.pathname).not.toBe('/tailor');
    });
  });

  test('Admin can access admin routes', async () => {
    const mockUser = { id: 1, name: 'Admin User', role: 'admin' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Navigate to admin route
    window.history.pushState({}, '/admin', '/admin');

    await waitFor(() => {
      // Should allow access
      expect(window.location.pathname).toBe('/admin');
    });
  });

  test('Tailor can access tailor routes', async () => {
    const mockUser = { id: 1, name: 'Tailor User', role: 'tailor' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Navigate to tailor route
    window.history.pushState({}, '/tailor', '/tailor');

    await waitFor(() => {
      // Should allow access
      expect(window.location.pathname).toBe('/tailor');
    });
  });
});

describe('Role Check Hook', () => {
  test('useRoleCheck returns correct role information', async () => {
    const mockUser = { id: 1, name: 'Admin User', role: 'admin' };
    localStorage.setItem('kc_user', JSON.stringify(mockUser));
    localStorage.setItem('kc_token', 'test-token');

    const TestComponent = () => {
      const { user, isAdmin, isTailor, isCustomer, hasRole } = useRoleCheck();
      
      return (
        <div>
          <div data-testid="user-role">{user?.role}</div>
          <div data-testid="is-admin">{isAdmin() ? 'true' : 'false'}</div>
          <div data-testid="is-tailor">{isTailor() ? 'true' : 'false'}</div>
          <div data-testid="is-customer">{isCustomer() ? 'true' : 'false'}</div>
          <div data-testid="has-admin-role">{hasRole('admin') ? 'true' : 'false'}</div>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
      expect(screen.getByTestId('is-tailor')).toHaveTextContent('false');
      expect(screen.getByTestId('is-customer')).toHaveTextContent('false');
      expect(screen.getByTestId('has-admin-role')).toHaveTextContent('true');
    });
  });
});

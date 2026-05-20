import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ROLE_COLOR = { admin: '#ef4444', staff: '#f59e0b', tailor: '#8b5cf6', customer: '#059669', wholesale: '#3b82f6', delivery: '#6366f1' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: 'customer', page: 1 });

  useEffect(() => { load(); }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.users(filters);
      setUsers(r.data.data?.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const toggleUser = async (id) => {
    await adminAPI.toggleUser(id);
    setUsers(u => u.map(x => x.id === id ? { ...x, is_active: !x.is_active } : x));
    toast.success('Status updated');
  };

  const changeRole = async (id, role) => {
    await adminAPI.changeRole(id, { role });
    setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
    toast.success('Role updated');
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>User Management</h1><p>Manage customers, staff, and tailors</p></div>
      </div>
      <div className="filters-bar">
        <input
          className="filter-input"
          placeholder="🔍 Name, email, phone..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          style={{ flex: 1 }}
        />
        <select className="admin-select" value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}>
          <option value="">All Roles</option>
          {['customer', 'admin', 'staff', 'tailor', 'delivery', 'wholesale'].map(r => (
            <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>
          ))}
        </select>
        <button className="btn-outline-sm" onClick={() => setFilters({ search: '', role: '', page: 1 })}>Clear</button>
      </div>

      <div className="admin-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : (
            <table className="admin-table" style={{ minWidth: '750px' }}>
              <thead>
                <tr><th>User</th><th>Phone</th><th>Role</th><th>Joined</th><th>Verified</th><th>Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1B4332', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 600, flexShrink: 0 }}>
                          {u.name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{u.phone || '—'}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                        style={{ padding: '4px 8px', border: `1px solid ${ROLE_COLOR[u.role] || '#e5e7eb'}40`, borderRadius: '4px', background: (ROLE_COLOR[u.role] || '#6b7280') + '12', color: ROLE_COLOR[u.role] || '#6b7280', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
                      >
                        {['customer', 'admin', 'staff', 'tailor', 'delivery', 'wholesale'].map(r => (
                          <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td><span style={{ fontSize: '0.78rem' }}>{u.email_verified ? '✅' : '❌'}</span></td>
                    <td>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={!!u.is_active} onChange={() => toggleUser(u.id)} />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <button
                        className="btn-outline-sm"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => window.location.href = `/admin/users/${u.id}`}
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

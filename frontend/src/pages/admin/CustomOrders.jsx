import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CUSTOM_STATUS = ['pending','confirmed','fabric_selected','measurement_received','cutting','stitching','finishing','quality_check','ready','dispatched','delivered','cancelled'];
const SCOLOR = { cutting:'#f59e0b', stitching:'#8b5cf6', finishing:'#3b82f6', quality_check:'#06b6d4', ready:'#059669', delivered:'#059669', cancelled:'#ef4444', pending:'#9ca3af', confirmed:'#3b82f6' };

export default function AdminCustomOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, per_page: 20 });

  useEffect(() => { load(); }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.customOrders(filters);
      setOrders(r.data.data.data || []);
    } catch { toast.error('Failed to load custom orders'); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Custom Orders</h1><p>Manage custom tailoring orders</p></div>
      </div>

      <div className="filters-bar">
        <input
          className="filter-input"
          placeholder="🔍 Order number, customer..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          style={{ flex: 1 }}
        />
        <select className="admin-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Stages</option>
          {CUSTOM_STATUS.map(s => (
            <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <button className="btn-outline-sm" onClick={() => setFilters({ search: '', status: '', page: 1, per_page: 20 })}>Clear</button>
      </div>

      <div className="admin-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : (
            <table className="admin-table" style={{ minWidth: '900px' }}>
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Style</th><th>Fabric</th><th>Tailor</th><th>Stage</th><th>Est. Price</th><th>Due</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><span className="order-num" style={{ color: '#C5933A' }}>{o.custom_order_number}</span></td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.83rem' }}>{o.user?.name}</div>
                      <div style={{ fontSize: '0.71rem', color: '#9ca3af' }}>{o.user?.phone}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{o.style_type?.replace('_', ' ')}</td>
                    <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{o.fabric_name || '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {o.assigned_tailor?.name || <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>⚠ Unassigned</span>}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: (SCOLOR[o.status] || '#6b7280') + '20', color: SCOLOR[o.status] || '#6b7280', textTransform: 'capitalize' }}>
                        {o.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {o.final_price ? `₹${o.final_price?.toLocaleString()}` : o.estimated_price ? `~₹${o.estimated_price?.toLocaleString()}` : 'TBD'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                      {o.estimated_ready_date ? new Date(o.estimated_ready_date).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <Link to={`/admin/custom-orders/${o.id}`}>
                        <button className="btn-outline-sm" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>👁️ View</button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>No custom orders found</td></tr>
                )}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

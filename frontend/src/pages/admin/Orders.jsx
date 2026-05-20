// src/pages/admin/Orders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = { pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6', ready: '#10b981', dispatched: '#6366f1', delivered: '#059669', cancelled: '#ef4444', returned: '#f97316' };
const PAY_COLOR = { pending: '#f59e0b', paid: '#059669', partial: '#3b82f6', failed: '#ef4444', refunded: '#6b7280' };

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', payment_status: '', page: 1, per_page: 20 });
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { load(); }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.orders(filters);
      setOrders(res.data.data.data || []);
      setMeta(res.data.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const updateStatus = async () => {
    try {
      await adminAPI.updateOrderStatus(statusModal.id, { status: newStatus });
      toast.success('Order status updated!');
      setStatusModal(null);
      load();
    } catch { toast.error('Update failed'); }
  };

  const downloadInvoice = async (id, number) => {
    try {
      const res = await adminAPI.orderInvoice(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${number}.pdf`; a.click();
    } catch { toast.error('Invoice download failed'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Orders</h1><p>Manage all customer orders</p></div>
        <button className="btn-outline-sm" onClick={() => adminAPI.exportReport('orders').then(() => toast.success('Export started'))}>📥 Export CSV</button>
      </div>

      <div className="filters-bar">
        <input className="filter-input" placeholder="🔍 Order number, customer name..." value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} style={{ flex: 1, minWidth: '200px' }} />
        <select className="admin-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {['pending', 'confirmed', 'processing', 'ready', 'dispatched', 'delivered', 'cancelled', 'returned'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
        </select>
        <select className="admin-select" value={filters.payment_status} onChange={e => setFilters(f => ({ ...f, payment_status: e.target.value, page: 1 }))}>
          <option value="">All Payments</option>
          {['pending', 'paid', 'partial', 'failed', 'refunded'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
        </select>
        <input className="admin-select" type="date" value={filters.date_from || ''} onChange={e => setFilters(f => ({ ...f, date_from: e.target.value, page: 1 }))} style={{ padding: '6px 10px' }} />
        <button className="btn-outline-sm" onClick={() => setFilters({ search: '', status: '', payment_status: '', page: 1, per_page: 20 })}>Clear</button>
      </div>

      <div className="admin-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
          <table className="admin-table" style={{ minWidth: '900px' }}>
            <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th style={{ width: '130px' }}>Actions</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><span className="order-num">{o.order_number}</span></td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{o.user?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{o.user?.email}</div>
                  </td>
                  <td><span style={{ fontSize: '0.8rem' }}>{o.items?.length || 0} item(s)</span></td>
                  <td><span style={{ fontWeight: 600 }}>₹{o.total?.toLocaleString()}</span></td>
                  <td>
                    <span className="status-badge" style={{ background: PAY_COLOR[o.payment_status] + '20', color: PAY_COLOR[o.payment_status] || '#6b7280' }}>{o.payment_status}</span>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>{o.payment_method}</div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: STATUS_COLOR[o.status] + '20', color: STATUS_COLOR[o.status] || '#6b7280' }}>{o.status}</span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <Link to={`/admin/orders/${o.id}`}><button className="btn-outline-sm" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>👁️ View</button></Link>
                      <button className="btn-outline-sm" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => { setStatusModal(o); setNewStatus(o.status); }}>✏️ Status</button>
                      <button className="btn-outline-sm" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => downloadInvoice(o.id, o.order_number)}>🧾</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>No orders found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <span>Showing {orders.length} of {meta.total || 0} orders</span>
        <div className="pagination-btns">
          <button className="page-btn" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
          <button className="page-btn" disabled={filters.page >= meta.last_page} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
        </div>
      </div>

      {statusModal && (
        <div className="modal-backdrop" onClick={() => setStatusModal(null)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Update Order Status</h2><button className="modal-close" onClick={() => setStatusModal(null)}>✕</button></div>
            <p style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: '16px' }}>Order: <strong>{statusModal.order_number}</strong></p>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">New Status</label>
              <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {['pending', 'confirmed', 'processing', 'ready', 'dispatched', 'delivered', 'cancelled', 'returned'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-sm" onClick={() => setStatusModal(null)}>Cancel</button>
              <button className="btn-primary-sm" onClick={updateStatus}>Update Status</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;

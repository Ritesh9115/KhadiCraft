import { useState } from 'react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function TrackOrder() {
  const [query, setQuery]   = useState('');
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const FLOW = ['pending', 'confirmed', 'processing', 'ready', 'dispatched', 'delivered'];
  const FLOW_LABELS = { pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Being Prepared', ready: 'Ready', dispatched: 'Shipped', delivered: 'Delivered' };
  const FLOW_ICONS  = { pending: '🕐', confirmed: '✅', processing: '⚙️', ready: '📦', dispatched: '🚚', delivered: '🏠' };
  const STATUS_COLOR = { pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6', ready: '#10b981', dispatched: '#6366f1', delivered: '#059669', cancelled: '#ef4444' };

  const track = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await orderAPI.track(query.trim());
      setOrder(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Check the order number or email.');
    } finally { setLoading(false); }
  };

  const currentIdx = order ? FLOW.indexOf(order.status) : -1;

  return (
    <div style={{ padding: '60px 8%', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', fontWeight: 400, marginBottom: '8px' }}>Track Your Order</h1>
        <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>Enter your order number or registered email to track your order</p>
      </div>

      <form onSubmit={track} style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Order number (e.g. KC-2024-001) or email"
          style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '12px 28px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Tracking...' : '🔍 Track'}
        </button>
      </form>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', color: '#dc2626', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {order && (
        <div style={{ background: '#fff', border: '1px solid #f0ece4', borderRadius: '12px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#1B4332', marginBottom: '4px' }}>{order.order_number}</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>Placed: {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: (STATUS_COLOR[order.status] || '#6b7280') + '20', color: STATUS_COLOR[order.status] || '#6b7280', textTransform: 'capitalize' }}>
              {order.status}
            </span>
          </div>

          {/* Progress */}
          {order.status !== 'cancelled' && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '14px', left: '0', right: '0', height: '2px', background: '#e5e7eb', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '14px', left: '0', height: '2px', background: '#1B4332', zIndex: 0, width: `${Math.max(0, currentIdx / (FLOW.length - 1) * 100)}%`, transition: 'width .4s ease' }} />
                {FLOW.map((s, i) => (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: i <= currentIdx ? '#1B4332' : '#e5e7eb', color: i <= currentIdx ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', marginBottom: '8px', transition: 'background .3s' }}>
                      {i < currentIdx ? '✓' : FLOW_ICONS[s]}
                    </div>
                    <div style={{ fontSize: '0.65rem', textAlign: 'center', color: i === currentIdx ? '#1B4332' : i < currentIdx ? '#374151' : '#9ca3af', fontWeight: i === currentIdx ? 700 : 400, maxWidth: '60px' }}>
                      {FLOW_LABELS[s]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div style={{ borderTop: '1px solid #f0ece4', paddingTop: '20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</div>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f9fafb', fontSize: '0.83rem' }}>
                <span style={{ color: '#374151' }}>{item.product_name} ×{item.quantity}</span>
                <span style={{ fontWeight: 600 }}>₹{item.total?.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 700, fontSize: '0.95rem' }}>
              <span>Total</span><span>₹{order.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Tracking info */}
          {order.tracking_number && (
            <div style={{ marginTop: '20px', padding: '14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600, marginBottom: '4px' }}>🚚 Shipment Tracking</div>
              <div style={{ fontSize: '0.83rem', color: '#374151' }}>{order.courier}: <strong>{order.tracking_number}</strong></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

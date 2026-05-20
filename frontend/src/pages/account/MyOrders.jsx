import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';

const STATUS_COLOR = { pending:'#f59e0b', confirmed:'#3b82f6', processing:'#8b5cf6', ready:'#10b981', dispatched:'#6366f1', delivered:'#059669', cancelled:'#ef4444', returned:'#f97316' };

export default function MyOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    orderAPI.list().then(r => setOrders(r.data.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ padding: '40px 8%', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', fontWeight: 400 }}>My Orders</h1>
        <Link to="/shop" style={{ padding: '10px 20px', background: '#1B4332', color: '#fff', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none' }}>
          + Continue Shopping
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all','pending','confirmed','processing','dispatched','delivered','cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', border: `1px solid ${filter === s ? '#1B4332' : '#e5e7eb'}`, borderRadius: '20px', background: filter === s ? '#1B4332' : '#fff', color: filter === s ? '#fff' : '#6b7280', fontSize: '0.78rem', cursor: 'pointer', textTransform: 'capitalize' }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading
        ? <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading orders...</div>
        : !filtered.length
        ? <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}><div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div><div>No orders found</div></div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(order => (
              <Link
                to={`/account/orders/${order.order_number}`}
                key={order.id}
                style={{ display: 'block', background: '#fff', border: '1px solid #f0ece4', borderRadius: '10px', padding: '20px', textDecoration: 'none', color: '#111', transition: 'all .2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#1B4332'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#f0ece4'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', color: '#1B4332', fontWeight: 600, fontSize: '0.9rem' }}>{order.order_number}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '12px' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '4px', background: (STATUS_COLOR[order.payment_status] || '#6b7280') + '15', color: STATUS_COLOR[order.payment_status] || '#6b7280', textTransform: 'capitalize' }}>💳 {order.payment_status}</span>
                    <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '4px', background: (STATUS_COLOR[order.status] || '#6b7280') + '15', color: STATUS_COLOR[order.status] || '#6b7280', textTransform: 'capitalize' }}>{order.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f9fafb', borderRadius: '6px', padding: '6px 10px' }}>
                      <span style={{ fontSize: '1rem' }}>🏷️</span>
                      <span style={{ fontSize: '0.78rem', color: '#374151' }}>{item.product_name} ×{item.quantity}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', alignSelf: 'center' }}>+{order.items.length - 3} more</div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>₹{order.total?.toLocaleString()}</span>
                  <span style={{ fontSize: '0.78rem', color: '#1B4332', fontWeight: 500 }}>View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}

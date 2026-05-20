import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PAY_COLOR = { pending: '#f59e0b', paid: '#059669', partial: '#3b82f6', failed: '#ef4444', refunded: '#6b7280' };
const FLOW = ['pending', 'confirmed', 'processing', 'ready', 'dispatched', 'delivered'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState({ tracking_number: '', courier: '' });

  useEffect(() => {
    adminAPI.order(id)
      .then(r => setOrder(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    await adminAPI.updateOrderStatus(id, { status });
    setOrder(o => ({ ...o, status }));
    toast.success('Status updated!');
  };

  const saveTracking = async () => {
    await adminAPI.updateTracking(id, tracking);
    setOrder(o => ({ ...o, ...tracking }));
    toast.success('Tracking saved!');
  };

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>;
  if (!order) return <div>Order not found</div>;

  const curIdx = FLOW.indexOf(order.status);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Order #{order.order_number}</h1>
          <p>{new Date(order.created_at).toLocaleString()} · {order.user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-outline-sm" onClick={() => {
            adminAPI.orderInvoice(id).then(r => {
              const u = URL.createObjectURL(new Blob([r.data]));
              const a = document.createElement('a');
              a.href = u;
              a.download = `invoice-${order.order_number}.pdf`;
              a.click();
            });
          }}>🧾 Download Invoice</button>
          <Link to="/admin/orders"><button className="btn-outline-sm">← Back</button></Link>
        </div>
      </div>

      {/* Status flow */}
      <div className="admin-table-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '0.9rem', fontWeight: 600 }}>Order Status Flow</h3>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {FLOW.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', minWidth: '90px' }}>
              {i > 0 && <div style={{ position: 'absolute', left: '-50%', top: '14px', width: '100%', height: '2px', background: curIdx >= i ? '#1B4332' : '#e5e7eb', zIndex: 0 }} />}
              <div
                onClick={() => updateStatus(s)}
                style={{ width: '28px', height: '28px', borderRadius: '50%', background: curIdx > i ? '#1B4332' : curIdx === i ? '#C5933A' : '#e5e7eb', color: curIdx >= i ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, zIndex: 1, position: 'relative', cursor: 'pointer' }}
              >
                {curIdx > i ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: '0.65rem', color: curIdx === i ? '#1B4332' : '#9ca3af', marginTop: '6px', textAlign: 'center', fontWeight: curIdx === i ? 600 : 400, textTransform: 'capitalize' }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Items */}
          <div className="admin-table-card">
            <h3 style={{ marginBottom: '14px', fontSize: '0.9rem', fontWeight: 600 }}>Order Items</h3>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: '50px', height: '50px', background: '#f7f2ea', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🏷️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{item.product_name}</div>
                  {item.variant_info && <div style={{ fontSize: '0.73rem', color: '#9ca3af' }}>{item.variant_info}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>₹{item.total?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>₹{item.price} × {item.quantity}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '14px', padding: '12px', background: '#f9fafb', borderRadius: '6px', display: 'grid', gap: '6px' }}>
              {[['Subtotal', `₹${order.subtotal?.toLocaleString()}`], ['Shipping', order.shipping_charge > 0 ? `₹${order.shipping_charge}` : 'FREE'], ['GST', `₹${order.gst_amount?.toLocaleString()}`], ['Total', `₹${order.total?.toLocaleString()}`]].map(([l, v], i) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: i === 3 ? '1rem' : '0.82rem', fontWeight: i === 3 ? 700 : 400, color: i === 3 ? '#111' : '#6b7280', paddingTop: i === 3 ? '6px' : 0, borderTop: i === 3 ? '1px solid #e5e7eb' : 0 }}>
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking */}
          <div className="admin-table-card">
            <h3 style={{ marginBottom: '14px', fontSize: '0.9rem', fontWeight: 600 }}>Tracking Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input className="form-input" placeholder="AWB / Tracking #" value={tracking.tracking_number || order.tracking_number || ''} onChange={e => setTracking(t => ({ ...t, tracking_number: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Courier</label>
                <select className="form-select" value={tracking.courier || order.courier || ''} onChange={e => setTracking(t => ({ ...t, courier: e.target.value }))}>
                  <option value="">Select Courier</option>
                  {['Delhivery', 'DTDC', 'BlueDart', 'Speed Post', 'FedEx', 'Ekart', 'Xpressbees'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button className="btn-primary-sm" onClick={saveTracking}>💾 Save Tracking</button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="admin-table-card">
            <h3 style={{ marginBottom: '14px', fontSize: '0.9rem', fontWeight: 600 }}>Customer</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1B4332', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{order.user?.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{order.user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{order.user?.email}</div>
              </div>
            </div>
            <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '6px', fontSize: '0.8rem', lineHeight: 1.7, color: '#374151' }}>
              <strong>{order.ship_name}</strong><br />
              {order.ship_phone}<br />
              {order.ship_address}, {order.ship_city}<br />
              {order.ship_state} - {order.ship_pincode}
            </div>
          </div>

          <div className="admin-table-card">
            <h3 style={{ marginBottom: '14px', fontSize: '0.9rem', fontWeight: 600 }}>Payment</h3>
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.83rem' }}>
              {[['Method', order.payment_method?.toUpperCase()], ['Status', order.payment_status], ['Paid', `₹${order.paid_amount?.toLocaleString()}`], ['Remaining', `₹${(order.total - order.paid_amount)?.toLocaleString()}`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}><span>{l}:</span><span style={{ color: '#111', fontWeight: 500 }}>{v}</span></div>
              ))}
            </div>
            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['paid', 'partial', 'failed', 'refunded'].map(s => (
                <button key={s} onClick={() => adminAPI.updatePayStatus(id, { payment_status: s }).then(() => { setOrder(o => ({ ...o, payment_status: s })); toast.success('Payment status updated'); })}
                  style={{ padding: '6px', border: `1px solid ${PAY_COLOR[s] || '#e5e7eb'}20`, borderRadius: '4px', background: order.payment_status === s ? (PAY_COLOR[s] || '#e5e7eb') + '20' : '#fff', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'capitalize', color: order.payment_status === s ? PAY_COLOR[s] : '#6b7280' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-table-card">
            <h3 style={{ marginBottom: '10px', fontSize: '0.9rem', fontWeight: 600 }}>Admin Notes</h3>
            <textarea className="form-textarea" rows={3} placeholder="Internal notes..." defaultValue={order.admin_notes || ''} onBlur={e => adminAPI.addOrderNote?.(id, { note: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );
}

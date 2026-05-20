import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tailorAPI } from '../../services/api';
import { useAuthStore } from '../../context/authStore';

const STATUS_STAGES = ['pending','confirmed','fabric_selected','cutting','stitching','finishing','quality_check','ready'];
const STAGE_COLOR = { cutting:'#f59e0b', stitching:'#8b5cf6', finishing:'#3b82f6', quality_check:'#06b6d4', ready:'#059669' };

export default function TailorDashboard() {
  const [data, setData] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => { tailorAPI.dashboard().then(r => setData(r.data.data)); }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Tailor Dashboard</h1>
          <p>Welcome, {user?.name}! Here are your assigned orders.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Assigned', value: data?.total || 0,        color: '#1B4332', icon: '📦' },
          { label: 'In Progress',    value: data?.in_progress || 0,  color: '#8b5cf6', icon: '✂️' },
          { label: 'Ready Today',    value: data?.ready_today || 0,  color: '#059669', icon: '✅' },
          { label: 'Delayed',        value: data?.delayed || 0,      color: '#ef4444', icon: '⚠️' },
        ].map((c, i) => (
          <div key={i} style={{ background: '#fff', border: `1px solid ${c.color}20`, borderRadius: '10px', padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '1.6rem' }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: c.color }}>{c.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {(data?.orders || []).map(order => (
          <div key={order.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'monospace', color: '#C5933A', fontWeight: 600 }}>{order.custom_order_number}</span>
                <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '4px', background: (STAGE_COLOR[order.status] || '#6b7280') + '15', color: STAGE_COLOR[order.status] || '#6b7280', textTransform: 'capitalize' }}>
                  {order.status?.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>Style: {order.style_type} · Customer: {order.user?.name}</div>
              {order.estimated_ready_date && (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>Due: {new Date(order.estimated_ready_date).toLocaleDateString()}</div>
              )}
            </div>
            <Link to={`/tailor/orders/${order.id}`} style={{ padding: '8px 18px', background: '#1B4332', color: '#fff', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>
              View &amp; Update →
            </Link>
          </div>
        ))}
        {!data?.orders?.length && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✂️</div>
            <div>No orders assigned yet</div>
          </div>
        )}
      </div>
    </div>
  );
}

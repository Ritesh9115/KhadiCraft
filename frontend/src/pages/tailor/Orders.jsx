// src/pages/tailor/Orders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tailorAPI } from '../../services/api';

export default function TailorOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => { tailorAPI.assignedOrders().then(r=>setOrders(r.data.data||[])).finally(()=>setLoading(false)); }, []);

  const STATUS_COLOR = { cutting:'#f59e0b', stitching:'#8b5cf6', finishing:'#3b82f6', quality_check:'#06b6d4', ready:'#059669', pending:'#9ca3af', confirmed:'#3b82f6' };
  const filtered = filter==='all' ? orders : orders.filter(o=>o.status===filter);

  return (
    <div>
      <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.6rem', marginBottom:'20px', fontWeight:400 }}>My Assigned Orders</h1>
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {['all','cutting','stitching','finishing','quality_check','ready'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:'6px 14px', border:`1px solid ${filter===s?'#1B4332':'#e5e7eb'}`, borderRadius:'20px', background:filter===s?'#1B4332':'#fff', color:filter===s?'#fff':'#6b7280', fontSize:'0.78rem', cursor:'pointer', textTransform:'capitalize' }}>{s.replace('_',' ')}</button>
        ))}
      </div>
      {loading ? <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>Loading...</div> : (
        <div style={{ display:'grid', gap:'12px' }}>
          {filtered.map(order => (
            <Link to={`/tailor/orders/${order.id}`} key={order.id} style={{ display:'block', background:'#fff', border:`1px solid ${(STATUS_COLOR[order.status]||'#e5e7eb')}30`, borderLeft:`4px solid ${STATUS_COLOR[order.status]||'#e5e7eb'}`, borderRadius:'10px', padding:'18px', textDecoration:'none', color:'#111', transition:'all .2s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                    <span style={{ fontFamily:'monospace', color:'#C5933A', fontWeight:600 }}>{order.custom_order_number}</span>
                    <span style={{ fontSize:'0.72rem', padding:'3px 8px', borderRadius:'4px', background:(STATUS_COLOR[order.status]||'#6b7280')+'20', color:STATUS_COLOR[order.status]||'#6b7280', textTransform:'capitalize' }}>{order.status?.replace('_',' ')}</span>
                  </div>
                  <div style={{ fontSize:'0.82rem', color:'#6b7280' }}>👕 {order.style_type?.replace('_',' ')} · 👤 {order.user?.name}</div>
                  {order.estimated_ready_date && <div style={{ fontSize:'0.75rem', color:'#9ca3af', marginTop:'3px' }}>Due: {new Date(order.estimated_ready_date).toLocaleDateString()}</div>}
                </div>
                <span style={{ fontSize:'0.78rem', color:'#1B4332', fontWeight:500 }}>Update Stage →</span>
              </div>
            </Link>
          ))}
          {!filtered.length && <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af', background:'#fff', borderRadius:'10px', border:'1px solid #e5e7eb' }}><div style={{ fontSize:'2rem', marginBottom:'10px' }}>✂️</div>No orders in this stage</div>}
        </div>
      )}
    </div>
  );
}

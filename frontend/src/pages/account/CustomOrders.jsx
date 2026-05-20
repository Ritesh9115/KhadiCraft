// src/pages/account/CustomOrders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customOrderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STAGE_COLOR = {
  pending:'#9ca3af', confirmed:'#3b82f6', fabric_selected:'#f97316',
  measurement_received:'#10b981', cutting:'#f59e0b', stitching:'#8b5cf6',
  finishing:'#3b82f6', quality_check:'#06b6d4', ready:'#059669',
  dispatched:'#6366f1', delivered:'#059669', cancelled:'#ef4444'
};
const STAGE_LABEL = {
  pending:'Pending', confirmed:'Confirmed', fabric_selected:'Fabric Selected',
  measurement_received:'Measurements In', cutting:'Cutting', stitching:'Stitching',
  finishing:'Finishing', quality_check:'Quality Check', ready:'Ready for Pickup',
  dispatched:'Dispatched', delivered:'Delivered', cancelled:'Cancelled'
};

export default function CustomOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    customOrderAPI.list()
      .then(r => setOrders(r.data.data || []))
      .catch(() => toast.error('Failed to load custom orders'))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this custom order?')) return;
    try {
      await customOrderAPI.cancel(id);
      setOrders(o => o.map(x => x.id === id ? { ...x, status:'cancelled' } : x));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel at this stage');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ padding:'40px 8%', maxWidth:'900px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:400, marginBottom:'4px' }}>Custom Orders</h1>
          <p style={{ color:'#6b7280', fontSize:'0.84rem' }}>{orders.length} custom tailoring order{orders.length!==1?'s':''}</p>
        </div>
        <Link to="/custom-tailoring" style={{ padding:'10px 22px', background:'#C5933A', color:'#fff', borderRadius:'4px', fontSize:'0.82rem', fontWeight:500, textDecoration:'none' }}>
          + New Custom Order
        </Link>
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {['all','pending','confirmed','cutting','stitching','ready','delivered','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding:'6px 14px', border:`1.5px solid ${filter===s?'#1B4332':'#e5e7eb'}`, borderRadius:'20px', background:filter===s?'#1B4332':'#fff', color:filter===s?'#fff':'#6b7280', fontSize:'0.78rem', cursor:'pointer', textTransform:'capitalize', fontWeight:filter===s?500:400, transition:'all .2s' }}>
            {s === 'all' ? 'All Orders' : STAGE_LABEL[s] || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>Loading custom orders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px', background:'#fff', borderRadius:'10px', border:'1px solid #f0ece4', color:'#9ca3af' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>✂️</div>
          <div style={{ fontSize:'1.1rem', color:'#374151', marginBottom:'8px' }}>No custom orders found</div>
          <p style={{ fontSize:'0.85rem', marginBottom:'20px' }}>Place a custom tailoring order to get a garment stitched to your exact measurements.</p>
          <Link to="/custom-tailoring" style={{ padding:'11px 28px', background:'#1B4332', color:'#fff', borderRadius:'4px', textDecoration:'none', fontSize:'0.85rem', fontWeight:500 }}>
            Place Custom Order →
          </Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {filtered.map(order => (
            <div key={order.id} style={{ background:'#fff', border:'1px solid #f0ece4', borderRadius:'10px', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', background:'#fafafa', borderBottom:'1px solid #f0ece4', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px' }}>
                <div style={{ display:'flex', gap:'14px', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:'0.68rem', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'1px' }}>Order</div>
                    <div style={{ fontFamily:'monospace', fontWeight:700, color:'#C5933A', fontSize:'0.88rem' }}>{order.custom_order_number}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:'0.68rem', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'1px' }}>Style</div>
                    <div style={{ fontSize:'0.85rem', fontWeight:500, textTransform:'capitalize' }}>{order.style_type?.replace(/_/g,' ')}</div>
                  </div>
                  {order.final_price && (
                    <div>
                      <div style={{ fontSize:'0.68rem', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'1px' }}>Price</div>
                      <div style={{ fontSize:'0.88rem', fontWeight:700, color:'#1B4332' }}>₹{(+order.final_price).toLocaleString()}</div>
                    </div>
                  )}
                </div>
                <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'0.72rem', fontWeight:600, background:(STAGE_COLOR[order.status]||'#6b7280')+'20', color:STAGE_COLOR[order.status]||'#6b7280' }}>
                  {STAGE_LABEL[order.status]||order.status}
                </span>
              </div>

              <div style={{ padding:'14px 18px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'10px', marginBottom:'14px' }}>
                  {[
                    ['🧶 Fabric',    order.fabric_name||'—'],
                    ['🎨 Color',     order.fabric_color||'—'],
                    ['📅 Placed',    new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})],
                    ['📅 Est. Ready',order.estimated_ready_date ? new Date(order.estimated_ready_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—'],
                  ].map(([l,v]) => (
                    <div key={l} style={{ padding:'8px 10px', background:'#f9fafb', borderRadius:'6px' }}>
                      <div style={{ fontSize:'0.68rem', color:'#9ca3af', marginBottom:'2px' }}>{l.split(' ')[0]} {l.split(' ')[1]}</div>
                      <div style={{ fontSize:'0.82rem', fontWeight:500 }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Stage Progress Mini */}
                {!['cancelled','delivered'].includes(order.status) && (
                  <div style={{ height:'4px', background:'#f3f4f6', borderRadius:'4px', marginBottom:'14px', overflow:'hidden' }}>
                    {(() => {
                      const stages = ['pending','confirmed','fabric_selected','measurement_received','cutting','stitching','finishing','quality_check','ready','dispatched','delivered'];
                      const pct = ((stages.indexOf(order.status)+1)/stages.length)*100;
                      return <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#1B4332,#C5933A)', borderRadius:'4px', transition:'width .5s' }}/>;
                    })()}
                  </div>
                )}

                <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                  <Link to={`/account/custom-orders/${order.custom_order_number}`} style={{ padding:'7px 16px', background:'#1B4332', color:'#fff', borderRadius:'4px', fontSize:'0.78rem', fontWeight:500, textDecoration:'none' }}>
                    View Details →
                  </Link>
                  {['pending','confirmed'].includes(order.status) && (
                    <button onClick={() => cancel(order.id)} style={{ padding:'7px 14px', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'4px', fontSize:'0.78rem', background:'none', cursor:'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

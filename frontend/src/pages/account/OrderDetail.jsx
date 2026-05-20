// src/pages/account/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  pending:'#f59e0b',confirmed:'#3b82f6',processing:'#8b5cf6',
  ready:'#10b981',dispatched:'#6366f1',delivered:'#059669',
  cancelled:'#ef4444',returned:'#f97316'
};

export default function OrderDetail() {
  const { number } = useParams();
  const [order,   setOrder]   = useState(null);
  const [stages,  setStages]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderAPI.show(number),
      orderAPI.track(number).catch(() => ({ data: { data: { timeline: [] } } }))
    ]).then(([oRes, tRes]) => {
      setOrder(oRes.data.data);
      const track = tRes?.data?.data || {};
      setStages(buildStages(track));
    }).catch(() => toast.error('Failed to load order'))
    .finally(() => setLoading(false));
  }, [number]);

  if (loading) return <LoadingSpinner/>;
  if (!order)  return <NotFound msg="Order not found" back="/account/orders"/>;

  const addr = order.shipping_address;

  return (
    <div style={{ padding:'40px 8%', maxWidth:'900px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={S.h1}>Order #{order.order_number}</h1>
          <p style={S.sub}>{new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ padding:'5px 14px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600, background:(STATUS_COLOR[order.status]||'#6b7280')+'20', color:STATUS_COLOR[order.status]||'#6b7280', textTransform:'capitalize' }}>{order.status}</span>
          <Link to="/account/orders" style={S.backBtn}>← Back</Link>
        </div>
      </div>

      {stages.length > 0 && !['cancelled','returned'].includes(order.status) && (
        <div style={S.card}>
          <h3 style={S.cardTitle}>📍 Order Tracking</h3>
          <div style={{ display:'flex', overflowX:'auto', paddingBottom:'4px' }}>
            {stages.map((s,i) => (
              <div key={s.key} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative', minWidth:'72px' }}>
                {i>0 && <div style={{ position:'absolute', left:'-50%', top:'13px', width:'100%', height:'2px', background:s.completed?'#1B4332':'#e5e7eb', zIndex:0 }}/>}
                <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:s.completed?'#1B4332':s.current?'#C5933A':'#e5e7eb', color:(s.completed||s.current)?'#fff':'#9ca3af', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, zIndex:1, position:'relative' }}>
                  {s.completed ? '✓' : i+1}
                </div>
                <div style={{ fontSize:'0.6rem', color:s.current?'#C5933A':'#9ca3af', marginTop:'5px', textAlign:'center', fontWeight:s.current?700:400, lineHeight:1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'18px', alignItems:'start' }}>
        <div style={S.card}>
          <h3 style={S.cardTitle}>📦 Items Ordered</h3>
          {(order.items||[]).map(item => (
            <div key={item.id} style={{ display:'flex', gap:'12px', alignItems:'center', padding:'11px 0', borderBottom:'1px solid #f3f4f6' }}>
              <div style={{ width:'52px', height:'56px', background:'#f7f2ea', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0, overflow:'hidden' }}>
                {item.product?.thumbnail ? <img src={`http://localhost:8000/storage/${item.product.thumbnail}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : '🏷️'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:500, fontSize:'0.86rem' }}>{item.product?.name || item.product_name}</div>
                {item.variant?.name && <div style={{ fontSize:'0.72rem', color:'#9ca3af' }}>{item.variant.name}</div>}
                <div style={{ fontSize:'0.73rem', color:'#9ca3af', marginTop:'2px' }}>₹{item.price?.toLocaleString()} × {item.quantity}</div>
              </div>
              <div style={{ fontWeight:700, fontSize:'0.9rem', color:'#1B4332' }}>₹{item.total?.toLocaleString()}</div>
            </div>
          ))}
          <div style={{ marginTop:'14px', background:'#f9fafb', borderRadius:'8px', padding:'14px', display:'grid', gap:'6px' }}>
            {[
              ['Subtotal', `₹${(order.subtotal||0).toLocaleString()}`],
              ['Shipping', (order.shipping_cost||0)>0 ? `₹${order.shipping_cost}` : 'FREE 🎉'],
              ['Tax (18% GST)', `₹${(order.tax||0).toLocaleString()}`],
              ['Grand Total', `₹${(order.total||0).toLocaleString()}`],
            ].map(([l,v],i) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:i===3?'1rem':'0.82rem', fontWeight:i===3?700:400, color:i===3?'#1B4332':'#6b7280', paddingTop:i===3?'6px':0, borderTop:i===3?'1px solid #e5e7eb':'none' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gap:'14px' }}>
          <div style={S.card}>
            <h3 style={S.cardTitle}>📍 Delivery Address</h3>
            <div style={{ fontSize:'0.82rem', lineHeight:1.8, color:'#374151' }}>
              {addr ? (
                <>
                  <strong>{addr.full_name}</strong><br/>
                  📞 {addr.phone}<br/>
                  {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br/>
                  {addr.city}, {addr.state} — {addr.pincode}
                </>
              ) : <span style={{ color:'#9ca3af' }}>Address not on record</span>}
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.cardTitle}>💳 Payment</h3>
            <div style={{ display:'grid', gap:'6px', fontSize:'0.82rem' }}>
              {[
                ['Method', order.payment_method?.toUpperCase()],
                ['Status', order.payment_status],
                ['Total', `₹${(order.total||0).toLocaleString()}`],
              ].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', color:'#6b7280', paddingBottom:'5px', borderBottom:'1px solid #f3f4f6' }}>
                  <span>{l}</span>
                  <span style={{ fontWeight:500, color:'#111', textTransform:'capitalize' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {order.tracking_number && (
            <div style={{ ...S.card, background:'#f0fdf4', borderColor:'#bbf7d0' }}>
              <h3 style={{ ...S.cardTitle, color:'#166534' }}>🚚 Shipment Tracking</h3>
              <div style={{ fontSize:'0.82rem', color:'#166534' }}>
                <div style={{ marginBottom:'4px' }}>{order.courier || 'Courier'}</div>
                <div style={{ fontFamily:'monospace', fontWeight:700, letterSpacing:'1px' }}>{order.tracking_number}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildStages(track) {
  if (Array.isArray(track?.stages)) return track.stages;
  const timeline = Array.isArray(track?.timeline) ? track.timeline : [];
  if (!timeline.length) return [];
  const lastStatus = timeline[timeline.length - 1]?.status;
  return timeline.map((t, i) => ({
    key: t.status ?? String(i),
    label: t.title ?? t.status ?? `Stage ${i + 1}`,
    completed: Boolean(t.is_completed),
    current: t.status === (track.status ?? lastStatus),
  }));
}

const S = {
  h1:       { fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:400, marginBottom:'4px' },
  sub:      { color:'#6b7280', fontSize:'0.83rem' },
  card:     { background:'#fff', border:'1px solid #f0ece4', borderRadius:'10px', padding:'18px' },
  cardTitle:{ fontFamily:'Georgia,serif', fontSize:'0.95rem', fontWeight:500, marginBottom:'14px' },
  backBtn:  { padding:'7px 16px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'0.8rem', color:'#6b7280', textDecoration:'none' },
};

function LoadingSpinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ textAlign:'center', color:'#9ca3af' }}>
        <div style={{ width:'32px', height:'32px', border:'3px solid #e5e7eb', borderTopColor:'#1B4332', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 12px' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Loading...
      </div>
    </div>
  );
}

function NotFound({ msg, back }) {
  return (
    <div style={{ textAlign:'center', padding:'80px', color:'#9ca3af' }}>
      <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🔍</div>
      <div style={{ marginBottom:'14px' }}>{msg}</div>
      <Link to={back} style={{ color:'#1B4332' }}>← Go Back</Link>
    </div>
  );
}

// src/pages/account/CustomOrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customOrderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STAGES = ['pending','confirmed','fabric_selected','measurement_received','cutting','stitching','finishing','quality_check','ready','dispatched','delivered'];
const STAGE_LABEL = { pending:'Order Placed', confirmed:'Confirmed', fabric_selected:'Fabric Selected', measurement_received:'Measurements Received', cutting:'Cutting Started', stitching:'Stitching', finishing:'Finishing', quality_check:'Quality Check', ready:'Ready for Pickup', dispatched:'Dispatched', delivered:'Delivered' };
const STAGE_ICON  = { pending:'📦', confirmed:'✅', fabric_selected:'🧶', measurement_received:'📏', cutting:'✂️', stitching:'🧵', finishing:'🎨', quality_check:'🔍', ready:'🎁', dispatched:'🚚', delivered:'🏠' };
const STAGE_COLOR = { pending:'#9ca3af', confirmed:'#3b82f6', fabric_selected:'#f97316', measurement_received:'#10b981', cutting:'#f59e0b', stitching:'#8b5cf6', finishing:'#3b82f6', quality_check:'#06b6d4', ready:'#059669', dispatched:'#6366f1', delivered:'#059669', cancelled:'#ef4444' };

const MEASURE_FIELDS = [
  {key:'chest',label:'Chest'},{key:'waist',label:'Waist'},{key:'hips',label:'Hips'},
  {key:'shoulder',label:'Shoulder'},{key:'shirt_length',label:'Shirt Length'},{key:'pant_length',label:'Pant Length'},
  {key:'sleeve_length',label:'Sleeve'},{key:'neck',label:'Neck'},{key:'thigh',label:'Thigh'},{key:'inseam',label:'Inseam'},
];

export default function CustomOrderDetail() {
  const { number } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    customOrderAPI.show(number)
      .then(r => setOrder(r.data.data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [number]);

  const uploadRef = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await customOrderAPI.uploadReference(order.id, fd);
      toast.success('Reference image uploaded!');
      const r = await customOrderAPI.show(number);
      setOrder(r.data.data);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ textAlign:'center', color:'#9ca3af' }}>
        <div style={{ width:'32px', height:'32px', border:'3px solid #e5e7eb', borderTopColor:'#1B4332', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 12px' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Loading...
      </div>
    </div>
  );

  if (!order) return (
    <div style={{ textAlign:'center', padding:'80px', color:'#9ca3af' }}>
      <div style={{ fontSize:'3rem', marginBottom:'12px' }}>✂️</div>
      <div style={{ marginBottom:'14px' }}>Order not found.</div>
      <Link to="/account/custom-orders" style={{ color:'#1B4332' }}>← Back to Custom Orders</Link>
    </div>
  );

  const curIdx = STAGES.indexOf(order.status);
  const sc = STAGE_COLOR[order.status] || '#6b7280';
  const measures = MEASURE_FIELDS.filter(f => order[f.key]);

  return (
    <div style={{ padding:'40px 8%', maxWidth:'900px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px', flexWrap:'wrap' }}>
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.6rem', fontWeight:400 }}>{order.custom_order_number}</h1>
            <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'0.73rem', fontWeight:600, background:sc+'20', color:sc, textTransform:'capitalize' }}>{STAGE_LABEL[order.status]||order.status}</span>
          </div>
          <p style={{ color:'#6b7280', fontSize:'0.83rem' }}>
            {order.style_type?.replace(/_/g,' ')} · Placed {new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
          </p>
        </div>
        <Link to="/account/custom-orders" style={{ padding:'8px 16px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'0.8rem', color:'#6b7280', textDecoration:'none' }}>← Back</Link>
      </div>

      {/* Stage Timeline */}
      {order.status !== 'cancelled' && (
        <div style={{ background:'#fff', border:'1px solid #f0ece4', borderRadius:'10px', padding:'20px', marginBottom:'20px' }}>
          <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1rem', fontWeight:500, marginBottom:'18px' }}>📍 Order Progress</h3>
          <div style={{ display:'flex', gap:0, overflowX:'auto', paddingBottom:'8px' }}>
            {STAGES.map((s,i) => {
              const done = i <= curIdx;
              const cur  = s === order.status;
              return (
                <div key={s} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative', minWidth:'70px' }}>
                  {i > 0 && <div style={{ position:'absolute', left:'-50%', top:'16px', width:'100%', height:'2px', background:done?'#1B4332':'#e5e7eb', zIndex:0 }}/>}
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:done?'#1B4332':cur?'#C5933A':'#f3f4f6', color:done||cur?'#fff':'#9ca3af', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', zIndex:1, position:'relative', border:cur?'3px solid #C5933A':'none', transition:'all .3s' }}>
                    {done ? (cur ? STAGE_ICON[s]||'✓' : '✓') : STAGE_ICON[s]||(i+1)}
                  </div>
                  <div style={{ fontSize:'0.58rem', color:cur?'#C5933A':done?'#1B4332':'#9ca3af', marginTop:'6px', textAlign:'center', fontWeight:cur?700:done?500:400, lineHeight:1.3 }}>
                    {STAGE_LABEL[s]}
                  </div>
                </div>
              );
            })}
          </div>
          {order.estimated_ready_date && !['ready','dispatched','delivered'].includes(order.status) && (
            <div style={{ marginTop:'14px', padding:'10px 14px', background:'#fffbeb', borderRadius:'6px', fontSize:'0.8rem', color:'#92400e', display:'flex', gap:'8px' }}>
              <span>📅</span>
              <span>Estimated ready by: <strong>{new Date(order.estimated_ready_date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</strong></span>
            </div>
          )}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'18px', alignItems:'start' }}>
        <div style={{ display:'grid', gap:'16px' }}>

          {/* Measurements */}
          {measures.length > 0 && (
            <div style={{ background:'#fff', border:'1px solid #f0ece4', borderRadius:'10px', padding:'18px' }}>
              <h3 style={{ fontFamily:'Georgia,serif', fontSize:'0.95rem', fontWeight:500, marginBottom:'14px' }}>📏 Your Measurements ({order.measurement_unit||'inches'})</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:'8px' }}>
                {measures.map(f => (
                  <div key={f.key} style={{ background:'#f9fafb', borderRadius:'6px', padding:'10px', textAlign:'center' }}>
                    <div style={{ fontSize:'0.62rem', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>{f.label}</div>
                    <div style={{ fontWeight:700, fontSize:'1rem', color:'#1B4332' }}>{order[f.key]}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {order.special_instructions && (
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'10px', padding:'16px' }}>
              <h3 style={{ fontSize:'0.88rem', fontWeight:600, color:'#92400e', marginBottom:'8px' }}>📋 Your Instructions</h3>
              <p style={{ fontSize:'0.85rem', color:'#78350f', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{order.special_instructions}</p>
            </div>
          )}

          {/* Reference Image */}
          <div style={{ background:'#fff', border:'1px solid #f0ece4', borderRadius:'10px', padding:'18px' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'0.95rem', fontWeight:500, marginBottom:'12px' }}>🖼️ Reference Image</h3>
            {order.reference_image ? (
              <div>
                <img src={`http://localhost:8000/storage/${order.reference_image}`} alt="Reference" style={{ maxWidth:'100%', maxHeight:'250px', borderRadius:'8px', border:'1px solid #e5e7eb', objectFit:'contain' }}/>
                {!['delivered','cancelled'].includes(order.status) && (
                  <label style={{ display:'inline-block', marginTop:'10px', padding:'7px 16px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'0.78rem', cursor:'pointer', color:'#6b7280' }}>
                    🔄 Change Image
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={uploadRef}/>
                  </label>
                )}
              </div>
            ) : (
              <div>
                <p style={{ fontSize:'0.82rem', color:'#9ca3af', marginBottom:'12px' }}>No reference image uploaded yet. Upload one to help our tailor understand your style preference.</p>
                {!['delivered','cancelled'].includes(order.status) && (
                  <label style={{ display:'inline-block', padding:'9px 20px', background:'#1B4332', color:'#fff', borderRadius:'6px', fontSize:'0.82rem', cursor:'pointer', fontWeight:500 }}>
                    {uploading ? '⏳ Uploading...' : '📷 Upload Reference Image'}
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={uploadRef} disabled={uploading}/>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Tailor Notes */}
          {order.tailor_notes && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'16px' }}>
              <h3 style={{ fontSize:'0.88rem', fontWeight:600, color:'#166534', marginBottom:'8px' }}>✂️ Tailor Update</h3>
              <p style={{ fontSize:'0.83rem', color:'#166534', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{order.tailor_notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:'grid', gap:'14px' }}>
          <div style={{ background:'#fff', border:'1px solid #f0ece4', borderRadius:'10px', padding:'16px' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'0.9rem', fontWeight:500, marginBottom:'12px' }}>📦 Order Details</h3>
            {[
              ['Style',      order.style_type?.replace(/_/g,' ')],
              ['Fabric',     order.fabric_name||'—'],
              ['Color',      order.fabric_color||'—'],
              ['Est. Price', order.estimated_price?`~₹${(+order.estimated_price).toLocaleString()}`:'Pending'],
              ['Final Price',order.final_price?`₹${(+order.final_price).toLocaleString()}`:'Not set yet'],
              ['Tailor',     order.assigned_tailor?.name||'Being assigned'],
              ['Due Date',   order.estimated_ready_date?new Date(order.estimated_ready_date).toLocaleDateString('en-IN'):'—'],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', gap:'8px', paddingBottom:'8px', marginBottom:'8px', borderBottom:'1px solid #f3f4f6', fontSize:'0.8rem' }}>
                <span style={{ color:'#9ca3af', flexShrink:0 }}>{l}</span>
                <span style={{ fontWeight:500, textAlign:'right', textTransform:'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Price Info */}
          {order.final_price && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'16px' }}>
              <div style={{ fontSize:'0.72rem', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px' }}>Final Price</div>
              <div style={{ fontFamily:'Georgia,serif', fontSize:'1.6rem', color:'#1B4332', fontWeight:500 }}>₹{(+order.final_price).toLocaleString()}</div>
            </div>
          )}

          {/* Help */}
          <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'16px', fontSize:'0.8rem' }}>
            <div style={{ fontWeight:600, marginBottom:'8px' }}>Need Help?</div>
            <div style={{ color:'#6b7280', lineHeight:1.7 }}>
              📞 +91 78300 57297<br/>
              ✉️ hello@khadicraft.in<br/>
              <span style={{ fontSize:'0.72rem' }}>Mon–Sat, 10am–7pm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

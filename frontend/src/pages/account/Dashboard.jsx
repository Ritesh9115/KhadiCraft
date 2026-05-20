// ============================================================
// src/pages/account/Dashboard.jsx
// ============================================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, customOrderAPI, appointmentAPI, profileAPI, measurementAPI } from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import { AdminOnly, TailorOnly } from '../../components/ui/RoleNavigation';
import toast from 'react-hot-toast';

export function AccountDashboard() {
  const { user } = useAuthStore();
  const [orders,  setOrders]  = useState([]);
  const [custom,  setCustom]  = useState([]);
  const [apts,    setApts]    = useState([]);
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try { const r = await orderAPI.list(); setOrders(r.data?.data?.data?.slice(0,3) || r.data?.data?.slice(0,3) || []); } catch {}
      try { const r = await customOrderAPI.list(); setCustom(r.data?.data?.slice(0,3) || []); } catch {}
      try { const r = await appointmentAPI.list(); setApts(r.data?.data?.slice(0,3) || []); } catch {}
      try { const r = await profileAPI.getNotifications(); setNotifs((r.data?.data?.data || r.data?.data || []).filter(x=>!x.is_read).slice(0,5)); } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const STATUS_COLOR = { pending:'#f59e0b', confirmed:'#3b82f6', processing:'#8b5cf6', ready:'#10b981', dispatched:'#6366f1', delivered:'#059669', cancelled:'#ef4444' };

  return (
    <div style={{ padding: '40px 8%', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', borderRadius: '12px', padding: '28px 32px', marginBottom: '28px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Welcome back</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', fontWeight: 400, marginBottom: '6px' }}>{user?.name} 👋</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Manage your orders, measurements, and appointments</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <AdminOnly>
            <Link to="/admin" style={{ padding: '10px 20px', background: '#C5933A', color: '#fff', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none' }}>Admin Panel</Link>
          </AdminOnly>
          <TailorOnly>
            <Link to="/tailor" style={{ padding: '10px 20px', background: '#8B5CF6', color: '#fff', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none' }}>Tailor Panel</Link>
          </TailorOnly>
          <Link to="/shop" style={{ padding: '10px 20px', background: '#C5933A', color: '#fff', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none' }}>Shop Now</Link>
          <Link to="/custom-tailoring" style={{ padding: '10px 20px', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '4px', fontSize: '0.82rem', textDecoration: 'none' }}>Custom Order</Link>
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'28px' }}>
        {[
          { label:'My Orders',     icon:'📦', link:'/account/orders',        count:orders.length, color:'#1B4332', bg:'#dcfce7' },
          { label:'Custom Orders', icon:'✂️', link:'/account/custom-orders', count:custom.length, color:'#92400e', bg:'#fef3c7' },
          { label:'Appointments',  icon:'📅', link:'/account/appointments',  count:apts.length,   color:'#1e40af', bg:'#dbeafe' },
          { label:'Measurements',  icon:'📏', link:'/account/measurements',  count:null,          color:'#6b21a8', bg:'#f3e8ff' },
          { label:'Addresses',     icon:'📍', link:'/account/addresses',     count:null,          color:'#9f1239', bg:'#ffe4e6' },
          { label:'Notifications', icon:'🔔', link:'/account/notifications', count:notifs.length, color:'#b45309', bg:'#fef9c3', badge:true },
        ].map(item => (
          <Link key={item.link} to={item.link}
            style={{ background:'#fff', border:'1.5px solid #f0ece4', borderRadius:'12px', padding:'20px 16px', textAlign:'center', textDecoration:'none', color:'#111', transition:'all .2s', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}
            onMouseOver={e=>{e.currentTarget.style.borderColor=item.color;e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';}}
            onMouseOut={e=>{e.currentTarget.style.borderColor='#f0ece4';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
            <div style={{ width:'48px',height:'48px',borderRadius:'12px',background:item.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',position:'relative' }}>
              {item.icon}
              {item.badge && item.count > 0 && <span style={{ position:'absolute',top:'-5px',right:'-5px',background:'#ef4444',color:'#fff',borderRadius:'50%',width:'18px',height:'18px',fontSize:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700 }}>{item.count}</span>}
            </div>
            <div>
              <div style={{ fontSize:'0.82rem',fontWeight:600,color:'#1a1a18',marginBottom:'2px' }}>{item.label}</div>
              {item.count !== null && <div style={{ fontSize:'0.72rem',color:item.color,fontWeight:500 }}>{item.count} {item.count===1?'item':'items'}</div>}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        {/* Recent Orders */}
        <div style={{ background:'#fff', border:'1px solid #f0ece4', borderRadius:'12px', padding:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.05rem', fontWeight:500 }}>Recent Orders</h3>
            <Link to="/account/orders" style={{ fontSize:'0.78rem', color:'#1B4332' }}>View All →</Link>
          </div>
          {loading ? <div style={{ color:'#9ca3af', fontSize:'0.85rem' }}>Loading...</div> :
          orders.length ? orders.map(o => (
            <Link to={`/account/orders/${o.order_number}`} key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f7f2ea', textDecoration:'none', color:'#111' }}>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:500, fontFamily:'monospace', color:'#1B4332' }}>{o.order_number}</div>
                <div style={{ fontSize:'0.73rem', color:'#9ca3af', marginTop:'2px' }}>{new Date(o.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:600, fontSize:'0.88rem' }}>₹{o.total?.toLocaleString()}</div>
                <span style={{ fontSize:'0.68rem', padding:'2px 7px', borderRadius:'4px', background:(STATUS_COLOR[o.status]||'#6b7280')+'20', color:STATUS_COLOR[o.status]||'#6b7280', textTransform:'capitalize' }}>{o.status}</span>
              </div>
            </Link>
          )) : <div style={{ color:'#9ca3af', fontSize:'0.85rem', textAlign:'center', padding:'24px' }}>No orders yet.<br/><Link to="/shop" style={{ color:'#1B4332' }}>Start shopping →</Link></div>}
        </div>

        {/* Custom Orders */}
        <div style={{ background:'#fff', border:'1px solid #f0ece4', borderRadius:'12px', padding:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.05rem', fontWeight:500 }}>Custom Orders</h3>
            <Link to="/account/custom-orders" style={{ fontSize:'0.78rem', color:'#1B4332' }}>View All →</Link>
          </div>
          {loading ? <div style={{ color:'#9ca3af', fontSize:'0.85rem' }}>Loading...</div> :
          custom.length ? custom.map(o => (
            <Link to={`/account/custom-orders/${o.id}`} key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f7f2ea', textDecoration:'none', color:'#111' }}>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:500, fontFamily:'monospace', color:'#C5933A' }}>{o.custom_order_number || `#${o.id}`}</div>
                <div style={{ fontSize:'0.73rem', color:'#9ca3af', marginTop:'2px', textTransform:'capitalize' }}>{o.style_type?.replace('_',' ') || 'Custom Tailoring'}</div>
              </div>
              <span style={{ fontSize:'0.68rem', padding:'2px 8px', borderRadius:'4px', background:'#fef3c7', color:'#92400e', textTransform:'capitalize' }}>{o.status?.replace('_',' ')}</span>
            </Link>
          )) : <div style={{ color:'#9ca3af', fontSize:'0.85rem', textAlign:'center', padding:'24px' }}>No custom orders yet.<br/><Link to="/custom-tailoring" style={{ color:'#C5933A', fontWeight:500 }}>Place one →</Link></div>}
        </div>

        {/* Appointments */}
        <div style={{ background:'#fff', border:'1px solid #f0ece4', borderRadius:'12px', padding:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.05rem', fontWeight:500 }}>Appointments</h3>
            <Link to="/book-appointment" style={{ fontSize:'0.78rem', color:'#1B4332', fontWeight:500 }}>+ Book →</Link>
          </div>
          {loading ? <div style={{ color:'#9ca3af', fontSize:'0.85rem' }}>Loading...</div> :
          apts.length ? apts.map(a => (
            <div key={a.id} style={{ display:'flex', gap:'12px', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f7f2ea' }}>
              <div style={{ width:'40px', height:'40px', background:'#1B4332', borderRadius:'8px', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:600, flexShrink:0 }}>
                <span style={{ fontSize:'1rem', lineHeight:1 }}>{new Date(a.appointment_date).getDate()}</span>
                <span>{new Date(a.appointment_date).toLocaleDateString('en',{month:'short'})}</span>
              </div>
              <div>
                <div style={{ fontSize:'0.83rem', fontWeight:500, textTransform:'capitalize' }}>{a.purpose}</div>
                <div style={{ fontSize:'0.73rem', color:'#9ca3af' }}>{a.time_slot} · {a.type?.replace('_',' ')}</div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:'0.68rem', padding:'2px 8px', borderRadius:'4px', background:a.status==='confirmed'?'#dcfce7':'#fef3c7', color:a.status==='confirmed'?'#166534':'#92400e', textTransform:'capitalize' }}>{a.status}</span>
            </div>
          )) : <div style={{ color:'#9ca3af', fontSize:'0.85rem', textAlign:'center', padding:'24px' }}>No appointments booked.<br/><Link to="/book-appointment" style={{ color:'#1B4332', fontWeight:500 }}>Book one →</Link></div>}
        </div>

        {/* Notifications */}
        <div style={{ background:'#fff', border:'1px solid #f0ece4', borderRadius:'12px', padding:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.05rem', fontWeight:500 }}>Notifications {notifs.length > 0 && <span style={{ background:'#ef4444', color:'#fff', borderRadius:'50%', padding:'1px 6px', fontSize:'0.65rem', marginLeft:'6px' }}>{notifs.length}</span>}</h3>
            <Link to="/account/notifications" style={{ fontSize:'0.78rem', color:'#1B4332' }}>View All →</Link>
          </div>
          {loading ? <div style={{ color:'#9ca3af', fontSize:'0.85rem' }}>Loading...</div> :
          notifs.length ? notifs.map(n => (
            <div key={n.id} style={{ padding:'10px 0', borderBottom:'1px solid #f7f2ea' }}>
              <div style={{ fontSize:'0.82rem', fontWeight:500, marginBottom:'2px' }}>{n.title}</div>
              <div style={{ fontSize:'0.75rem', color:'#6b7280', lineHeight:1.5 }}>{n.message}</div>
            </div>
          )) : <div style={{ color:'#9ca3af', fontSize:'0.85rem', textAlign:'center', padding:'24px' }}>🔔<br/>No new notifications</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// src/pages/account/MyOrders.jsx
// ============================================================
export function MyOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => { orderAPI.list().then(r => setOrders(r.data.data.data || [])).finally(() => setLoading(false)); }, []);

  const STATUS_COLOR = { pending:'#f59e0b', confirmed:'#3b82f6', processing:'#8b5cf6', ready:'#10b981', dispatched:'#6366f1', delivered:'#059669', cancelled:'#ef4444', returned:'#f97316' };
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ padding: '40px 8%', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', fontWeight: 400 }}>My Orders</h1>
        <Link to="/shop" style={{ padding: '10px 20px', background: '#1B4332', color: '#fff', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none' }}>+ Continue Shopping</Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all','pending','confirmed','processing','dispatched','delivered','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 14px', border: `1px solid ${filter===s?'#1B4332':'#e5e7eb'}`, borderRadius: '20px', background: filter===s?'#1B4332':'#fff', color: filter===s?'#fff':'#6b7280', fontSize: '0.78rem', cursor: 'pointer', textTransform: 'capitalize' }}>{s}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading orders...</div> :
      !filtered.length ? <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}><div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div><div>No orders found</div></div> :
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(order => (
          <Link to={`/account/orders/${order.order_number}`} key={order.id} style={{ display: 'block', background: '#fff', border: '1px solid #f0ece4', borderRadius: '10px', padding: '20px', textDecoration: 'none', color: '#111', transition: 'all .2s' }}
            onMouseOver={e=>e.currentTarget.style.borderColor='#1B4332'} onMouseOut={e=>e.currentTarget.style.borderColor='#f0ece4'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontFamily: 'monospace', color: '#1B4332', fontWeight: 600, fontSize: '0.9rem' }}>{order.order_number}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '12px' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '4px', background: (STATUS_COLOR[order.payment_status]||'#6b7280')+'15', color: STATUS_COLOR[order.payment_status]||'#6b7280', textTransform: 'capitalize' }}>💳 {order.payment_status}</span>
                <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '4px', background: (STATUS_COLOR[order.status]||'#6b7280')+'15', color: STATUS_COLOR[order.status]||'#6b7280', textTransform: 'capitalize' }}>{order.status}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {order.items?.slice(0,3).map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f9fafb', borderRadius: '6px', padding: '6px 10px' }}>
                  <span style={{ fontSize: '1rem' }}>🏷️</span>
                  <span style={{ fontSize: '0.78rem', color: '#374151' }}>{item.product_name} ×{item.quantity}</span>
                </div>
              ))}
              {order.items?.length > 3 && <div style={{ fontSize: '0.75rem', color: '#9ca3af', alignSelf: 'center' }}>+{order.items.length-3} more</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>₹{order.total?.toLocaleString()}</span>
              <span style={{ fontSize: '0.78rem', color: '#1B4332', fontWeight: 500 }}>View Details →</span>
            </div>
          </Link>
        ))}
      </div>}
    </div>
  );
}

// ============================================================
// src/pages/account/Measurements.jsx
// ============================================================
export function Measurements() {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState({ profile_name:'My Measurements' });

  const FIELDS = ['chest','waist','hips','shoulder','shirt_length','pant_length','sleeve_length','neck','thigh','inseam'];

  useEffect(() => { measurementAPI.list().then(r => setProfiles(r.data.data || [])); }, []);

  const save = async () => {
    try {
      if (editId) { await measurementAPI.update(editId, form); toast.success('Profile updated!'); }
      else        { await measurementAPI.add(form); toast.success('Profile saved!'); }
      measurementAPI.list().then(r => setProfiles(r.data.data || []));
      setShowForm(false); setEditId(null); setForm({ profile_name:'My Measurements' });
    } catch { toast.error('Save failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this profile?')) return;
    await measurementAPI.delete(id);
    setProfiles(p => p.filter(x => x.id !== id));
    toast.success('Deleted');
  };

  const setDefault = async (id) => {
    await measurementAPI.setDefault(id);
    setProfiles(p => p.map(x => ({ ...x, is_default: x.id === id })));
  };

  return (
    <div style={{ padding: '40px 8%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', fontWeight: 400, marginBottom: '4px' }}>Measurement Profiles</h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Save your measurements for faster custom orders</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ profile_name:'My Measurements' }); }} style={{ padding: '10px 20px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>+ New Profile</button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {profiles.map(p => (
          <div key={p.id} style={{ background: '#fff', border: '1px solid #f0ece4', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', fontWeight: 500 }}>{p.profile_name}</h3>
                {p.is_default && <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>Default</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!p.is_default && <button onClick={() => setDefault(p.id)} style={{ padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>Set Default</button>}
                <button onClick={() => { setEditId(p.id); setForm(p); setShowForm(true); }} style={{ padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>✏️ Edit</button>
                <button onClick={() => del(p.id)} style={{ padding: '5px 12px', border: '1px solid #fecaca', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444' }}>🗑️</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '10px' }}>
              {FIELDS.filter(f => p[f]).map(f => (
                <div key={f} style={{ background: '#f9fafb', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{f.replace('_',' ')}</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1B4332' }}>{p[f]}"</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!profiles.length && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '10px', border: '1px solid #f0ece4', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📏</div>
            <div style={{ marginBottom: '16px' }}>No measurement profiles yet</div>
            <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create First Profile</button>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.2rem', fontWeight: 500 }}>{editId ? 'Edit' : 'New'} Measurement Profile</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Profile Name</label>
                <input style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} value={form.profile_name || ''} onChange={e => setForm(f => ({ ...f, profile_name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {FIELDS.map(f => (
                  <div key={f}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 500, display: 'block', marginBottom: '4px', textTransform: 'capitalize' }}>{f.replace('_',' ')} (inches)</label>
                    <input type="number" step="0.5" min="0" placeholder="0.0" style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.83rem', outline: 'none' }} value={form[f] || ''} onChange={e => setForm(x => ({ ...x, [f]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Notes</label>
                <textarea style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.83rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} rows={2} placeholder="Any special notes about fit preference..." value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 20px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.83rem' }}>Cancel</button>
              <button onClick={save} style={{ padding: '9px 24px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 500 }}>Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountDashboard;

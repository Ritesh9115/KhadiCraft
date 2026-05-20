// src/pages/account/Addresses.jsx
import { useState, useEffect } from 'react';
import { profileAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY = { label:'Home', full_name:'', phone:'', address_line1:'', address_line2:'', city:'', state:'', pincode:'', is_default:false };

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState(EMPTY);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setAddresses((await profileAPI.getAddresses()).data.data || []); }
    catch { toast.error('Failed to load addresses'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditId(null); setForm(EMPTY); setShowForm(true); };

  const openEdit = (a) => {
    setEditId(a.id);
    setForm({ label:a.label||'Home', full_name:a.full_name, phone:a.phone, address_line1:a.address_line1, address_line2:a.address_line2||'', city:a.city, state:a.state, pincode:a.pincode, is_default:!!a.is_default });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.full_name||!form.phone||!form.address_line1||!form.city||!form.state||!form.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      if (editId) { await profileAPI.updateAddress(editId, form); toast.success('Address updated!'); }
      else        { await profileAPI.addAddress(form);             toast.success('Address added!'); }
      setShowForm(false); await load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this address?')) return;
    try { await profileAPI.deleteAddress(id); setAddresses(a => a.filter(x=>x.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const setDefault = async (id) => {
    try {
      await profileAPI.setDefaultAddress(id);
      setAddresses(a => a.map(x => ({...x, is_default: x.id===id})));
      toast.success('Default address set!');
    } catch { toast.error('Failed'); }
  };

  const set = (k) => (e) => setForm(f => ({...f, [k]: typeof e==='boolean'?e:e.target.value}));

  const LABEL_OPTS = ['Home','Office','Other'];

  return (
    <div style={{ padding:'40px 8%', maxWidth:'760px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:400, marginBottom:'4px' }}>Saved Addresses</h1>
          <p style={{ color:'#6b7280', fontSize:'0.84rem' }}>{addresses.length} saved address{addresses.length!==1?'es':''}</p>
        </div>
        <button onClick={openAdd} style={{ padding:'10px 22px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'0.82rem', fontWeight:500 }}>
          + Add New Address
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>Loading addresses...</div>
      ) : addresses.length === 0 && !showForm ? (
        <div style={{ textAlign:'center', padding:'80px', background:'#fff', borderRadius:'10px', border:'1px solid #f0ece4', color:'#9ca3af' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>📍</div>
          <div style={{ fontSize:'1.1rem', color:'#374151', marginBottom:'8px' }}>No addresses saved yet</div>
          <p style={{ fontSize:'0.85rem', marginBottom:'20px' }}>Save your delivery addresses for faster checkout.</p>
          <button onClick={openAdd} style={{ padding:'11px 28px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem', fontWeight:500 }}>Add First Address</button>
        </div>
      ) : (
        <div style={{ display:'grid', gap:'14px' }}>
          {addresses.map(addr => (
            <div key={addr.id} style={{ background:'#fff', border:`1.5px solid ${addr.is_default?'#1B4332':'#f0ece4'}`, borderRadius:'10px', padding:'18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', flexWrap:'wrap', gap:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ padding:'3px 10px', background:'#f0fdf4', color:'#1B4332', borderRadius:'4px', fontSize:'0.72rem', fontWeight:600 }}>{addr.label||'Home'}</span>
                  {addr.is_default && <span style={{ padding:'3px 9px', background:'#dcfce7', color:'#166534', borderRadius:'20px', fontSize:'0.68rem', fontWeight:600 }}>✓ Default</span>}
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  {!addr.is_default && <button onClick={() => setDefault(addr.id)} style={{ padding:'5px 12px', border:'1px solid #e5e7eb', borderRadius:'4px', background:'#fff', cursor:'pointer', fontSize:'0.73rem', color:'#6b7280', transition:'all .2s' }}>Set Default</button>}
                  <button onClick={() => openEdit(addr)} style={{ padding:'5px 12px', border:'1px solid #e5e7eb', borderRadius:'4px', background:'#fff', cursor:'pointer', fontSize:'0.73rem', color:'#374151' }}>✏️ Edit</button>
                  <button onClick={() => del(addr.id)} style={{ padding:'5px 10px', border:'1px solid #fecaca', borderRadius:'4px', background:'#fff', cursor:'pointer', fontSize:'0.73rem', color:'#ef4444' }}>🗑️</button>
                </div>
              </div>
              <div style={{ fontSize:'0.88rem', lineHeight:1.8, color:'#374151' }}>
                <strong>{addr.full_name}</strong> &nbsp;·&nbsp; 📞 {addr.phone}
              </div>
              <div style={{ fontSize:'0.83rem', color:'#6b7280', lineHeight:1.7 }}>
                {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br/>
                {addr.city}, {addr.state} — {addr.pincode}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'#fff', borderRadius:'14px', padding:'28px', width:'100%', maxWidth:'520px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.2rem', fontWeight:500 }}>{editId?'Edit':'Add'} Address</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer', color:'#6b7280' }}>✕</button>
            </div>
            <div style={{ display:'grid', gap:'14px' }}>
              {/* Label */}
              <div>
                <label style={lbl}>Address Label</label>
                <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
                  {LABEL_OPTS.map(opt => (
                    <button key={opt} type="button" onClick={() => setForm(f=>({...f,label:opt}))}
                      style={{ padding:'6px 16px', border:`1.5px solid ${form.label===opt?'#1B4332':'#e5e7eb'}`, borderRadius:'6px', background:form.label===opt?'#f0fdf4':'#fff', color:form.label===opt?'#1B4332':'#6b7280', cursor:'pointer', fontSize:'0.82rem', fontWeight:form.label===opt?600:400, transition:'all .2s' }}>
                      {opt==='Home'?'🏠':opt==='Office'?'🏢':'📍'} {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Full Name *</label><input style={inp} placeholder="Recipient name" value={form.full_name} onChange={set('full_name')}/></div>
                <div><label style={lbl}>Phone *</label><input style={inp} type="tel" placeholder="10-digit number" value={form.phone} onChange={set('phone')}/></div>
              </div>

              <div><label style={lbl}>Address Line 1 *</label><input style={inp} placeholder="House/Flat No., Street, Colony" value={form.address_line1} onChange={set('address_line1')}/></div>
              <div><label style={lbl}>Address Line 2 (Optional)</label><input style={inp} placeholder="Landmark, Near..." value={form.address_line2} onChange={set('address_line2')}/></div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>City *</label><input style={inp} placeholder="City" value={form.city} onChange={set('city')}/></div>
                <div><label style={lbl}>State *</label><input style={inp} placeholder="State" value={form.state} onChange={set('state')}/></div>
                <div><label style={lbl}>Pincode *</label><input style={inp} placeholder="6 digits" maxLength={6} value={form.pincode} onChange={set('pincode')}/></div>
              </div>

              <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', padding:'10px', background:'#f9fafb', borderRadius:'6px' }}>
                <input type="checkbox" checked={!!form.is_default} onChange={e => setForm(f=>({...f,is_default:e.target.checked}))} style={{ accentColor:'#1B4332', width:'16px', height:'16px' }}/>
                <div>
                  <div style={{ fontSize:'0.83rem', fontWeight:500 }}>Set as default address</div>
                  <div style={{ fontSize:'0.72rem', color:'#9ca3af' }}>Auto-selected during checkout</div>
                </div>
              </label>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'22px', paddingTop:'16px', borderTop:'1px solid #f0ece4' }}>
              <button onClick={() => setShowForm(false)} style={{ padding:'9px 20px', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', cursor:'pointer', fontSize:'0.83rem' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ padding:'9px 24px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.83rem', fontWeight:500 }}>
                {saving ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { fontSize:'0.78rem', fontWeight:500, color:'#374151', display:'block', marginBottom:'5px' };
const inp = { width:'100%', padding:'9px 12px', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'0.85rem', outline:'none', fontFamily:'inherit', transition:'border .2s', boxSizing:'border-box' };

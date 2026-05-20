// src/pages/admin/CustomOrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STAGE_ORDER = [
  'pending','confirmed','fabric_selected','measurement_received',
  'cutting','stitching','finishing','quality_check','ready','dispatched','delivered'
];

const STAGE_LABELS = {
  pending:'Pending', confirmed:'Confirmed', fabric_selected:'Fabric Selected',
  measurement_received:'Measurements Received', cutting:'Cutting', stitching:'Stitching',
  finishing:'Finishing', quality_check:'Quality Check', ready:'Ready',
  dispatched:'Dispatched', delivered:'Delivered', cancelled:'Cancelled',
};

const STAGE_COLOR = {
  pending:'#9ca3af', confirmed:'#3b82f6', fabric_selected:'#f97316',
  measurement_received:'#10b981', cutting:'#f59e0b', stitching:'#8b5cf6',
  finishing:'#3b82f6', quality_check:'#06b6d4', ready:'#059669',
  dispatched:'#6366f1', delivered:'#059669', cancelled:'#ef4444',
};

const MEASUREMENT_FIELDS = [
  { key:'chest', label:'Chest' }, { key:'waist', label:'Waist' },
  { key:'hips', label:'Hips' }, { key:'shoulder', label:'Shoulder' },
  { key:'shirt_length', label:'Shirt Len.' }, { key:'pant_length', label:'Pant Len.' },
  { key:'sleeve_length', label:'Sleeve' }, { key:'neck', label:'Neck' },
  { key:'thigh', label:'Thigh' }, { key:'inseam', label:'Inseam' },
];

export default function AdminCustomOrderDetail() {
  const { id } = useParams();
  const [order,    setOrder]    = useState(null);
  const [stages,   setStages]   = useState([]);
  const [tailors,  setTailors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  // Modal states
  const [statusModal,  setStatusModal]  = useState(false);
  const [tailorModal,  setTailorModal]  = useState(false);
  const [priceModal,   setPriceModal]   = useState(false);
  const [noteModal,    setNoteModal]    = useState(false);

  // Form states
  const [newStatus,  setNewStatus]  = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [selTailor,  setSelTailor]  = useState('');
  const [priceForm,  setPriceForm]  = useState({ final_price:'', estimated_ready_date:'' });
  const [adminNote,  setAdminNote]  = useState('');

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [orderRes, tailorRes, stageRes] = await Promise.all([
        adminAPI.customOrder(id),
        adminAPI.tailors(),
        adminAPI.getStages(id),
      ]);
      const o = orderRes.data.data;
      setOrder(o);
      setStages(stageRes.data.data || []);
      setTailors(tailorRes.data.data || []);
      setNewStatus(o.status);
      setSelTailor(o.assigned_tailor_id || '');
      setPriceForm({ final_price: o.final_price || '', estimated_ready_date: o.estimated_ready_date || '' });
      setAdminNote(o.admin_notes || '');
    } catch (err) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    setSaving(true);
    try {
      await adminAPI.updateCustomStatus(id, { status: newStatus, notes: statusNote });
      toast.success('Status updated!');
      setStatusModal(false);
      setStatusNote('');
      await loadAll();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const assignTailor = async () => {
    if (!selTailor) { toast.error('Select a tailor'); return; }
    setSaving(true);
    try {
      await adminAPI.assignTailor(id, { tailor_id: selTailor });
      toast.success('Tailor assigned!');
      setTailorModal(false);
      await loadAll();
    } catch { toast.error('Assignment failed'); }
    finally { setSaving(false); }
  };

  const setPrice = async () => {
    if (!priceForm.final_price) { toast.error('Enter final price'); return; }
    setSaving(true);
    try {
      await adminAPI.setCustomPrice(id, priceForm);
      toast.success('Price set!');
      setPriceModal(false);
      await loadAll();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      await adminAPI.addNote?.(id, { note: adminNote }) || 
        await fetch(`http://localhost:8000/api/admin/custom-orders/${id}/notes`, {
          method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('kc_token')}`},
          body: JSON.stringify({ note: adminNote })
        });
      toast.success('Note saved!');
      setNoteModal(false);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="admin-loading"><span className="spinner"/></div>;
  if (!order)  return <div style={{textAlign:'center',padding:'60px',color:'#9ca3af'}}>Order not found</div>;

  const currentIdx = STAGE_ORDER.indexOf(order.status);
  const sc = STAGE_COLOR[order.status] || '#6b7280';

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'4px'}}>
            <h1 style={{fontSize:'1.3rem'}}>{order.custom_order_number}</h1>
            <span className="status-badge" style={{background:sc+'20',color:sc,fontSize:'0.78rem',padding:'4px 12px'}}>
              {STAGE_LABELS[order.status]}
            </span>
          </div>
          <p style={{color:'#6b7280',fontSize:'0.82rem'}}>
            {order.style_type?.replace(/_/g,' ')} · {order.user?.name} · {new Date(order.created_at).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <button className="btn-outline-sm" onClick={()=>setStatusModal(true)}>✏️ Update Stage</button>
          <button className="btn-gold-sm" onClick={()=>setTailorModal(true)}>👨‍🎨 Assign Tailor</button>
          <button className="btn-primary-sm" onClick={()=>setPriceModal(true)}>💰 Set Price</button>
          <button className="btn-outline-sm" onClick={()=>setNoteModal(true)}>📝 Add Note</button>
          <Link to="/admin/custom-orders"><button className="btn-outline-sm">← Back</button></Link>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div className="admin-table-card" style={{marginBottom:'20px',padding:'20px'}}>
        <h3 style={{fontSize:'0.88rem',fontWeight:600,marginBottom:'16px'}}>Order Progress</h3>
        <div style={{display:'flex',gap:0,overflowX:'auto',paddingBottom:'8px'}}>
          {STAGE_ORDER.filter(s=>s!=='cancelled').map((s,i)=>(
            <div key={s} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',position:'relative',minWidth:'80px'}}>
              {i>0&&<div style={{position:'absolute',left:'-50%',top:'14px',width:'100%',height:'2px',background:currentIdx>=i?'#1B4332':'#e5e7eb',zIndex:0}}/>}
              <button
                onClick={()=>{ setNewStatus(s); setStatusModal(true); }}
                title={`Set to ${STAGE_LABELS[s]}`}
                style={{width:'28px',height:'28px',borderRadius:'50%',background:currentIdx>i?'#1B4332':currentIdx===i?sc:'#e5e7eb',color:currentIdx>=i?'#fff':'#9ca3af',border:'none',cursor:'pointer',fontSize:'0.7rem',fontWeight:700,zIndex:1,position:'relative',transition:'all .2s'}}
              >
                {currentIdx>i?'✓':i+1}
              </button>
              <div style={{fontSize:'0.6rem',color:currentIdx===i?sc:'#9ca3af',marginTop:'5px',textAlign:'center',fontWeight:currentIdx===i?700:400,lineHeight:1.3}}>
                {STAGE_LABELS[s]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'20px',alignItems:'start'}}>
        {/* LEFT */}
        <div style={{display:'grid',gap:'16px'}}>

          {/* Measurements */}
          <div className="admin-table-card">
            <h3 style={{fontSize:'0.9rem',fontWeight:600,marginBottom:'14px'}}>📏 Measurements ({order.measurement_unit||'inches'})</h3>
            {MEASUREMENT_FIELDS.filter(f=>order[f.key]).length > 0 ? (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:'10px'}}>
                {MEASUREMENT_FIELDS.filter(f=>order[f.key]).map(f=>(
                  <div key={f.key} style={{background:'#f9fafb',borderRadius:'8px',padding:'12px',textAlign:'center',border:'1px solid #f0f0f0'}}>
                    <div style={{fontSize:'0.65rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'3px'}}>{f.label}</div>
                    <div style={{fontWeight:700,fontSize:'1.1rem',color:'#1B4332'}}>{order[f.key]}"</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{color:'#9ca3af',fontSize:'0.83rem',padding:'20px',textAlign:'center',background:'#f9fafb',borderRadius:'8px'}}>
                No measurements yet — customer needs to provide or book appointment.
              </div>
            )}
          </div>

          {/* Special Instructions */}
          {order.special_instructions && (
            <div className="admin-table-card" style={{background:'#fffbeb',border:'1px solid #fde68a'}}>
              <h3 style={{fontSize:'0.9rem',fontWeight:600,color:'#92400e',marginBottom:'10px'}}>📋 Special Instructions</h3>
              <p style={{fontSize:'0.88rem',color:'#78350f',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{order.special_instructions}</p>
            </div>
          )}

          {/* Reference Image */}
          {order.reference_image && (
            <div className="admin-table-card">
              <h3 style={{fontSize:'0.9rem',fontWeight:600,marginBottom:'12px'}}>🖼️ Reference Image</h3>
              <img src={`http://localhost:8000/storage/${order.reference_image}`} alt="Reference"
                style={{maxWidth:'100%',maxHeight:'300px',borderRadius:'8px',border:'1px solid #e5e7eb',objectFit:'contain'}}/>
            </div>
          )}

          {/* Stage Log */}
          <div className="admin-table-card">
            <h3 style={{fontSize:'0.9rem',fontWeight:600,marginBottom:'14px'}}>📋 Stage History</h3>
            {stages.filter(s=>s.status==='completed').length > 0 ? (
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {stages.filter(s=>s.status==='completed').map(s=>(
                  <div key={s.stage} style={{display:'flex',gap:'12px',alignItems:'flex-start',padding:'10px',background:'#f9fafb',borderRadius:'8px'}}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#1B4332',marginTop:'5px',flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:500,fontSize:'0.83rem'}}>{STAGE_LABELS[s.stage]||s.stage}</div>
                      {s.notes&&<div style={{fontSize:'0.75rem',color:'#6b7280',marginTop:'2px',fontStyle:'italic'}}>{s.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div style={{color:'#9ca3af',fontSize:'0.83rem'}}>No stage updates yet.</div>}
          </div>

          {/* Notes */}
          {(order.admin_notes||order.tailor_notes) && (
            <div className="admin-table-card">
              <h3 style={{fontSize:'0.9rem',fontWeight:600,marginBottom:'14px'}}>📝 Notes</h3>
              {order.admin_notes&&(
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'0.72rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'5px'}}>Admin Notes</div>
                  <div style={{background:'#f9fafb',borderRadius:'6px',padding:'12px',fontSize:'0.83rem',whiteSpace:'pre-wrap'}}>{order.admin_notes}</div>
                </div>
              )}
              {order.tailor_notes&&(
                <div>
                  <div style={{fontSize:'0.72px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'5px'}}>Tailor Notes</div>
                  <div style={{background:'#f0fdf4',borderRadius:'6px',padding:'12px',fontSize:'0.83rem',border:'1px solid #bbf7d0',whiteSpace:'pre-wrap'}}>{order.tailor_notes}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{display:'grid',gap:'14px'}}>

          {/* Order Details */}
          <div className="admin-table-card">
            <h3 style={{fontSize:'0.88rem',fontWeight:600,marginBottom:'14px'}}>📦 Order Details</h3>
            {[
              ['Order #', order.custom_order_number],
              ['Style', order.style_type?.replace(/_/g,' ')],
              ['Fabric', order.fabric_name||'—'],
              ['Color', order.fabric_color||'—'],
              ['Est. Price', order.estimated_price?`₹${order.estimated_price?.toLocaleString()}`:'—'],
              ['Final Price', order.final_price?`₹${order.final_price?.toLocaleString()}`:'Not set'],
              ['Est. Ready', order.estimated_ready_date?new Date(order.estimated_ready_date).toLocaleDateString('en-IN'):'Not set'],
              ['Actual Ready', order.actual_ready_date?new Date(order.actual_ready_date).toLocaleDateString('en-IN'):'—'],
            ].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',gap:'10px',paddingBottom:'8px',marginBottom:'8px',borderBottom:'1px solid #f3f4f6',fontSize:'0.8rem'}}>
                <span style={{color:'#9ca3af',flexShrink:0}}>{l}</span>
                <span style={{fontWeight:500,textAlign:'right',textTransform:'capitalize'}}>{v}</span>
              </div>
            ))}
          </div>

          {/* Customer */}
          <div className="admin-table-card">
            <h3 style={{fontSize:'0.88rem',fontWeight:600,marginBottom:'12px'}}>👤 Customer</h3>
            <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'10px'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#1B4332',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,flexShrink:0}}>{order.user?.name?.[0]}</div>
              <div>
                <div style={{fontWeight:500,fontSize:'0.85rem'}}>{order.user?.name}</div>
                <div style={{fontSize:'0.72rem',color:'#9ca3af'}}>{order.user?.email}</div>
                <div style={{fontSize:'0.72rem',color:'#9ca3af'}}>{order.user?.phone}</div>
              </div>
            </div>
          </div>

          {/* Assigned Tailor */}
          <div className="admin-table-card">
            <h3 style={{fontSize:'0.88rem',fontWeight:600,marginBottom:'12px'}}>✂️ Assigned Tailor</h3>
            {order.assigned_tailor ? (
              <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'12px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#8b5cf6',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,flexShrink:0}}>{order.assigned_tailor?.name?.[0]}</div>
                <div>
                  <div style={{fontWeight:500,fontSize:'0.85rem'}}>{order.assigned_tailor?.name}</div>
                  <div style={{fontSize:'0.72rem',color:'#9ca3af'}}>{order.assigned_tailor?.phone}</div>
                </div>
              </div>
            ) : (
              <div style={{color:'#f59e0b',fontSize:'0.83rem',marginBottom:'12px',padding:'8px',background:'#fffbeb',borderRadius:'6px'}}>⚠️ No tailor assigned yet</div>
            )}
            <button className="btn-outline-sm" style={{width:'100%'}} onClick={()=>setTailorModal(true)}>
              {order.assigned_tailor ? '🔄 Reassign Tailor' : '👨‍🎨 Assign Tailor'}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="admin-table-card">
            <h3 style={{fontSize:'0.88rem',fontWeight:600,marginBottom:'12px'}}>⚡ Quick Actions</h3>
            <div style={{display:'grid',gap:'8px'}}>
              <button className="btn-primary-sm" style={{width:'100%',justifyContent:'center'}} onClick={()=>setStatusModal(true)}>✏️ Update Stage</button>
              <button className="btn-gold-sm" style={{width:'100%',justifyContent:'center'}} onClick={()=>setPriceModal(true)}>💰 Set Final Price</button>
              <button className="btn-outline-sm" style={{width:'100%',justifyContent:'center'}} onClick={()=>setNoteModal(true)}>📝 Add Admin Note</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Status Modal */}
      {statusModal&&(
        <div className="modal-backdrop" onClick={()=>setStatusModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Update Order Stage</h2><button className="modal-close" onClick={()=>setStatusModal(false)}>✕</button></div>
            <div style={{display:'grid',gap:'14px'}}>
              <div className="form-group">
                <label className="form-label required">New Stage</label>
                <select className="form-select" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                  {[...STAGE_ORDER,'cancelled'].map(s=>(
                    <option key={s} value={s}>{STAGE_LABELS[s]||s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (shown to customer)</label>
                <textarea className="form-textarea" rows={3} placeholder="Optional note about this stage update..." value={statusNote} onChange={e=>setStatusNote(e.target.value)}/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-sm" onClick={()=>setStatusModal(false)}>Cancel</button>
              <button className="btn-primary-sm" onClick={updateStatus} disabled={saving}>{saving?'Updating...':'Update Stage'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Tailor Modal */}
      {tailorModal&&(
        <div className="modal-backdrop" onClick={()=>setTailorModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Assign Tailor</h2><button className="modal-close" onClick={()=>setTailorModal(false)}>✕</button></div>
            <div className="form-group" style={{marginBottom:'16px'}}>
              <label className="form-label required">Select Tailor</label>
              {tailors.length===0 ? (
                <div style={{padding:'16px',background:'#fef2f2',borderRadius:'8px',color:'#ef4444',fontSize:'0.83rem'}}>⚠️ No tailors found. Add a user with "tailor" role first.</div>
              ) : (
                <div style={{display:'grid',gap:'8px',maxHeight:'300px',overflowY:'auto'}}>
                  {tailors.map(t=>(
                    <label key={t.id} style={{display:'flex',gap:'12px',alignItems:'center',padding:'12px',border:`2px solid ${selTailor==t.id?'#8b5cf6':'#e5e7eb'}`,borderRadius:'8px',cursor:'pointer',background:selTailor==t.id?'#faf5ff':'#fff',transition:'all .2s'}}>
                      <input type="radio" name="tailor" checked={selTailor==t.id} onChange={()=>setSelTailor(t.id)} style={{accentColor:'#8b5cf6'}}/>
                      <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'#8b5cf6',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,flexShrink:0}}>{t.name?.[0]}</div>
                      <div>
                        <div style={{fontWeight:500,fontSize:'0.85rem'}}>{t.name}</div>
                        <div style={{fontSize:'0.72rem',color:'#9ca3af'}}>{t.phone||t.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-outline-sm" onClick={()=>setTailorModal(false)}>Cancel</button>
              <button className="btn-primary-sm" onClick={assignTailor} disabled={saving||!selTailor}>{saving?'Assigning...':'Assign Tailor'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {priceModal&&(
        <div className="modal-backdrop" onClick={()=>setPriceModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Set Final Price</h2><button className="modal-close" onClick={()=>setPriceModal(false)}>✕</button></div>
            <div style={{display:'grid',gap:'14px'}}>
              <div className="form-group">
                <label className="form-label required">Final Price (₹)</label>
                <input className="form-input" type="number" step="0.01" min="0" placeholder="e.g. 1299.00" value={priceForm.final_price} onChange={e=>setPriceForm(f=>({...f,final_price:e.target.value}))}/>
                {order.estimated_price&&<div className="form-hint">Customer estimate was: ₹{order.estimated_price}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Ready Date</label>
                <input className="form-input" type="date" min={new Date().toISOString().split('T')[0]} value={priceForm.estimated_ready_date} onChange={e=>setPriceForm(f=>({...f,estimated_ready_date:e.target.value}))}/>
                <span className="form-hint">Customer will be notified of the price and expected date.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-sm" onClick={()=>setPriceModal(false)}>Cancel</button>
              <button className="btn-primary-sm" onClick={setPrice} disabled={saving}>{saving?'Saving...':'Set Price & Notify'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {noteModal&&(
        <div className="modal-backdrop" onClick={()=>setNoteModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Admin Notes</h2><button className="modal-close" onClick={()=>setNoteModal(false)}>✕</button></div>
            <div className="form-group">
              <label className="form-label">Internal Notes (not shown to customer)</label>
              <textarea className="form-textarea" rows={5} placeholder="Internal notes for your team..." value={adminNote} onChange={e=>setAdminNote(e.target.value)}/>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-sm" onClick={()=>setNoteModal(false)}>Cancel</button>
              <button className="btn-primary-sm" onClick={saveNote} disabled={saving}>{saving?'Saving...':'Save Note'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

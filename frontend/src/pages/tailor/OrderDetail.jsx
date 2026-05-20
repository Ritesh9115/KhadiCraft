// src/pages/tailor/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tailorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STAGE_LABELS = {
  pending:              'Order Pending',
  confirmed:            'Order Confirmed',
  fabric_selected:      'Fabric Selected',
  measurement_received: 'Measurements Received',
  cutting:              'Cutting',
  stitching:            'Stitching',
  finishing:            'Finishing',
  quality_check:        'Quality Check',
  ready:                'Ready for Dispatch',
  dispatched:           'Dispatched',
  delivered:            'Delivered',
};

const STAGE_COLOR = {
  cutting: '#f59e0b', stitching: '#8b5cf6', finishing: '#3b82f6',
  quality_check: '#06b6d4', ready: '#059669', delivered: '#059669',
  pending: '#9ca3af', confirmed: '#3b82f6', fabric_selected: '#f97316',
  measurement_received: '#10b981', dispatched: '#6366f1',
};

const MEASUREMENT_FIELDS = [
  { key: 'chest',         label: 'Chest',        icon: '📏' },
  { key: 'waist',         label: 'Waist',         icon: '📏' },
  { key: 'hips',          label: 'Hips',          icon: '📏' },
  { key: 'shoulder',      label: 'Shoulder',      icon: '📐' },
  { key: 'shirt_length',  label: 'Shirt Length',  icon: '↕️'  },
  { key: 'pant_length',   label: 'Pant Length',   icon: '↕️'  },
  { key: 'sleeve_length', label: 'Sleeve',        icon: '💪' },
  { key: 'neck',          label: 'Neck',          icon: '🔄' },
  { key: 'thigh',         label: 'Thigh',         icon: '📏' },
  { key: 'inseam',        label: 'Inseam',        icon: '↕️'  },
];

export default function TailorOrderDetail() {
  const { id } = useParams();
  const [order,    setOrder]    = useState(null);
  const [stages,   setStages]   = useState([]);
  const [nextStage,setNextStage]= useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note,     setNote]     = useState('');
  const [showNote, setShowNote] = useState(false);
  const [confirmStage, setConfirmStage] = useState(null);

  useEffect(() => { loadOrder(); }, [id]);

  const loadOrder = async () => {
    try {
      const res = await tailorAPI.orderDetail(id);
      setOrder(res.data.data);
      setStages(res.data.stage_progress || []);
      setNextStage(res.data.next_stage);
    } catch (err) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (stage) => {
    setUpdating(true);
    try {
      const res = await tailorAPI.updateStage(id, { stage, notes: note });
      toast.success(res.data.message || 'Stage updated!');
      setNote('');
      setConfirmStage(null);
      setShowNote(false);
      await loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const saveNote = async () => {
    if (!note.trim()) return;
    try {
      await tailorAPI.addNote(id, { note });
      toast.success('Note saved!');
      setNote('');
      setShowNote(false);
      await loadOrder();
    } catch { toast.error('Failed to save note'); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'36px', height:'36px', border:'3px solid #e5e7eb', borderTopColor:'#1B4332', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 12px' }}/>
        <div style={{ color:'#9ca3af', fontSize:'0.85rem' }}>Loading order...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!order) return (
    <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>
      <div style={{ fontSize:'2rem', marginBottom:'10px' }}>❌</div>
      <div>Order not found or not assigned to you.</div>
      <Link to="/tailor/orders" style={{ color:'#1B4332', marginTop:'12px', display:'block' }}>← Back to Orders</Link>
    </div>
  );

  const measurements = MEASUREMENT_FIELDS.filter(f => order[f.key]);
  const currentColor = STAGE_COLOR[order.status] || '#6b7280';

  return (
    <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.5rem', fontWeight:400 }}>{order.custom_order_number}</h1>
            <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600, background:currentColor+'20', color:currentColor, textTransform:'capitalize' }}>
              {STAGE_LABELS[order.status] || order.status}
            </span>
          </div>
          <p style={{ color:'#6b7280', fontSize:'0.83rem' }}>
            👤 {order.user?.name} · 👔 {order.style_type?.replace('_',' ')}
            {order.estimated_ready_date && <span style={{ color:'#f59e0b', marginLeft:'10px' }}>📅 Due: {new Date(order.estimated_ready_date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>}
          </p>
        </div>
        <Link to="/tailor/orders" style={{ padding:'8px 16px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'0.82rem', color:'#6b7280', textDecoration:'none', display:'flex', alignItems:'center', gap:'5px' }}>← Back</Link>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'20px', alignItems:'start' }}>
        {/* LEFT COLUMN */}
        <div style={{ display:'grid', gap:'16px' }}>

          {/* Stage Progress */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'22px' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1rem', fontWeight:500, marginBottom:'18px' }}>📊 Work Stages</h3>
            <div style={{ display:'grid', gap:'8px' }}>
              {stages.map((s, i) => (
                <div key={s.stage} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', borderRadius:'8px', background:s.is_current?currentColor+'10':s.is_done?'#f0fdf4':'#fafafa', border:`1px solid ${s.is_current?currentColor:s.is_done?'#bbf7d0':'#f0f0f0'}`, transition:'all .2s' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:s.is_done?'#1B4332':s.is_current?currentColor:'#e5e7eb', color:s.is_done||s.is_current?'#fff':'#9ca3af', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, flexShrink:0 }}>
                    {s.is_done ? '✓' : i + 1}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:s.is_current?700:s.is_done?500:400, color:s.is_current?currentColor:s.is_done?'#1B4332':'#9ca3af' }}>{s.label}</div>
                    {s.completed_at && <div style={{ fontSize:'0.7rem', color:'#9ca3af', marginTop:'1px' }}>Done: {new Date(s.completed_at).toLocaleString('en-IN', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</div>}
                    {s.notes && <div style={{ fontSize:'0.72rem', color:'#6b7280', marginTop:'2px', fontStyle:'italic' }}>"{s.notes}"</div>}
                  </div>
                  {s.is_current && <span style={{ fontSize:'0.68rem', background:currentColor, color:'#fff', padding:'2px 8px', borderRadius:'10px', whiteSpace:'nowrap' }}>Current</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Measurements */}
          {measurements.length > 0 && (
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'22px' }}>
              <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1rem', fontWeight:500, marginBottom:'16px' }}>📏 Customer Measurements ({order.measurement_unit || 'inches'})</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:'10px' }}>
                {measurements.map(f => (
                  <div key={f.key} style={{ background:'#f9fafb', borderRadius:'8px', padding:'12px', textAlign:'center', border:'1px solid #f0f0f0' }}>
                    <div style={{ fontSize:'1.1rem', marginBottom:'4px' }}>{f.icon}</div>
                    <div style={{ fontSize:'0.65rem', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>{f.label}</div>
                    <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#1B4332' }}>{order[f.key]}"</div>
                  </div>
                ))}
              </div>
              {order.measurement_unit && <div style={{ marginTop:'10px', fontSize:'0.75rem', color:'#9ca3af' }}>Unit: {order.measurement_unit}</div>}
            </div>
          )}

          {/* Special Instructions */}
          {order.special_instructions && (
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'12px', padding:'20px' }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:600, color:'#92400e', marginBottom:'10px' }}>📋 Special Instructions from Customer</h3>
              <p style={{ fontSize:'0.88rem', color:'#78350f', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{order.special_instructions}</p>
            </div>
          )}

          {/* Reference Image */}
          {order.reference_image && (
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px' }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:'12px' }}>🖼️ Reference Image</h3>
              <img
                src={`http://localhost:8000/storage/${order.reference_image}`}
                alt="Reference"
                style={{ maxWidth:'100%', maxHeight:'300px', borderRadius:'8px', border:'1px solid #e5e7eb', objectFit:'contain' }}
              />
            </div>
          )}

          {/* Tailor Notes */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:600 }}>📝 My Work Notes</h3>
              <button onClick={() => setShowNote(n => !n)} style={{ padding:'5px 12px', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', cursor:'pointer', fontSize:'0.75rem', color:'#6b7280' }}>{showNote ? 'Cancel' : '+ Add Note'}</button>
            </div>
            {order.tailor_notes ? (
              <div style={{ background:'#f9fafb', borderRadius:'8px', padding:'14px', fontSize:'0.83rem', color:'#374151', lineHeight:1.7, whiteSpace:'pre-wrap', maxHeight:'200px', overflowY:'auto' }}>{order.tailor_notes}</div>
            ) : (
              <div style={{ color:'#9ca3af', fontSize:'0.82rem' }}>No notes yet. Add notes about your progress, materials used, or any issues.</div>
            )}
            {showNote && (
              <div style={{ marginTop:'12px' }}>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add a work note..." style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'0.83rem', outline:'none', fontFamily:'inherit', resize:'vertical', marginBottom:'8px' }}/>
                <button onClick={saveNote} disabled={!note.trim()} style={{ padding:'8px 20px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.82rem', fontWeight:500 }}>Save Note</button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display:'grid', gap:'16px', position:'sticky', top:'20px' }}>

          {/* Update Stage Card */}
          {nextStage && !['delivered','cancelled'].includes(order.status) && (
            <div style={{ background:'linear-gradient(135deg,#1B4332,#2D6A4F)', borderRadius:'12px', padding:'22px', color:'#fff' }}>
              <h3 style={{ fontSize:'0.88rem', fontWeight:600, marginBottom:'6px', color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'1px' }}>Next Step</h3>
              <div style={{ fontFamily:'Georgia,serif', fontSize:'1.2rem', marginBottom:'16px', color:'#fff' }}>{STAGE_LABELS[nextStage]}</div>

              <div style={{ marginBottom:'12px' }}>
                <label style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.6)', display:'block', marginBottom:'5px' }}>Add a note (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="e.g. Started cutting fabric, completed 2 pieces..." style={{ width:'100%', padding:'8px 10px', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'6px', fontSize:'0.82rem', background:'rgba(255,255,255,0.1)', color:'#fff', outline:'none', fontFamily:'inherit', resize:'none' }}/>
              </div>

              <button
                onClick={() => setConfirmStage(nextStage)}
                disabled={updating}
                style={{ width:'100%', padding:'12px', background:'#C5933A', color:'#fff', border:'none', borderRadius:'8px', fontSize:'0.88rem', cursor:'pointer', fontWeight:600, transition:'all .2s' }}
              >
                {updating ? '⏳ Updating...' : `✅ Mark as ${STAGE_LABELS[nextStage]}`}
              </button>
            </div>
          )}

          {/* Order Info */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'18px' }}>
            <h3 style={{ fontSize:'0.88rem', fontWeight:600, marginBottom:'14px' }}>📦 Order Info</h3>
            <div style={{ display:'grid', gap:'8px' }}>
              {[
                ['Style', order.style_type?.replace(/_/g,' ')],
                ['Fabric', order.fabric_name || '—'],
                ['Color', order.fabric_color || '—'],
                ['Status', STAGE_LABELS[order.status]],
                ['Placed', new Date(order.created_at).toLocaleDateString('en-IN')],
                ['Due Date', order.estimated_ready_date ? new Date(order.estimated_ready_date).toLocaleDateString('en-IN') : 'Not set'],
                ['Final Price', order.final_price ? `₹${order.final_price?.toLocaleString()}` : order.estimated_price ? `~₹${order.estimated_price?.toLocaleString()}` : 'TBD'],
              ].map(([label, value]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', gap:'10px', fontSize:'0.8rem', paddingBottom:'7px', borderBottom:'1px solid #f3f4f6' }}>
                  <span style={{ color:'#9ca3af', flexShrink:0 }}>{label}</span>
                  <span style={{ fontWeight:500, color:'#111', textAlign:'right', textTransform:'capitalize' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'18px' }}>
            <h3 style={{ fontSize:'0.88rem', fontWeight:600, marginBottom:'12px' }}>👤 Customer</h3>
            <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'10px' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#1B4332', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, flexShrink:0 }}>{order.user?.name?.[0]}</div>
              <div>
                <div style={{ fontWeight:500, fontSize:'0.85rem' }}>{order.user?.name}</div>
                <div style={{ fontSize:'0.72rem', color:'#9ca3af' }}>{order.user?.phone}</div>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {order.admin_notes && (
            <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'12px', padding:'16px' }}>
              <h3 style={{ fontSize:'0.82rem', fontWeight:600, color:'#92400e', marginBottom:'6px' }}>⚠️ Admin Notes</h3>
              <p style={{ fontSize:'0.8rem', color:'#78350f', lineHeight:1.6 }}>{order.admin_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Stage Modal */}
      {confirmStage && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'28px', maxWidth:'380px', width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>✅</div>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.2rem', marginBottom:'8px' }}>Confirm Stage Update</h3>
            <p style={{ color:'#6b7280', fontSize:'0.85rem', marginBottom:'20px', lineHeight:1.6 }}>
              Mark order <strong>{order.custom_order_number}</strong> as<br/>
              <strong style={{ color:'#1B4332', fontSize:'1rem' }}>{STAGE_LABELS[confirmStage]}</strong>?
            </p>
            {note && <div style={{ background:'#f9fafb', borderRadius:'6px', padding:'10px', marginBottom:'16px', fontSize:'0.8rem', color:'#6b7280', textAlign:'left' }}>Note: {note}</div>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <button onClick={() => setConfirmStage(null)} style={{ padding:'10px', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', cursor:'pointer', fontSize:'0.85rem' }}>Cancel</button>
              <button onClick={() => handleUpdateStage(confirmStage)} disabled={updating} style={{ padding:'10px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem', fontWeight:600 }}>
                {updating ? '⏳' : '✅ Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

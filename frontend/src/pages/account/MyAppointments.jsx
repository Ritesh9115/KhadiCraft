// src/pages/account/MyAppointments.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const A_COLOR = { pending:'#f59e0b', confirmed:'#059669', rescheduled:'#3b82f6', completed:'#6b7280', cancelled:'#ef4444' };
const A_LABEL = { pending:'Pending Confirmation', confirmed:'Confirmed ✅', rescheduled:'Rescheduled', completed:'Completed', cancelled:'Cancelled' };

export default function MyAppointments() {
  const [apts,    setApts]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    appointmentAPI.list()
      .then(r => setApts(r.data.data?.data || r.data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      setApts(a => a.map(x => x.id===id ? {...x,status:'cancelled'} : x));
      toast.success('Appointment cancelled');
    } catch { toast.error('Failed to cancel'); }
  };

  const filtered = filter==='all' ? apts : apts.filter(a => a.status===filter);
  const upcoming = apts.filter(a => !['cancelled','completed'].includes(a.status) && new Date(a.appointment_date) >= new Date());

  return (
    <div style={{ padding:'40px 8%', maxWidth:'800px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:400, marginBottom:'4px' }}>My Appointments</h1>
          <p style={{ color:'#6b7280', fontSize:'0.84rem' }}>{upcoming.length} upcoming appointment{upcoming.length!==1?'s':''}</p>
        </div>
        <Link to="/book-appointment" style={{ padding:'10px 22px', background:'#1B4332', color:'#fff', borderRadius:'4px', fontSize:'0.82rem', fontWeight:500, textDecoration:'none' }}>
          + Book New
        </Link>
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {['all','pending','confirmed','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding:'6px 14px', border:`1.5px solid ${filter===s?'#1B4332':'#e5e7eb'}`, borderRadius:'20px', background:filter===s?'#1B4332':'#fff', color:filter===s?'#fff':'#6b7280', fontSize:'0.78rem', cursor:'pointer', textTransform:'capitalize', fontWeight:filter===s?500:400, transition:'all .2s' }}>
            {s==='all'?'All':A_LABEL[s]||s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>Loading appointments...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px', background:'#fff', borderRadius:'10px', border:'1px solid #f0ece4', color:'#9ca3af' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>📅</div>
          <div style={{ fontSize:'1.1rem', color:'#374151', marginBottom:'8px' }}>No appointments found</div>
          <p style={{ fontSize:'0.85rem', marginBottom:'20px' }}>Book a free measurement appointment — shop visit or home visit.</p>
          <Link to="/book-appointment" style={{ padding:'11px 28px', background:'#1B4332', color:'#fff', borderRadius:'4px', textDecoration:'none', fontSize:'0.85rem', fontWeight:500 }}>Book Appointment →</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {filtered.map(apt => {
            const isUpcoming = !['cancelled','completed'].includes(apt.status) && new Date(apt.appointment_date) >= new Date();
            const isPast     = new Date(apt.appointment_date) < new Date();
            return (
              <div key={apt.id} style={{ background:'#fff', border:`1px solid ${isUpcoming?'#bbf7d0':'#f0ece4'}`, borderRadius:'10px', padding:'18px', display:'flex', gap:'16px', alignItems:'flex-start', flexWrap:'wrap' }}>
                {/* Date Badge */}
                <div style={{ width:'56px', height:'60px', background:isUpcoming?'#1B4332':'#f3f4f6', borderRadius:'8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <div style={{ fontSize:'1.3rem', fontWeight:700, color:isUpcoming?'#fff':'#6b7280', lineHeight:1 }}>
                    {new Date(apt.appointment_date).getDate()}
                  </div>
                  <div style={{ fontSize:'0.65rem', color:isUpcoming?'rgba(255,255,255,.7)':'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    {new Date(apt.appointment_date).toLocaleDateString('en',{month:'short'})}
                  </div>
                  <div style={{ fontSize:'0.6rem', color:isUpcoming?'rgba(255,255,255,.5)':'#9ca3af' }}>
                    {new Date(apt.appointment_date).getFullYear()}
                  </div>
                </div>

                {/* Details */}
                <div style={{ flex:1, minWidth:'180px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px', flexWrap:'wrap' }}>
                    <span style={{ fontWeight:600, fontSize:'0.9rem', textTransform:'capitalize' }}>{apt.purpose}</span>
                    <span style={{ padding:'3px 9px', borderRadius:'20px', fontSize:'0.68rem', fontWeight:500, background:(A_COLOR[apt.status]||'#6b7280')+'20', color:A_COLOR[apt.status]||'#6b7280' }}>
                      {A_LABEL[apt.status]||apt.status}
                    </span>
                  </div>
                  <div style={{ fontSize:'0.82rem', color:'#6b7280', display:'flex', gap:'16px', flexWrap:'wrap' }}>
                    <span>🕐 {apt.time_slot}</span>
                    <span>{apt.type==='home_visit'?'🏠 Home Visit':'🏪 Shop Visit'}</span>
                  </div>
                  {apt.type==='home_visit' && apt.address && (
                    <div style={{ fontSize:'0.75rem', color:'#9ca3af', marginTop:'4px' }}>📍 {apt.address}, {apt.city}</div>
                  )}
                  {apt.notes && <div style={{ fontSize:'0.75rem', color:'#9ca3af', marginTop:'4px' }}>📝 {apt.notes}</div>}
                  {apt.staff && <div style={{ fontSize:'0.75rem', color:'#059669', marginTop:'4px' }}>👤 Staff: {apt.staff.name}</div>}
                  <div style={{ fontFamily:'monospace', fontSize:'0.7rem', color:'#9ca3af', marginTop:'4px' }}>{apt.appointment_number}</div>
                </div>

                {/* Actions */}
                {isUpcoming && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px', flexShrink:0 }}>
                    <button onClick={() => cancel(apt.id)} style={{ padding:'6px 14px', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'4px', fontSize:'0.75rem', background:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div style={{ marginTop:'28px', padding:'16px 20px', background:'#f0fdf4', borderRadius:'10px', border:'1px solid #bbf7d0', fontSize:'0.82rem', color:'#166534', display:'flex', gap:'12px' }}>
        <span style={{ fontSize:'1.1rem', flexShrink:0 }}>💡</span>
        <div>
          <strong>Free Home Visit Available!</strong> Our master tailor can come to your doorstep to take measurements — completely free of charge. Available in Saharanpur and nearby areas.
          <Link to="/book-appointment" style={{ color:'#1B4332', fontWeight:600, marginLeft:'6px' }}>Book now →</Link>
        </div>
      </div>
    </div>
  );
}

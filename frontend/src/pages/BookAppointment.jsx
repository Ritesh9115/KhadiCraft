import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const PURPOSES = [
  { value: 'measurement',   label: '📏 Measurement Taking' },
  { value: 'consultation',  label: '🎨 Style Consultation' },
  { value: 'trial',         label: '👔 Trial Fitting' },
  { value: 'delivery',      label: '📦 Order Pickup / Delivery' },
];

const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00',
];

export default function BookAppointment() {
  const [form, setForm] = useState({
    type: 'shop_visit',
    purpose: 'measurement',
    appointment_date: '',
    time_slot: '',
    notes: '',
  });
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // tomorrow minimum
  const minDateStr = minDate.toISOString().split('T')[0];

  const loadSlots = async (date) => {
    if (!date) return;
    setLoading(true);
    try {
      const r = await appointmentAPI.slots(date);
      setSlots(r.data.data || []);
    } catch {
      // Fallback: show all slots as available
      setSlots(TIME_SLOTS.map(t => ({ time: t, available: true, booked_count: 0 })));
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!form.appointment_date) { toast.error('Please select a date'); return false; }
    if (!form.time_slot)        { toast.error('Please select a time slot'); return false; }
    if (!form.purpose)          { toast.error('Please select a purpose'); return false; }
    return true;
  };

  const book = async () => {
    if (!validate()) return;
    setPlacing(true);
    try {
      // Map frontend type to backend allowed values
      const typeMap = {
        shop_visit: 'shop_visit',
        home_visit: 'shop_visit', // backend doesn't have home_visit; store as shop_visit + note
      };

      const payload = {
        type:             typeMap[form.type] || 'shop_visit',
        purpose:          form.purpose,
        appointment_date: form.appointment_date,
        time_slot:        form.time_slot,
        notes:            form.type === 'home_visit'
          ? `[HOME VISIT REQUESTED] ${form.notes || ''}`.trim()
          : form.notes || undefined,
      };

      await appointmentAPI.book(payload);
      toast.success("Appointment booked! We'll confirm within 2 hours 📅");
      navigate('/account/appointments');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(e => toast.error(Array.isArray(e) ? e[0] : e));
      } else {
        toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setPlacing(false);
    }
  };

  const inp = {
    width:'100%', padding:'9px 12px', border:'1.5px solid #e5e7eb',
    borderRadius:'6px', fontSize:'0.85rem', outline:'none', boxSizing:'border-box',
    fontFamily:'inherit',
  };

  return (
    <div style={{ padding:'40px 8%', maxWidth:'620px', margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Georgia,serif', fontSize:'2rem', marginBottom:'6px', fontWeight:400 }}>
        Book Appointment
      </h1>
      <p style={{ color:'#6b7280', fontSize:'0.88rem', marginBottom:'32px' }}>
        Schedule a free measurement visit at our shop or home — available in Saharanpur & nearby areas.
      </p>

      <div style={{ background:'#fff', borderRadius:'12px', padding:'28px', border:'1px solid #f0ece4', display:'grid', gap:'20px' }}>

        {/* Visit Type */}
        <div>
          <label style={{ fontSize:'0.78rem', fontWeight:600, display:'block', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.5px', color:'#374151' }}>
            Visit Type *
          </label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {[
              { value:'shop_visit', label:'🏪 Shop Visit',  desc:'Come to our Saharanpur store' },
              { value:'home_visit', label:'🏠 Home Visit',  desc:'We come to you — FREE' },
            ].map(t => (
              <label key={t.value} style={{ padding:'14px', border:`2px solid ${form.type===t.value?'#1B4332':'#e5e7eb'}`, borderRadius:'8px', cursor:'pointer', background:form.type===t.value?'#f0fdf4':'#fff', transition:'all .2s', display:'block' }}>
                <input type="radio" name="type" style={{ display:'none' }} checked={form.type===t.value} onChange={() => setForm(f => ({ ...f, type:t.value }))} />
                <div style={{ fontWeight:600, fontSize:'0.85rem', marginBottom:'3px' }}>{t.label}</div>
                <div style={{ fontSize:'0.72rem', color:'#9ca3af' }}>{t.desc}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label style={{ fontSize:'0.78rem', fontWeight:600, display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px', color:'#374151' }}>
            Purpose *
          </label>
          <div style={{ display:'grid', gap:'8px' }}>
            {PURPOSES.map(p => (
              <label key={p.value} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', border:`1.5px solid ${form.purpose===p.value?'#1B4332':'#e5e7eb'}`, borderRadius:'7px', cursor:'pointer', background:form.purpose===p.value?'#f0fdf4':'#fff', transition:'all .2s' }}>
                <input type="radio" name="purpose" checked={form.purpose===p.value} onChange={() => setForm(f => ({ ...f, purpose:p.value }))} style={{ accentColor:'#1B4332' }}/>
                <span style={{ fontSize:'0.85rem', fontWeight:form.purpose===p.value?500:400 }}>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label style={{ fontSize:'0.78rem', fontWeight:600, display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px', color:'#374151' }}>
            Preferred Date *
          </label>
          <input
            type="date"
            min={minDateStr}
            value={form.appointment_date}
            onChange={e => {
              setForm(f => ({ ...f, appointment_date:e.target.value, time_slot:'' }));
              loadSlots(e.target.value);
            }}
            style={inp}
          />
        </div>

        {/* Time Slots */}
        {form.appointment_date && (
          <div>
            <label style={{ fontSize:'0.78rem', fontWeight:600, display:'block', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.5px', color:'#374151' }}>
              Time Slot *
            </label>
            {loading ? (
              <div style={{ color:'#9ca3af', fontSize:'0.83rem', padding:'12px' }}>Loading available slots...</div>
            ) : slots.length === 0 ? (
              /* Fallback: show default slots if API failed */
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:'8px' }}>
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, time_slot:t }))}
                    style={{ padding:'10px 6px', border:`2px solid ${form.time_slot===t?'#1B4332':'#e5e7eb'}`, borderRadius:'6px', background:form.time_slot===t?'#f0fdf4':'#fff', cursor:'pointer', fontSize:'0.78rem', fontWeight:form.time_slot===t?600:400, color:form.time_slot===t?'#1B4332':'#374151', transition:'all .2s', textAlign:'center' }}>
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:'8px' }}>
                {slots.map(slot => (
                  <button key={slot.time} disabled={!slot.available}
                    onClick={() => setForm(f => ({ ...f, time_slot:slot.time }))}
                    style={{ padding:'10px 6px', border:`2px solid ${form.time_slot===slot.time?'#1B4332':slot.available?'#e5e7eb':'#f3f4f6'}`, borderRadius:'6px', background:form.time_slot===slot.time?'#f0fdf4':slot.available?'#fff':'#f9fafb', cursor:slot.available?'pointer':'not-allowed', opacity:slot.available?1:0.45, fontSize:'0.78rem', fontWeight:form.time_slot===slot.time?600:400, color:form.time_slot===slot.time?'#1B4332':'#374151', transition:'all .2s', textAlign:'center' }}>
                    {slot.time}
                    <div style={{ fontSize:'0.62rem', color:slot.available?'#059669':'#ef4444', marginTop:'2px' }}>
                      {slot.available ? `${3-slot.booked_count} left` : 'Full'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Home visit info */}
        {form.type === 'home_visit' && (
          <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'8px', padding:'12px 14px', fontSize:'0.82rem', color:'#92400e' }}>
            🏠 <strong>Home Visit:</strong> Available in Saharanpur, Rampur Maniharan & nearby areas. Please mention your full address in the notes below. Our tailor will contact you to confirm.
          </div>
        )}

        {/* Notes */}
        <div>
          <label style={{ fontSize:'0.78rem', fontWeight:600, display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px', color:'#374151' }}>
            Notes {form.type==='home_visit' ? '(Include your address) *' : '(Optional)'}
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes:e.target.value }))}
            rows={form.type==='home_visit' ? 3 : 2}
            placeholder={form.type==='home_visit'
              ? 'Full address for home visit (street, area, city, pincode)...'
              : 'Any specific requirements, style preferences, or questions...'}
            style={{ ...inp, resize:'vertical' }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={book}
          disabled={!form.appointment_date || !form.time_slot || placing}
          style={{
            padding:'14px', border:'none', borderRadius:'8px', fontSize:'0.9rem',
            fontWeight:600, cursor:(!form.appointment_date||!form.time_slot||placing)?'not-allowed':'pointer',
            background:(!form.appointment_date||!form.time_slot)?'#e5e7eb':'#1B4332',
            color:(!form.appointment_date||!form.time_slot)?'#9ca3af':'#fff',
            transition:'all .2s',
          }}
        >
          {placing ? '⏳ Booking...' : '📅 Confirm Appointment — Free'}
        </button>

        <p style={{ textAlign:'center', fontSize:'0.75rem', color:'#9ca3af', margin:'-8px 0 0' }}>
          We'll confirm your appointment within 2 hours via SMS/WhatsApp
        </p>
      </div>
    </div>
  );
}

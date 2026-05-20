// ============================================================
// src/pages/CustomTailoring.jsx  — Full custom order flow
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, customOrderAPI, measurementAPI, appointmentAPI } from '../services/api';
import { useAuthStore } from '../context/authStore';
import toast from 'react-hot-toast';

const STYLES = [
  { key:'kurta',    label:'Kurta',      icon:'👘', desc:'Traditional Indian top' },
  { key:'pajama',   label:'Pajama',     icon:'👖', desc:'Comfortable bottom wear' },
  { key:'kurta_set',label:'Kurta Set',  icon:'🎽', desc:'Kurta + Pajama combo' },
  { key:'shirt',    label:'Shirt',      icon:'👔', desc:'Formal & casual shirts' },
  { key:'pant',     label:'Pant',       icon:'👗', desc:'Formal trousers' },
  { key:'coat',     label:'Coat',       icon:'🥼', desc:'Formal coat' },
  { key:'blazer',   label:'Blazer',     icon:'🧥', desc:'Smart casual blazer' },
  { key:'jacket',   label:'Jacket',     icon:'🧶', desc:'Warm jackets' },
  { key:'coat_pant',label:'Coat & Pant',icon:'🎩', desc:'Complete suit' },
  { key:'other',    label:'Custom',     icon:'✏️',  desc:'Describe your design' },
];

const MEASURE_FIELDS = [
  { key:'chest',        label:'Chest',         unit:'inches', icon:'📏', tip:'Measure around fullest part of chest' },
  { key:'waist',        label:'Waist',         unit:'inches', icon:'📏', tip:'Measure around natural waistline' },
  { key:'hips',         label:'Hips',          unit:'inches', icon:'📏', tip:'Measure around fullest part of hips' },
  { key:'shoulder',     label:'Shoulder',      unit:'inches', icon:'📐', tip:'From one shoulder tip to other' },
  { key:'shirt_length', label:'Shirt Length',  unit:'inches', icon:'↕️',  tip:'From shoulder to desired length' },
  { key:'pant_length',  label:'Pant Length',   unit:'inches', icon:'↕️',  tip:'From waist to ankle' },
  { key:'sleeve_length',label:'Sleeve',        unit:'inches', icon:'💪', tip:'From shoulder to wrist' },
  { key:'neck',         label:'Neck',          unit:'inches', icon:'🔄', tip:'Around the neck + 0.5 inch ease' },
  { key:'thigh',        label:'Thigh',         unit:'inches', icon:'📏', tip:'Around fullest part of thigh' },
  { key:'inseam',       label:'Inseam',        unit:'inches', icon:'↕️',  tip:'From crotch to ankle bone' },
];

export default function CustomTailoring() {
  const [step,     setStep]     = useState(1);
  const [style,    setStyle]    = useState(null);
  const [fabric,   setFabric]   = useState(null);
  const [fabrics,  setFabrics]  = useState([]);
  const [measMode, setMeasMode] = useState('manual'); // manual | saved | appointment
  const [measures, setMeasures] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [selProfile,setSelProfile]=useState(null);
  const [instructions,setInstructions]=useState('');
  const [refImage, setRefImage] = useState(null);
  const [placing,  setPlacing]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    productAPI.list({ per_page: 50 })
      .then(r => setFabrics(r.data?.data?.data || r.data?.data || []))
      .catch(() => setFabrics([]))
      .finally(() => setLoading(false));
    if (isLoggedIn()) measurementAPI.list().then(r => setProfiles(r.data.data || []));
  }, []);

  const setM = (key, val) => setMeasures(m => ({ ...m, [key]: val }));

  const placeOrder = async () => {
    if (!isLoggedIn()) { navigate('/login', { state: { from: '/custom-tailoring' } }); return; }
    if (!style) { toast.error('Select a style first'); setStep(1); return; }
    setPlacing(true);
    try {
      // Build payload — individual measurement fields at root level
      const payload = {
        style_type:              style,
        fabric_product_id:       fabric?.id  || undefined,
        fabric_name:             fabric?.name || undefined,
        measurement_profile_id:  selProfile  || undefined,
        special_instructions:    instructions || undefined,
        // Spread individual measurement values (chest, waist, etc.)
        ...Object.fromEntries(
          Object.entries(measures).filter(([, v]) => v !== '' && v != null)
        ),
      };

      const res = await customOrderAPI.place(payload);
      const orderId     = res.data.data.id;
      const orderNumber = res.data.data.custom_order_number;

      // Upload reference image separately if provided
      if (refImage) {
        try {
          const fd = new FormData();
          fd.append('image', refImage);
          await customOrderAPI.uploadReference(orderId, fd);
        } catch {
          // Non-fatal — order is placed, image just didn't upload
          toast('Order placed! Image upload failed — you can add it later.', { icon: 'ℹ️' });
        }
      }

      toast.success("Custom order placed! We'll confirm shortly 🎉");
      navigate(`/account/custom-orders/${orderNumber}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(e => toast.error(Array.isArray(e) ? e[0] : e));
      } else {
        toast.error(err.response?.data?.message || 'Failed to place order');
      }
    } finally { setPlacing(false); }
  };

  const steps = ['Choose Style', 'Select Fabric', 'Measurements', 'Instructions', 'Review'];

  return (
    <div style={{ padding: '40px 8%', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C5933A', marginBottom: '10px' }}>Bespoke Craftsmanship</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', marginBottom: '10px', fontWeight: 400 }}>Custom Tailoring</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Your fabric, your design, your perfect fit — crafted in 7–10 days.</p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', marginBottom: '40px', gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {i > 0 && <div style={{ position: 'absolute', left: '-50%', top: '14px', width: '100%', height: '2px', background: step > i ? '#1B4332' : '#e5e7eb', zIndex: 0 }} />}
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step > i ? '#1B4332' : step === i+1 ? '#C5933A' : '#e5e7eb', color: step > i || step === i+1 ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, zIndex: 1, position: 'relative' }}>
              {step > i ? '✓' : i+1}
            </div>
            <div style={{ fontSize: '0.68rem', color: step === i+1 ? '#1B4332' : '#9ca3af', marginTop: '6px', textAlign: 'center', fontWeight: step === i+1 ? 600 : 400 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* STEP 1: Style */}
      {step === 1 && (
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.3rem', marginBottom: '20px' }}>Choose Your Style</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '12px', marginBottom: '28px' }}>
            {STYLES.map(s => (
              <button key={s.key} onClick={() => setStyle(s.key)} style={{
                padding: '18px 12px', border: `2px solid ${style === s.key ? '#1B4332' : '#e5e7eb'}`,
                borderRadius: '10px', background: style === s.key ? '#f0fdf4' : '#fff',
                cursor: 'pointer', transition: 'all .2s', textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: style === s.key ? '#1B4332' : '#111', marginBottom: '3px' }}>{s.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{s.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => { if (!style) { toast.error('Please select a style'); return; } setStep(2); }} style={btnStyle}>Next: Select Fabric →</button>
        </div>
      )}

      {/* STEP 2: Fabric */}
      {step === 2 && (
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.3rem', marginBottom: '8px' }}>Select Fabric</h2>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '20px' }}>Choose from our available fabrics or skip to use your own.</p>
          {fabrics.length === 0 && !loading && (
            <div style={{ textAlign:'center', padding:'40px', color:'#9ca3af', background:'#f9fafb', borderRadius:'10px', marginBottom:'20px' }}>
              No fabrics found. Add fabric products under the "Fabric &amp; Thaan" category in admin.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px', marginBottom: '20px' }}>
            {fabrics.map(f => {
              const rawPath = f.thumbnail || f.images?.[0]?.image_path;
              const imgUrl = rawPath
                ? (rawPath.startsWith('http') ? rawPath : `http://localhost:8000/storage/${rawPath}`)
                : '/placeholders/product-fabric.png';
              const isSelected = fabric?.id === f.id;
              return (
                <button key={f.id} onClick={() => setFabric(isSelected ? null : f)} style={{
                  padding: '0', border: `2px solid ${isSelected ? '#1B4332' : '#e5e7eb'}`,
                  borderRadius: '10px', background: isSelected ? '#f0fdf4' : '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'all .2s', overflow: 'hidden',
                  boxShadow: isSelected ? '0 0 0 3px rgba(27,67,50,0.15)' : 'none'
                }}>
                  <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', position: 'relative', background: '#f7f2ea' }}>
                    <img
                      src={imgUrl}
                      alt={f.name}
                      onError={e => { e.target.src = '/placeholders/product-fabric.png'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }}
                      onMouseOver={e => e.target.style.transform='scale(1.05)'}
                      onMouseOut={e => e.target.style.transform='scale(1)'}
                    />
                    {isSelected && (
                      <div style={{ position:'absolute', top:'8px', right:'8px', width:'22px', height:'22px', borderRadius:'50%', background:'#1B4332', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700 }}>✓</div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.83rem', color: isSelected ? '#1B4332' : '#111', marginBottom: '2px' }}>{f.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '2px' }}>{f.fabric_type?.name || f.category?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#C5933A', fontWeight: 600 }}>₹{(f.sale_price || f.price)?.toLocaleString()}/m</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(1)} style={btnOutlineStyle}>← Back</button>
            <button onClick={() => setStep(3)} style={btnStyle}>Next: Measurements →</button>
          </div>
        </div>
      )}

      {/* STEP 3: Measurements */}
      {step === 3 && (
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.3rem', marginBottom: '16px' }}>Your Measurements</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[
              { key:'manual',      label:'📝 Enter Manually' },
              { key:'saved',       label:'💾 Use Saved Profile', disabled: !profiles.length },
              { key:'appointment', label:'📅 Book Appointment' },
            ].map(m => (
              <button key={m.key} onClick={() => !m.disabled && setMeasMode(m.key)} style={{
                padding: '10px 18px', border: `2px solid ${measMode === m.key ? '#1B4332' : '#e5e7eb'}`,
                borderRadius: '8px', background: measMode === m.key ? '#f0fdf4' : '#fff',
                cursor: m.disabled ? 'not-allowed' : 'pointer', opacity: m.disabled ? 0.5 : 1,
                fontSize: '0.82rem', fontWeight: measMode === m.key ? 600 : 400
              }}>{m.label}</button>
            ))}
          </div>

          {measMode === 'manual' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px', marginBottom: '20px' }}>
              {MEASURE_FIELDS.map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{f.icon}</span> {f.label}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" step="0.5" placeholder="0.0" value={measures[f.key] || ''} onChange={e => setM(f.key, e.target.value)}
                      style={{ width: '100%', padding: '8px 40px 8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: '#9ca3af' }}>in</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{f.tip}</span>
                </div>
              ))}
            </div>
          )}

          {measMode === 'saved' && profiles.length > 0 && (
            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
              {profiles.map(p => (
                <label key={p.id} style={{ display: 'flex', gap: '12px', padding: '14px', border: `2px solid ${selProfile === p.id ? '#1B4332' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', background: selProfile === p.id ? '#f0fdf4' : '#fff' }}>
                  <input type="radio" name="profile" checked={selProfile === p.id} onChange={() => setSelProfile(p.id)} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.88rem', marginBottom: '4px' }}>{p.profile_name} {p.is_default && '(Default)'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Chest: {p.chest}" · Waist: {p.waist}" · Length: {p.shirt_length}"</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {measMode === 'appointment' && (
            <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📅</div>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', marginBottom: '8px' }}>Book a Free Measurement Visit</h3>
              <p style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: '16px' }}>Our tailor will visit you at home or you can come to our shop.</p>
              <button onClick={() => navigate('/book-appointment')} style={{ padding: '10px 24px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Book Free Appointment →</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(2)} style={btnOutlineStyle}>← Back</button>
            <button onClick={() => setStep(4)} style={btnStyle}>Next: Instructions →</button>
          </div>
        </div>
      )}

      {/* STEP 4: Instructions */}
      {step === 4 && (
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.3rem', marginBottom: '16px' }}>Special Instructions</h2>
          <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Special Instructions / Design Notes</label>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={5}
                placeholder="e.g. Collar design, pocket style, sleeve type, fitting preference (slim/regular/loose), any specific details..."
                style={{ width: '100%', padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Reference Image (Optional)</label>
              <input type="file" accept="image/*" onChange={e => setRefImage(e.target.files[0])}
                style={{ display: 'block', fontSize: '0.82rem', width: '100%' }} />
              <p style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: '4px' }}>Upload a photo of the style you want (from magazine, social media, etc.)</p>
              {refImage && <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#059669' }}>✓ {refImage.name} selected</div>}
            </div>
          </div>
          <div style={{ padding: '14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '20px', fontSize: '0.82rem', color: '#92400e' }}>
            💡 The more details you provide, the better we can fulfil your vision. Our tailor will review and confirm before starting.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(3)} style={btnOutlineStyle}>← Back</button>
            <button onClick={() => setStep(5)} style={btnStyle}>Review Order →</button>
          </div>
        </div>
      )}

      {/* STEP 5: Review */}
      {step === 5 && (
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.3rem', marginBottom: '20px' }}>Review Your Custom Order</h2>
          <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Style Type', value: STYLES.find(s => s.key === style)?.label },
              { label: 'Fabric',     value: fabric ? `${fabric.name} — ₹${fabric.price}/m` : 'Not selected (will discuss)' },
              { label: 'Measurements', value: measMode === 'appointment' ? 'Via appointment booking' : measMode === 'saved' ? `Saved profile #${selProfile}` : `Manual — ${Object.keys(measures).filter(k=>measures[k]).length} fields filled` },
              { label: 'Instructions', value: instructions || 'None' },
              { label: 'Reference Image', value: refImage ? refImage.name : 'Not uploaded' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: '16px', padding: '14px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', minWidth: '120px', textTransform: 'uppercase', letterSpacing: '0.5px', paddingTop: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '0.85rem', color: '#111', lineHeight: 1.5 }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '20px', fontSize: '0.83rem', color: '#166534' }}>
            ✅ After placing your order, our team will review and send you a final price estimate within 4 hours.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(4)} style={btnOutlineStyle}>← Back</button>
            <button onClick={placeOrder} disabled={placing} style={{ ...btnStyle, flex: 1, justifyContent: 'center' }}>
              {placing ? '⏳ Placing Order...' : '✅ Place Custom Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = { padding:'12px 28px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'4px', fontSize:'0.88rem', cursor:'pointer', fontWeight:500, transition:'background .2s', display:'inline-flex', alignItems:'center', gap:'6px' };
const btnOutlineStyle = { padding:'12px 20px', border:'1.5px solid #e5e7eb', background:'#fff', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem', color:'#374151', transition:'all .2s' };

import { useState } from 'react';
import { wholesaleAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Wholesale() {
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({ business_name: '', gst_number: '', business_type: '', contact_name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', expected_monthly_value: '', products_interested: [], notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const PRODUCT_TYPES = ['Kurtas', 'Suits', 'Sherwanis', 'Sarees', 'Dupattas', 'Fabric (By Meter)', 'Ready to Wear', 'Custom Tailoring'];

  const toggleProduct = (p) => setForm(f => ({
    ...f,
    products_interested: f.products_interested.includes(p)
      ? f.products_interested.filter(x => x !== p)
      : [...f.products_interested, p]
  }));

  const submit = async () => {
    setSubmitting(true);
    try {
      await wholesaleAPI.apply(form);
      setSubmitted(true);
      toast.success('Application submitted! We\'ll contact you within 48 hours.');
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', marginBottom: '12px', fontWeight: 400 }}>Application Submitted!</h2>
      <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '24px' }}>
        Thank you for your interest in KhadiCraft wholesale. Our team will review your application and contact you within 48 business hours.
      </p>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', fontSize: '0.85rem', color: '#166534' }}>
        📧 Confirmation sent to {form.email}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '60px 8%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏭</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2.2rem', fontWeight: 400, marginBottom: '12px' }}>Wholesale Partnership</h1>
        <p style={{ color: '#6b7280', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
          Partner with KhadiCraft for premium handwoven khadi and ethnic wear. Competitive wholesale pricing, minimum order flexibility, and dedicated account management.
        </p>
      </div>

      {/* Benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '48px' }}>
        {[
          { icon: '💰', title: 'Wholesale Pricing', desc: 'Up to 40% off retail prices for bulk orders' },
          { icon: '📦', title: 'Flexible MOQ',      desc: 'Minimum order quantities starting from ₹25,000' },
          { icon: '✂️', title: 'Custom Branding',    desc: 'Private label and custom packaging available' },
        ].map(b => (
          <div key={b.title} style={{ background: '#fff', border: '1px solid #f0ece4', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{b.icon}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{b.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{b.desc}</div>
          </div>
        ))}
      </div>

      {/* Application Form */}
      <div style={{ background: '#fff', border: '1px solid #f0ece4', borderRadius: '12px', padding: '32px' }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.3rem', marginBottom: '24px', fontWeight: 500 }}>Apply for Wholesale Account</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[['Business Name *', 'business_name', 'text'], ['GST Number', 'gst_number', 'text'], ['Contact Person *', 'contact_name', 'text'], ['Phone *', 'phone', 'tel']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', marginBottom: '5px' }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}>Products Interested In</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PRODUCT_TYPES.map(p => (
                <button key={p} type="button" onClick={() => toggleProduct(p)} style={{ padding: '6px 14px', border: `1.5px solid ${form.products_interested.includes(p) ? '#1B4332' : '#e5e7eb'}`, borderRadius: '20px', background: form.products_interested.includes(p) ? '#f0fdf4' : '#fff', color: form.products_interested.includes(p) ? '#1B4332' : '#6b7280', fontSize: '0.78rem', cursor: 'pointer', fontWeight: form.products_interested.includes(p) ? 600 : 400, transition: 'all .2s' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Expected Monthly Order Value (₹)</label>
            <select value={form.expected_monthly_value} onChange={e => setForm(f => ({ ...f, expected_monthly_value: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
              <option value="">Select range</option>
              {['25,000 - 50,000', '50,000 - 1,00,000', '1,00,000 - 5,00,000', '5,00,000+'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Additional Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Tell us about your business, requirements, or any questions..." style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.83rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <button onClick={submit} disabled={submitting || !form.business_name || !form.email || !form.phone} style={{ padding: '13px', background: (!form.business_name || !form.email || !form.phone) ? '#e5e7eb' : '#1B4332', color: (!form.business_name || !form.email || !form.phone) ? '#9ca3af' : '#fff', border: 'none', borderRadius: '6px', fontSize: '0.9rem', cursor: (!form.business_name || !form.email || !form.phone) ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            {submitting ? '⏳ Submitting...' : '🤝 Submit Wholesale Application'}
          </button>
        </div>
      </div>
    </div>
  );
}

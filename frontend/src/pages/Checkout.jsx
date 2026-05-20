import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileAPI, orderAPI, paymentAPI } from '../services/api';
import { useCartStore } from '../context/authStore';
import toast from 'react-hot-toast';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_RuNrgdCHsyUsJ8';

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const s = document.createElement('script');
    s.id = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const { items, total: totalFn, clearCart } = useCartStore();
  const total = totalFn();

  const [addresses, setAddresses] = useState([]);
  const [selAddr,   setSelAddr]   = useState(null);
  const [payment,   setPayment]   = useState('cod');
  const [step,      setStep]      = useState(1); // 1=address, 2=payment, 3=review
  const [placing,   setPlacing]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    profileAPI.getAddresses().then(r => {
      const addrs = r.data.data || [];
      setAddresses(addrs);
      const def = addrs.find(a => a.is_default) || addrs[0];
      if (def) setSelAddr(def.id);
    }).catch(() => toast.error('Failed to load addresses'));
  }, []);

  const shipping   = total >= 1000 ? 0 : 80;
  const gst        = Math.round(total * 0.18 * 100) / 100;
  const grandTotal = total + shipping + gst;

  /* ── Place order then handle payment ── */
  const handlePlaceOrder = async () => {
    if (!selAddr) { toast.error('Select a delivery address'); return; }
    if (!items.length) { toast.error('Your cart is empty'); return; }

    const needsRazorpay = ['upi', 'online', 'razorpay'].includes(payment);

    if (needsRazorpay) {
      await handleRazorpayFlow();
    } else {
      await placeCodOrder();
    }
  };

  /* ── COD flow ── */
  const placeCodOrder = async () => {
    setPlacing(true);
    try {
      const res = await orderAPI.place({
        items: items.map(i => ({ product_id: i.product.id, variant_id: i.variant?.id || null, quantity: i.quantity })),
        payment_method: payment,
        shipping_address_id: selAddr,
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-success/${res.data.data.order_number}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach(e => toast.error(Array.isArray(e) ? e[0] : e));
      else toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  /* ── Razorpay flow ── */
  const handleRazorpayFlow = async () => {
    setPlacing(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error('Razorpay failed to load. Check your connection.');
      setPlacing(false);
      return;
    }

    let order;
    try {
      // 1. Create the order in our DB first
      const res = await orderAPI.place({
        items: items.map(i => ({ product_id: i.product.id, variant_id: i.variant?.id || null, quantity: i.quantity })),
        payment_method: payment,
        shipping_address_id: selAddr,
      });
      order = res.data.data;
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach(e => toast.error(Array.isArray(e) ? e[0] : e));
      else toast.error(err.response?.data?.message || 'Failed to create order');
      setPlacing(false);
      return;
    }

    let rzpOrder;
    try {
      // 2. Create Razorpay order
      const rzpRes = await paymentAPI.createOrder({ order_id: order.id, amount: order.total });
      rzpOrder = rzpRes.data.data;
    } catch {
      toast.error('Payment gateway error. Please try again.');
      setPlacing(false);
      return;
    }

    // 3. Open Razorpay checkout
    const addr = addresses.find(a => a.id === selAddr);
    const options = {
      key:         RAZORPAY_KEY,
      amount:      rzpOrder.amount,
      currency:    rzpOrder.currency || 'INR',
      name:        'KhadiCraft by Goldy',
      description: `Order ${order.order_number}`,
      order_id:    rzpOrder.id,
      prefill: {
        name:    addr?.full_name || '',
        contact: addr?.phone || '',
      },
      theme: { color: '#1B4332' },
      method: payment === 'upi' ? { upi: true, card: false, netbanking: false, wallet: false } : undefined,
      handler: async (response) => {
        // 4. Verify payment on backend
        try {
          await paymentAPI.verify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_signature:  response.razorpay_signature,
            order_id:            order.id,
          });
          clearCart();
          toast.success('Payment successful! 🎉');
          navigate(`/order-success/${order.order_number}`);
        } catch {
          toast.error('Payment verification failed. Contact support.');
        }
        setPlacing(false);
      },
      modal: {
        ondismiss: () => {
          toast('Payment cancelled. Your order is saved — you can pay later.', { icon: 'ℹ️' });
          setPlacing(false);
          navigate(`/order-success/${order.order_number}`);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => {
      toast.error('Payment failed. Please try again.');
      setPlacing(false);
    });
    rzp.open();
  };

  const selAddress = addresses.find(a => a.id === selAddr);

  return (
    <div style={{ padding:'40px 8%', maxWidth:'1100px', margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.8rem', marginBottom:'8px', fontWeight:400 }}>Checkout</h1>

      {/* Steps */}
      <div style={{ display:'flex', marginBottom:'32px' }}>
        {['Delivery Address','Payment','Review & Place'].map((s,i) => (
          <div key={s} style={{ flex:1, display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', opacity:step < i+1 ? 0.4 : 1, cursor:step > i+1 ? 'pointer' : 'default' }}
              onClick={() => step > i+1 && setStep(i+1)}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:step >= i+1 ? '#1B4332' : '#e5e7eb', color:step >= i+1 ? '#fff' : '#6b7280', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.78rem', fontWeight:600, flexShrink:0 }}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span style={{ fontSize:'0.82rem', fontWeight:step === i+1 ? 600 : 400 }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex:1, height:'1px', background:'#e5e7eb', margin:'0 10px' }}/>}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'32px', alignItems:'start' }}>
        <div>
          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ background:'#fff', borderRadius:'10px', padding:'24px', border:'1px solid #f0ece4' }}>
              <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', marginBottom:'20px' }}>Select Delivery Address</h3>
              <div style={{ display:'grid', gap:'12px', marginBottom:'20px' }}>
                {addresses.length === 0 && (
                  <div style={{ textAlign:'center', padding:'28px', color:'#9ca3af', fontSize:'0.85rem' }}>
                    No addresses saved.{' '}
                    <Link to="/account/addresses" style={{ color:'#1B4332' }}>Add one →</Link>
                  </div>
                )}
                {addresses.map(addr => (
                  <label key={addr.id} style={{ display:'flex', gap:'12px', padding:'14px', border:`2px solid ${selAddr===addr.id?'#1B4332':'#e5e7eb'}`, borderRadius:'8px', cursor:'pointer', background:selAddr===addr.id?'#f0fdf4':'#fff', transition:'all .2s' }}>
                    <input type="radio" name="address" checked={selAddr===addr.id} onChange={() => setSelAddr(addr.id)} style={{ marginTop:'2px', accentColor:'#1B4332' }}/>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.88rem', marginBottom:'3px' }}>{addr.full_name} · {addr.phone}</div>
                      <div style={{ fontSize:'0.82rem', color:'#6b7280', lineHeight:1.5 }}>
                        {addr.address_line1}{addr.address_line2 ? ', '+addr.address_line2 : ''}, {addr.city}, {addr.state} — {addr.pincode}
                      </div>
                      {addr.is_default && <span style={{ fontSize:'0.68rem', background:'#dcfce7', color:'#166534', padding:'2px 7px', borderRadius:'4px', marginTop:'4px', display:'inline-block' }}>Default</span>}
                    </div>
                  </label>
                ))}
                <Link to="/account/addresses" style={{ display:'block', padding:'12px', border:'1px dashed #d1d5db', borderRadius:'8px', textAlign:'center', color:'#1B4332', fontSize:'0.83rem', fontWeight:500 }}>
                  + Add New Address
                </Link>
              </div>
              <button onClick={() => selAddr && setStep(2)} disabled={!selAddr}
                style={{ padding:'12px 28px', background:selAddr?'#1B4332':'#e5e7eb', color:selAddr?'#fff':'#9ca3af', border:'none', borderRadius:'6px', fontSize:'0.85rem', cursor:selAddr?'pointer':'not-allowed', fontWeight:500 }}>
                Continue to Payment →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ background:'#fff', borderRadius:'10px', padding:'24px', border:'1px solid #f0ece4' }}>
              <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', marginBottom:'20px' }}>Select Payment Method</h3>
              <div style={{ display:'grid', gap:'12px', marginBottom:'24px' }}>
                {[
                  { key:'cod',    label:'Cash on Delivery', desc:'Pay when your order arrives',          icon:'💵', badge:null },
                  { key:'upi',    label:'UPI / QR Code',    desc:'PhonePe, GPay, Paytm, BHIM — instant', icon:'📱', badge:'POPULAR' },
                  { key:'online', label:'Card / Net Banking',desc:'Debit, Credit card, Net Banking',     icon:'💳', badge:'SECURE' },
                ].map(opt => (
                  <label key={opt.key} style={{ display:'flex', gap:'14px', padding:'16px', border:`2px solid ${payment===opt.key?'#1B4332':'#e5e7eb'}`, borderRadius:'8px', cursor:'pointer', background:payment===opt.key?'#f0fdf4':'#fff', transition:'all .2s', alignItems:'center', position:'relative' }}>
                    <input type="radio" name="payment" value={opt.key} checked={payment===opt.key} onChange={() => setPayment(opt.key)} style={{ accentColor:'#1B4332' }}/>
                    <span style={{ fontSize:'1.5rem' }}>{opt.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:500, fontSize:'0.88rem', display:'flex', alignItems:'center', gap:'8px' }}>
                        {opt.label}
                        {opt.badge && <span style={{ fontSize:'0.6rem', background:opt.key==='upi'?'#dcfce7':'#dbeafe', color:opt.key==='upi'?'#166534':'#1d4ed8', padding:'2px 6px', borderRadius:'4px', fontWeight:700, letterSpacing:'0.5px' }}>{opt.badge}</span>}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'#6b7280', marginTop:'2px' }}>{opt.desc}</div>
                    </div>
                    {['upi','online'].includes(opt.key) && (
                      <div style={{ fontSize:'0.65rem', color:'#059669', display:'flex', alignItems:'center', gap:'3px' }}>
                        🔒 Razorpay
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {['upi','online'].includes(payment) && (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'8px', padding:'12px 14px', fontSize:'0.8rem', color:'#166534', marginBottom:'16px' }}>
                  🔒 <strong>Secured by Razorpay.</strong> Your payment is encrypted and processed safely. You'll be redirected to Razorpay's secure checkout.
                </div>
              )}
              <div style={{ display:'flex', gap:'10px' }}>
                <button onClick={() => setStep(1)} style={{ padding:'12px 20px', border:'1px solid #e5e7eb', background:'#fff', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ padding:'12px 28px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'6px', fontSize:'0.85rem', cursor:'pointer', fontWeight:500 }}>
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ background:'#fff', borderRadius:'10px', padding:'24px', border:'1px solid #f0ece4' }}>
              <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', marginBottom:'20px' }}>Review Your Order</h3>

              <div style={{ marginBottom:'20px', padding:'14px', background:'#f9fafb', borderRadius:'8px', display:'grid', gap:'4px' }}>
                <div style={{ fontSize:'0.7rem', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px' }}>Delivering to</div>
                <div style={{ fontSize:'0.88rem', fontWeight:600 }}>{selAddress?.full_name} · {selAddress?.phone}</div>
                <div style={{ fontSize:'0.8rem', color:'#6b7280' }}>{selAddress?.address_line1}, {selAddress?.city}, {selAddress?.state} — {selAddress?.pincode}</div>
                <div style={{ fontSize:'0.8rem', color:'#374151', marginTop:'4px' }}>
                  Payment: <strong style={{ textTransform:'capitalize' }}>{payment === 'upi' ? 'UPI / QR (Razorpay)' : payment === 'online' ? 'Card / Net Banking (Razorpay)' : 'Cash on Delivery'}</strong>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
                {items.map(item => (
                  <div key={item.key} style={{ display:'flex', gap:'12px', alignItems:'center', padding:'10px', background:'#f9fafb', borderRadius:'6px' }}>
                    <div style={{ width:'44px', height:'44px', background:'#f7f2ea', borderRadius:'6px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>
                      {item.product.thumbnail ? <img src={`http://localhost:8000/storage/${item.product.thumbnail}`} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'6px' }} alt=""/> : '🏷️'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.85rem', fontWeight:500 }}>{item.product.name}</div>
                      {item.variant && <div style={{ fontSize:'0.72rem', color:'#9ca3af' }}>{item.variant.name}</div>}
                      <div style={{ fontSize:'0.75rem', color:'#9ca3af' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:'10px' }}>
                <button onClick={() => setStep(2)} style={{ padding:'12px 20px', border:'1px solid #e5e7eb', background:'#fff', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' }}>← Back</button>
                <button onClick={handlePlaceOrder} disabled={placing}
                  style={{ flex:1, padding:'13px', background:placing?'#4a7c63':'#1B4332', color:'#fff', border:'none', borderRadius:'6px', fontSize:'0.9rem', cursor:placing?'not-allowed':'pointer', fontWeight:600, transition:'all .2s' }}>
                  {placing ? '⏳ Processing...' : ['upi','online'].includes(payment)
                    ? `💳 Pay ₹${grandTotal.toLocaleString()} via Razorpay`
                    : `✅ Place Order · ₹${grandTotal.toLocaleString()}`}
                </button>
              </div>

              {['upi','online'].includes(payment) && !placing && (
                <p style={{ textAlign:'center', fontSize:'0.72rem', color:'#9ca3af', marginTop:'10px' }}>
                  🔒 You'll be redirected to Razorpay's secure payment page
                </p>
              )}
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div style={{ background:'#fff', borderRadius:'10px', padding:'20px', border:'1px solid #f0ece4', position:'sticky', top:'80px' }}>
          <h4 style={{ fontFamily:'Georgia,serif', fontSize:'1rem', marginBottom:'16px' }}>Order Summary</h4>
          {items.slice(0,3).map(item => (
            <div key={item.key} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#6b7280', marginBottom:'6px' }}>
              <span style={{ maxWidth:'160px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.product.name} ×{item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          {items.length > 3 && <div style={{ fontSize:'0.75rem', color:'#9ca3af', marginBottom:'8px' }}>+{items.length-3} more items</div>}
          <div style={{ borderTop:'1px solid #f0ece4', paddingTop:'12px', marginTop:'8px', display:'grid', gap:'7px' }}>
            {[['Subtotal', `₹${total.toLocaleString()}`], ['Shipping', shipping===0?'FREE 🎉':'₹'+shipping], ['GST (18%)', `₹${gst}`]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:'#6b7280' }}><span>{l}</span><span>{v}</span></div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'1rem', marginTop:'6px', paddingTop:'8px', borderTop:'1px solid #f0ece4', color:'#1B4332' }}>
              <span>Total</span><span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
          {shipping === 0 && <div style={{ marginTop:'10px', fontSize:'0.72rem', color:'#059669', textAlign:'center' }}>🎉 You qualify for FREE shipping!</div>}
        </div>
      </div>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../context/authStore';

export default function Cart() {
  const { items, removeItem, updateQty, total: totalFn, clearCart } = useCartStore();
  const total = totalFn();

  const navigate = useNavigate();

  if (!items.length) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛍️</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', marginBottom: '12px' }}>Your Cart is Empty</h2>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>Looks like you haven't added anything yet.</p>
      <Link to="/shop" style={{ display: 'inline-block', padding: '12px 32px', background: '#1B4332', color: '#fff', borderRadius: '2px', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
        Continue Shopping →
      </Link>
    </div>
  );

  const shipping   = total >= 1000 ? 0 : 80;
  const gst        = Math.round(total * 0.18 * 100) / 100;
  const grandTotal = total + shipping + gst;


  return (
    <div style={{ padding: '40px 8%', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', marginBottom: '32px' }}>Shopping Cart ({items.length} items)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map(item => (
            <div key={item.key} style={{ display: 'flex', gap: '16px', background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #f0ece4' }}>
              <div style={{ width: '90px', height: '90px', background: '#f7f2ea', borderRadius: '6px', flexShrink: 0, overflow: 'hidden' }}>
                {item.product.thumbnail
                  ? <img src={`http://localhost:8000/storage/${item.product.thumbnail}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🏷️</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '1rem', marginBottom: '4px' }}>{item.product.name}</div>
                {item.variant && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px' }}>{item.variant.size} · {item.variant.color}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <button onClick={() => updateQty(item.key, item.quantity - 1)} style={{ width: '32px', height: '32px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '1rem' }}>−</button>
                    <span style={{ width: '40px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 500 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.key, item.quantity + 1)} style={{ width: '32px', height: '32px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                  <button onClick={() => removeItem(item.key)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Remove</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid #fecaca', color: '#ef4444', padding: '7px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑️ Clear Cart</button>
        </div>

        {/* Summary */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #f0ece4', position: 'sticky', top: '88px' }}>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.2rem', marginBottom: '20px' }}>Order Summary</h3>
          {[['Subtotal', `₹${total.toLocaleString()}`], ['Shipping', shipping === 0 ? 'FREE 🎉' : `₹${shipping}`], ['GST (18%)', `₹${gst}`]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem', color: '#6b7280' }}>
              <span>{l}</span><span style={{ color: v.includes('FREE') ? '#059669' : '#111' }}>{v}</span>
            </div>
          ))}
          {shipping > 0 && <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '12px' }}>Add ₹{(1000 - total).toLocaleString()} more for free shipping!</div>}
          <div style={{ borderTop: '1px solid #f0ece4', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem', marginBottom: '20px' }}>
            <span>Total</span><span>₹{grandTotal.toLocaleString()}</span>
          </div>
          <button onClick={() => navigate('/checkout')} style={{ width: '100%', padding: '14px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px' }}>
            Proceed to Checkout →
          </button>
          <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: '12px', color: '#6b7280', fontSize: '0.82rem' }}>← Continue Shopping</Link>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['Visa', 'MasterCard', 'UPI', 'COD'].map(m => (
              <span key={m} style={{ fontSize: '0.65rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 7px', borderRadius: '3px', color: '#9ca3af' }}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link, useParams } from 'react-router-dom';

export default function OrderSuccess() {
  const { number } = useParams();

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 24px' }}>✅</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', marginBottom: '10px', fontWeight: 400 }}>Order Placed!</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }}>Your order has been successfully placed.</p>
        <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '14px', marginBottom: '28px', display: 'inline-block' }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '4px' }}>ORDER NUMBER</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, color: '#1B4332' }}>{number}</div>
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.83rem', marginBottom: '28px', lineHeight: 1.7 }}>
          You'll receive an email confirmation shortly. Track your order status from your account.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/account/orders/${number}`} style={{ padding: '12px 24px', background: '#1B4332', color: '#fff', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none' }}>
            Track Order →
          </Link>
          <Link to="/shop" style={{ padding: '12px 24px', border: '1.5px solid #e5e7eb', color: '#374151', borderRadius: '4px', fontSize: '0.85rem', textDecoration: 'none' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

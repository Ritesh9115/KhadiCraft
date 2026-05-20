import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail]    = useState('');
  const [sent,  setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Reset OTP sent!');
    } catch (err) { toast.error(err.response?.data?.message || 'Email not found'); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{sent ? '📬' : '🔐'}</div>
        <h1 style={styles.heading}>{sent ? 'Check Your Email' : 'Forgot Password?'}</h1>
        <p style={styles.sub}>{sent ? `We sent a reset OTP to ${email}` : "Enter your email and we'll send you a reset OTP"}</p>

        {!sent ? (
          <form onSubmit={handleSubmit} style={{ marginTop: '24px', display: 'grid', gap: '14px' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset OTP →'}
            </button>
          </form>
        ) : (
          <button
            onClick={() => navigate('/reset-password', { state: { email } })}
            style={{ ...styles.btnPrimary, marginTop: '24px', width: '100%' }}
          >
            Enter OTP &amp; Reset Password →
          </button>
        )}
        <Link to="/login" style={{ display: 'block', marginTop: '16px', color: '#6b7280', textDecoration: 'none', fontSize: '0.82rem' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#F7F2EA 0%,#EDE3D4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 40px rgba(27,67,50,0.1)' },
  heading: { fontSize: '1.4rem', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '6px' },
  sub: { fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', marginBottom: '24px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.78rem', fontWeight: '500', color: '#374151', textAlign: 'left' },
  input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', transition: 'border .2s', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  btnPrimary: { padding: '12px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'background .2s', letterSpacing: '0.3px' },
};

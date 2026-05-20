import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const email     = location.state?.email || '';
  const [form, setForm]     = useState({ otp: '', password: '', password_confirmation: '' });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, ...form });
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔑</div>
          <h1 style={styles.heading}>Reset Password</h1>
          <p style={styles.sub}>Enter the OTP sent to <strong>{email}</strong></p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>OTP Code *</label>
            <input
              style={styles.input}
              placeholder="6-digit OTP"
              maxLength={6}
              required
              value={form.otp}
              onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                style={styles.input}
                type={show ? 'text' : 'password'}
                placeholder="Min 8 characters"
                required
                minLength={8}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <button type="button" style={styles.eyeBtn} onClick={() => setShow(s => !s)}>
                {show ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Repeat password"
              required
              value={form.password_confirmation}
              onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
            />
          </div>
          <button type="submit" style={styles.btnPrimary} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
        </form>
        <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '16px', color: '#6b7280', textDecoration: 'none', fontSize: '0.82rem' }}>
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
  sub: { fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', marginBottom: '0' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.78rem', fontWeight: '500', color: '#374151' },
  input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', transition: 'border .2s', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  btnPrimary: { padding: '12px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'background .2s', letterSpacing: '0.3px' },
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
};

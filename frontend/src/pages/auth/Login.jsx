// src/pages/auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin' || data.user.role === 'staff') navigate('/admin');
      else if (data.user.role === 'tailor') navigate('/tailor');
      else navigate(from);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoMark}>K</div>
          <div>
            <div style={styles.logoText}>KhadiCraft</div>
            <div style={styles.logoSub}>by Goldy</div>
          </div>
        </div>
        <h1 style={styles.heading}>Welcome Back</h1>
        <p style={styles.sub}>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div style={styles.formGroup}>
            <label style={{ ...styles.label, display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              <Link to="/forgot-password" style={{ color: '#C5933A', textDecoration: 'none', fontSize: '0.78rem' }}>Forgot password?</Link>
            </label>
            <div style={{ position: 'relative' }}>
              <input style={styles.input} type={show ? 'text' : 'password'} placeholder="Your password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              <button type="button" style={styles.eyeBtn} onClick={() => setShow(s => !s)}>{show ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <button type="submit" style={styles.btnPrimary} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={styles.divider}><span>or continue with</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button style={styles.btnSocial}>📱 Phone OTP</button>
          <button style={styles.btnSocial}>🌐 Google</button>
        </div>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Create one free →</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#F7F2EA 0%,#EDE3D4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 40px rgba(27,67,50,0.1)' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', justifyContent: 'center' },
  logoMark: { width: '38px', height: '38px', borderRadius: '50%', background: '#1B4332', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontSize: '1.1rem', fontWeight: '600' },
  logoText: { fontFamily: 'serif', fontSize: '1.1rem', color: '#1B4332', fontWeight: '600' },
  logoSub: { fontSize: '0.6rem', color: '#C5933A', letterSpacing: '1.5px', textTransform: 'uppercase' },
  heading: { fontSize: '1.4rem', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '6px' },
  sub: { fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', marginBottom: '24px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.78rem', fontWeight: '500', color: '#374151' },
  input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', transition: 'border .2s', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  btnPrimary: { padding: '12px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'background .2s', letterSpacing: '0.3px' },
  btnSocial: { padding: '10px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', transition: 'all .2s' },
  divider: { textAlign: 'center', position: 'relative', margin: '20px 0', color: '#9ca3af', fontSize: '0.78rem' },
  footerText: { textAlign: 'center', marginTop: '20px', fontSize: '0.83rem', color: '#6b7280' },
  link: { color: '#1B4332', textDecoration: 'none', fontWeight: '500' },
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
};

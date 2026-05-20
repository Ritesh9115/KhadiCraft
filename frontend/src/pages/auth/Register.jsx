import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await register(form);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      toast.error(err.message);
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm(x => ({ ...x, [key]: e.target.value })),
    style: { ...styles.input, ...(errors[key] ? { borderColor: '#ef4444' } : {}) },
  });

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: '480px' }}>
        <div style={styles.logo}>
          <div style={styles.logoMark}>K</div>
          <div>
            <div style={styles.logoText}>KhadiCraft</div>
            <div style={styles.logoSub}>by Goldy</div>
          </div>
        </div>
        <h1 style={styles.heading}>Create Account</h1>
        <p style={styles.sub}>Join thousands of happy customers</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input {...f('name')} type="text" placeholder="Your full name" required />
            {errors.name && <span style={styles.err}>{errors.name[0]}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input {...f('email')} type="email" placeholder="you@example.com" required />
              {errors.email && <span style={styles.err}>{errors.email[0]}</span>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone *</label>
              <input {...f('phone')} type="tel" placeholder="10-digit number" required />
              {errors.phone && <span style={styles.err}>{errors.phone[0]}</span>}
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <div style={{ position: 'relative' }}>
              <input {...f('password')} type={show ? 'text' : 'password'} placeholder="Min 8 characters" required />
              <button type="button" style={styles.eyeBtn} onClick={() => setShow(s => !s)}>{show ? '🙈' : '👁️'}</button>
            </div>
            {errors.password && <span style={styles.err}>{errors.password[0]}</span>}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input {...f('password_confirmation')} type="password" placeholder="Repeat password" required />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.6 }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
          <button type="submit" style={styles.btnPrimary} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>
        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in →</Link>
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
  footerText: { textAlign: 'center', marginTop: '20px', fontSize: '0.83rem', color: '#6b7280' },
  link: { color: '#1B4332', textDecoration: 'none', fontWeight: '500' },
  err: { fontSize: '0.73rem', color: '#ef4444' },
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
};

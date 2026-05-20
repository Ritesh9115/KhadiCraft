import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function VerifyOtp() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const email     = location.state?.email || '';
  const [otp, setOtp]        = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resent,  setResent]  = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) refs[idx + 1].current.focus();
    if (!val && idx > 0) refs[idx - 1].current.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs[idx - 1].current.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];
    paste.forEach((d, i) => { if (i < 6) newOtp[i] = d; });
    setOtp(newOtp);
    refs[Math.min(paste.length, 5)].current?.focus();
  };

  const verify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      await authAPI.verifyOtp({ email, otp: code });
      toast.success('Email verified successfully!');
      navigate('/account');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      await authAPI.sendOtp({ email });
      setResent(true);
      setTimeout(() => setResent(false), 30000);
      toast.success('New OTP sent!');
    } catch { toast.error('Failed to resend OTP'); }
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
        <div style={styles.logo}>
          <div style={styles.logoMark}>K</div>
          <div><div style={styles.logoText}>KhadiCraft</div></div>
        </div>
        <h1 style={styles.heading}>Verify Your Email</h1>
        <p style={{ ...styles.sub, marginBottom: '8px' }}>We sent a 6-digit code to</p>
        <p style={{ fontWeight: 600, color: '#1B4332', marginBottom: '28px' }}>{email}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }} onPaste={handlePaste}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: '48px', height: '56px', textAlign: 'center', fontSize: '1.4rem', fontWeight: '700',
                border: `2px solid ${d ? '#1B4332' : '#e5e7eb'}`, borderRadius: '10px',
                outline: 'none', transition: 'border .2s', background: d ? '#f0fdf4' : '#fff'
              }}
            />
          ))}
        </div>

        <button onClick={verify} style={{ ...styles.btnPrimary, width: '100%' }} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP →'}
        </button>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.83rem', color: '#6b7280' }}>
          <span>Didn't receive it?</span>
          {resent
            ? <span style={{ color: '#059669' }}>✓ Sent! Wait 30s...</span>
            : <button onClick={resend} style={{ background: 'none', border: 'none', color: '#C5933A', cursor: 'pointer', fontWeight: 500 }}>Resend OTP</button>
          }
        </div>
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
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', justifyContent: 'center' },
  logoMark: { width: '38px', height: '38px', borderRadius: '50%', background: '#1B4332', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontSize: '1.1rem', fontWeight: '600' },
  logoText: { fontFamily: 'serif', fontSize: '1.1rem', color: '#1B4332', fontWeight: '600' },
  heading: { fontSize: '1.4rem', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '6px' },
  sub: { fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', marginBottom: '24px' },
  btnPrimary: { padding: '12px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'background .2s', letterSpacing: '0.3px' },
};

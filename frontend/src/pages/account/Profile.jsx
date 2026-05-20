// src/pages/account/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { profileAPI } from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [form,     setForm]     = useState({ name:'', phone:'' });
  const [pwForm,   setPwForm]   = useState({ current_password:'', password:'', password_confirmation:'' });
  const [saving,   setSaving]   = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [showPw,   setShowPw]   = useState({ cur:false, new:false, con:false });
  const [tab,      setTab]      = useState('profile');
  const fileRef = useRef();

  useEffect(() => {
    if (user) setForm({ name: user.name||'', phone: user.phone||'' });
  }, [user]);

  const saveProfile = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await profileAPI.update(form);
      setUser(res.data.data);
      toast.success('Profile updated! ✅');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (!pwForm.current_password) { toast.error('Enter current password'); return; }
    if (pwForm.password.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (pwForm.password !== pwForm.password_confirmation) { toast.error("Passwords don't match"); return; }
    setSavingPw(true);
    try {
      await profileAPI.update(pwForm);
      setPwForm({ current_password:'', password:'', password_confirmation:'' });
      toast.success('Password changed successfully! ✅');
    } catch (err) { toast.error(err.response?.data?.message || 'Password change failed'); }
    finally { setSavingPw(false); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { toast.error('Image must be under 2MB'); return; }
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await profileAPI.uploadAvatar(fd);
      setUser({ ...user, avatar: res.data.avatar });
      toast.success('Profile photo updated!');
    } catch { toast.error('Upload failed'); }
  };

  const TABS = [
    { key:'profile',  label:'👤 Profile Info' },
    { key:'password', label:'🔐 Change Password' },
    { key:'account',  label:'ℹ️ Account Info' },
  ];

  return (
    <div style={{ padding:'40px 8%', maxWidth:'680px', margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:400, marginBottom:'28px' }}>My Profile</h1>

      {/* Avatar */}
      <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'32px', padding:'20px', background:'#fff', borderRadius:'12px', border:'1px solid #f0ece4' }}>
        <div style={{ position:'relative' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#1B4332', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontWeight:600, overflow:'hidden', flexShrink:0 }}>
            {user?.avatar
              ? <img src={user.avatar} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
              : user?.name?.[0]?.toUpperCase()
            }
          </div>
          <button onClick={() => fileRef.current?.click()} title="Change photo"
            style={{ position:'absolute', bottom:0, right:0, width:'24px', height:'24px', borderRadius:'50%', background:'#C5933A', border:'2px solid #fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem' }}>
            ✏️
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={uploadAvatar}/>
        </div>
        <div>
          <div style={{ fontWeight:600, fontSize:'1rem' }}>{user?.name}</div>
          <div style={{ color:'#6b7280', fontSize:'0.83rem' }}>{user?.email}</div>
          <span style={{ display:'inline-block', marginTop:'4px', padding:'2px 9px', background:'#f0fdf4', color:'#1B4332', borderRadius:'20px', fontSize:'0.68rem', fontWeight:600, textTransform:'capitalize' }}>{user?.role}</span>
        </div>
        <div style={{ marginLeft:'auto', textAlign:'right' }}>
          <div style={{ fontSize:'0.72rem', color:'#9ca3af', marginBottom:'3px' }}>Email Verified</div>
          <span style={{ fontSize:'0.82rem' }}>{user?.email_verified ? '✅ Verified' : '❌ Not Verified'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:'2px solid #e5e7eb', marginBottom:'24px' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding:'10px 20px', border:'none', background:'none', cursor:'pointer', fontSize:'0.83rem', fontWeight:tab===t.key?600:400, color:tab===t.key?'#1B4332':'#6b7280', borderBottom:tab===t.key?'2px solid #1B4332':'2px solid transparent', marginBottom:'-2px', whiteSpace:'nowrap', transition:'all .2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {tab === 'profile' && (
        <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #f0ece4', padding:'24px' }}>
          <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.05rem', fontWeight:500, marginBottom:'20px' }}>Personal Information</h3>
          <div style={{ display:'grid', gap:'16px' }}>
            <div>
              <label style={lbl}>Full Name *</label>
              <input style={inp} type="text" placeholder="Your full name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input style={{ ...inp, background:'#f9fafb', color:'#9ca3af', cursor:'not-allowed' }} type="email" value={user?.email||''} readOnly/>
              <span style={{ fontSize:'0.72rem', color:'#9ca3af', display:'block', marginTop:'4px' }}>Email cannot be changed. Contact support if needed.</span>
            </div>
            <div>
              <label style={lbl}>Phone Number</label>
              <input style={inp} type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'20px', paddingTop:'16px', borderTop:'1px solid #f0ece4' }}>
            <button onClick={saveProfile} disabled={saving} style={{ padding:'10px 28px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.88rem', fontWeight:500 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #f0ece4', padding:'24px' }}>
          <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.05rem', fontWeight:500, marginBottom:'8px' }}>Change Password</h3>
          <p style={{ color:'#6b7280', fontSize:'0.83rem', marginBottom:'20px' }}>Choose a strong password of at least 8 characters.</p>
          <div style={{ display:'grid', gap:'16px' }}>
            {[
              ['current_password', 'Current Password', 'cur'],
              ['password',         'New Password',     'new'],
              ['password_confirmation', 'Confirm New Password', 'con'],
            ].map(([key, label, showKey]) => (
              <div key={key}>
                <label style={lbl}>{label} *</label>
                <div style={{ position:'relative' }}>
                  <input
                    style={inp}
                    type={showPw[showKey] ? 'text' : 'password'}
                    placeholder={key==='current_password' ? 'Enter current password' : 'Min 8 characters'}
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({...f, [key]: e.target.value}))}
                  />
                  <button type="button" onClick={() => setShowPw(s=>({...s,[showKey]:!s[showKey]}))}
                    style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'#9ca3af' }}>
                    {showPw[showKey] ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'20px', paddingTop:'16px', borderTop:'1px solid #f0ece4' }}>
            <button onClick={savePassword} disabled={savingPw} style={{ padding:'10px 28px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.88rem', fontWeight:500 }}>
              {savingPw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      )}

      {/* Account Info Tab */}
      {tab === 'account' && (
        <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #f0ece4', padding:'24px' }}>
          <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.05rem', fontWeight:500, marginBottom:'18px' }}>Account Information</h3>
          <div style={{ display:'grid', gap:'10px' }}>
            {[
              ['Account ID',   `#${user?.id}`],
              ['Role',         user?.role],
              ['Email',        user?.email],
              ['Phone',        user?.phone || '—'],
              ['Verified',     user?.email_verified ? 'Yes ✅' : 'No ❌'],
              ['Account Status', user?.is_active ? 'Active ✅' : 'Suspended ❌'],
              ['Member Since', user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : '—'],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'11px 14px', background:'#f9fafb', borderRadius:'8px', fontSize:'0.83rem' }}>
                <span style={{ color:'#9ca3af' }}>{l}</span>
                <span style={{ fontWeight:500, textTransform:'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'20px', padding:'14px', background:'#fef2f2', borderRadius:'8px', border:'1px solid #fecaca', fontSize:'0.8rem', color:'#dc2626' }}>
            <strong>Delete Account:</strong> To permanently delete your account and all associated data, please contact us at hello@khadicraft.in or call +91 78300 57297.
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { fontSize:'0.78rem', fontWeight:500, color:'#374151', display:'block', marginBottom:'5px' };
const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'0.88rem', outline:'none', fontFamily:'inherit', transition:'border .2s', boxSizing:'border-box' };

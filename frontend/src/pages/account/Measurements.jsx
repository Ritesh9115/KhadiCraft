import { useState, useEffect } from 'react';
import { measurementAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FIELDS = ['chest','waist','hips','shoulder','shirt_length','pant_length','sleeve_length','neck','thigh','inseam'];

export default function Measurements() {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState({ profile_name: 'My Measurements' });

  useEffect(() => { measurementAPI.list().then(r => setProfiles(r.data.data || [])); }, []);

  const save = async () => {
    try {
      if (editId) { await measurementAPI.update(editId, form); toast.success('Profile updated!'); }
      else        { await measurementAPI.add(form); toast.success('Profile saved!'); }
      measurementAPI.list().then(r => setProfiles(r.data.data || []));
      setShowForm(false); setEditId(null); setForm({ profile_name: 'My Measurements' });
    } catch { toast.error('Save failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this profile?')) return;
    await measurementAPI.delete(id);
    setProfiles(p => p.filter(x => x.id !== id));
    toast.success('Deleted');
  };

  const setDefault = async (id) => {
    await measurementAPI.setDefault(id);
    setProfiles(p => p.map(x => ({ ...x, is_default: x.id === id })));
  };

  return (
    <div style={{ padding: '40px 8%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', fontWeight: 400, marginBottom: '4px' }}>Measurement Profiles</h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Save your measurements for faster custom orders</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ profile_name: 'My Measurements' }); }}
          style={{ padding: '10px 20px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}
        >
          + New Profile
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {profiles.map(p => (
          <div key={p.id} style={{ background: '#fff', border: '1px solid #f0ece4', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', fontWeight: 500 }}>{p.profile_name}</h3>
                {p.is_default && <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>Default</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!p.is_default && (
                  <button onClick={() => setDefault(p.id)} style={{ padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>Set Default</button>
                )}
                <button onClick={() => { setEditId(p.id); setForm(p); setShowForm(true); }} style={{ padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>✏️ Edit</button>
                <button onClick={() => del(p.id)} style={{ padding: '5px 12px', border: '1px solid #fecaca', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444' }}>🗑️</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '10px' }}>
              {FIELDS.filter(f => p[f]).map(f => (
                <div key={f} style={{ background: '#f9fafb', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{f.replace('_', ' ')}</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1B4332' }}>{p[f]}"</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!profiles.length && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '10px', border: '1px solid #f0ece4', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📏</div>
            <div style={{ marginBottom: '16px' }}>No measurement profiles yet</div>
            <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create First Profile</button>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.2rem', fontWeight: 500 }}>{editId ? 'Edit' : 'New'} Measurement Profile</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Profile Name</label>
                <input style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} value={form.profile_name || ''} onChange={e => setForm(f => ({ ...f, profile_name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {FIELDS.map(f => (
                  <div key={f}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 500, display: 'block', marginBottom: '4px', textTransform: 'capitalize' }}>{f.replace('_', ' ')} (inches)</label>
                    <input type="number" step="0.5" min="0" placeholder="0.0" style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.83rem', outline: 'none', boxSizing: 'border-box' }} value={form[f] || ''} onChange={e => setForm(x => ({ ...x, [f]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 500, display: 'block', marginBottom: '5px' }}>Notes</label>
                <textarea style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.83rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} rows={2} placeholder="Any special notes about fit preference..." value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 20px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.83rem' }}>Cancel</button>
              <button onClick={save} style={{ padding: '9px 24px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 500 }}>Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

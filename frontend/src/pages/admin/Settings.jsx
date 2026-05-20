import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState('general');

  useEffect(() => {
    adminAPI.settings().then(r => {
      const s = {};
      (r.data.data || []).forEach(x => s[x.key] = x.value);
      setSettings(s);
    });
  }, []);

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const GROUP_TABS = [
    { key: 'general',  label: '🏪 General' },
    { key: 'billing',  label: '💰 Billing & GST' },
    { key: 'shipping', label: '🚚 Shipping' },
    { key: 'payment',  label: '💳 Payment' },
    { key: 'custom',   label: '✂️ Custom Orders' },
    { key: 'shop',     label: '🕘 Shop Hours' },
  ];

  const SETTINGS_MAP = {
    general:  [['site_name','Site Name','text'],['site_email','Contact Email','email'],['site_phone','Contact Phone','text'],['site_address','Shop Address','textarea']],
    billing:  [['gst_number','GST Number','text'],['gst_percent','GST Percentage (%)','number']],
    shipping: [['free_shipping_above','Free Shipping Above (₹)','number'],['shipping_charge','Default Shipping Charge (₹)','number']],
    payment:  [['cod_available','COD Available','boolean'],['razorpay_key','Razorpay Key ID','text'],['razorpay_secret','Razorpay Secret','password']],
    custom:   [['custom_order_advance','Advance Payment % for Custom Orders','number'],['custom_order_days','Standard TAT (Days)','number']],
    shop:     [['shop_open_time','Opening Time','time'],['shop_close_time','Closing Time','time']],
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Settings</h1><p>Configure your store settings</p></div>
        <button className="btn-primary-sm" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {GROUP_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ padding: '10px 14px', border: 'none', background: tab === t.key ? '#f0fdf4' : 'none', color: tab === t.key ? '#1B4332' : '#6b7280', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', fontSize: '0.83rem', fontWeight: tab === t.key ? 600 : 400, transition: 'all .2s' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="admin-table-card">
          <h3 style={{ marginBottom: '20px', fontSize: '1rem', fontWeight: 600 }}>
            {GROUP_TABS.find(t => t.key === tab)?.label} Settings
          </h3>
          <div style={{ display: 'grid', gap: '16px', maxWidth: '560px' }}>
            {(SETTINGS_MAP[tab] || []).map(([key, label, type]) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                {type === 'textarea'
                  ? <textarea className="form-textarea" rows={3} value={settings[key] || ''} onChange={e => set(key, e.target.value)} />
                  : type === 'boolean'
                  ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={settings[key] === 'true' || settings[key] === true} onChange={e => set(key, e.target.checked ? 'true' : 'false')} />
                        <span className="toggle-slider" />
                      </label>
                      <span style={{ fontSize: '0.83rem', color: '#6b7280' }}>{settings[key] === 'true' ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  )
                  : type === 'password'
                  ? <input className="form-input" type="password" placeholder="Enter securely..." value={settings[key] || ''} onChange={e => set(key, e.target.value)} />
                  : <input className="form-input" type={type} value={settings[key] || ''} onChange={e => set(key, e.target.value)} />
                }
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <button className="btn-primary-sm" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

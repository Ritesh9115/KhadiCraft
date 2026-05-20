// src/pages/admin/Banners.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    link: '',
    button_text: '',
    position: 'home',
    sort_order: 0,
    is_active: true,
    start_date: '',
    end_date: ''
  });

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.banners();
      setBanners(res.data.data || []);
    } catch { toast.error('Failed to load banners'); }
    finally { setLoading(false); }
  };

  const saveBanner = async () => {
    try {
      if (editing) {
        await adminAPI.updateBanner(editing.id, form);
        toast.success('Banner updated!');
      } else {
        await adminAPI.createBanner(form);
        toast.success('Banner created!');
      }
      setShowModal(false);
      setEditing(null);
      setForm({
        title: '',
        subtitle: '',
        link: '',
        button_text: '',
        position: 'home',
        sort_order: 0,
        is_active: true,
        start_date: '',
        end_date: ''
      });
      loadBanners();
    } catch { toast.error('Failed to save banner'); }
  };

  const deleteBanner = async (id) => {
    if (!confirm('Delete this banner? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteBanner(id);
      toast.success('Banner deleted!');
      loadBanners();
    } catch { toast.error('Failed to delete banner'); }
  };

  const toggleStatus = async (id) => {
    try {
      await adminAPI.toggleBanner(id);
      setBanners(b => b.map(banner => 
        banner.id === id ? { ...banner, is_active: !banner.is_active } : banner
      ));
      toast.success('Banner status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  const openEdit = (banner) => {
    setEditing(banner);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      button_text: banner.button_text || '',
      position: banner.position || 'home',
      sort_order: banner.sort_order || 0,
      is_active: banner.is_active,
      start_date: banner.start_date || '',
      end_date: banner.end_date || ''
    });
    setShowModal(true);
  };

  const POSITION_OPTIONS = [
    { value: 'home', label: 'Home Page' },
    { value: 'shop', label: 'Shop Page' },
    { value: 'category', label: 'Category Page' },
    { value: 'product', label: 'Product Page' }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Banners</h1>
          <p>Manage promotional banners and displays</p>
        </div>
        <button className="btn-primary-sm" onClick={() => setShowModal(true)}>
          + Add Banner
        </button>
      </div>

      <div className="admin-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Position</th>
                <th>Link</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(banner => (
                <tr key={banner.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{banner.title}</div>
                    {banner.subtitle && (
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {banner.subtitle}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.78rem', 
                      padding: '3px 8px', 
                      borderRadius: '4px', 
                      background: '#f0fdf4', 
                      color: '#166534' 
                    }}>
                      {banner.position}
                    </span>
                  </td>
                  <td>
                    {banner.link ? (
                      <a href={banner.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        {banner.link}
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>{banner.sort_order}</td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={banner.is_active}
                        onChange={() => toggleStatus(banner.id)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {banner.start_date && (
                      <div>From: {new Date(banner.start_date).toLocaleDateString()}</div>
                    )}
                    {banner.end_date && (
                      <div>To: {new Date(banner.end_date).toLocaleDateString()}</div>
                    )}
                    {!banner.start_date && !banner.end_date && 'Always'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn-outline-sm"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        onClick={() => openEdit(banner)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-danger-sm"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        onClick={() => deleteBanner(banner.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!banners.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    No banners found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label required">Title</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter banner title"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subtitle</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={form.subtitle}
                  onChange={e => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Enter banner subtitle"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link URL</label>
                <input
                  className="form-input"
                  value={form.link}
                  onChange={e => setForm({ ...form, link: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Button Text</label>
                <input
                  className="form-input"
                  value={form.button_text}
                  onChange={e => setForm({ ...form, button_text: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Position</label>
                <select
                  className="form-select"
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                >
                  {POSITION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: '0.83rem', color: '#6b7280' }}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-sm" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary-sm" onClick={saveBanner}>
                {editing ? 'Update Banner' : 'Create Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

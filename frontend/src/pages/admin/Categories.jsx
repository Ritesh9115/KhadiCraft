// src/pages/admin/Categories.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    parent_id: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.categories();
      const payload = res?.data?.data;
      const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
      setCategories(Array.isArray(list) ? list : []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  const saveCategory = async () => {
    try {
      if (editing) {
        await adminAPI.updateCategory(editing.id, form);
        toast.success('Category updated!');
      } else {
        await adminAPI.createCategory(form);
        toast.success('Category created!');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', parent_id: '', description: '', sort_order: 0, is_active: true });
      loadCategories();
    } catch { toast.error('Failed to save category'); }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteCategory(id);
      toast.success('Category deleted!');
      loadCategories();
    } catch { toast.error('Failed to delete category'); }
  };

  const toggleStatus = async (id) => {
    try {
      await adminAPI.toggleCategory(id);
      setCategories(c => c.map(cat => 
        cat.id === id ? { ...cat, is_active: !cat.is_active } : cat
      ));
      toast.success('Category status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      parent_id: category.parent_id || '',
      description: category.description || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active
    });
    setShowModal(true);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Categories</h1>
          <p>Manage product categories and organization</p>
        </div>
        <button className="btn-primary-sm" onClick={() => setShowModal(true)}>
          + Add Category
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
                <th>Name</th>
                <th>Parent</th>
                <th>Description</th>
                <th>Sort Order</th>
                <th>Products Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td>{cat.parent?.name || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.description || '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>{cat.sort_order}</td>
                  <td style={{ textAlign: 'center' }}>{cat.products_count || 0}</td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={cat.is_active}
                        onChange={() => toggleStatus(cat.id)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn-outline-sm"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        onClick={() => openEdit(cat)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-danger-sm"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        onClick={() => deleteCategory(cat.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!categories.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    No categories found
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
              <h2>{editing ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label required">Category Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Parent Category</label>
                <select
                  className="form-select"
                  value={form.parent_id}
                  onChange={e => setForm({ ...form, parent_id: e.target.value })}
                >
                  <option value="">None (Root Category)</option>
                  {categories.filter(cat => !editing || cat.id !== editing.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter category description"
                />
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
              <button className="btn-primary-sm" onClick={saveCategory}>
                {editing ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

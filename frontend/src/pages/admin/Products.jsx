// src/pages/admin/Products.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [summary,  setSummary]    = useState({});
  const [meta,     setMeta]       = useState({});
  const [loading,  setLoading]    = useState(true);
  const [selected, setSelected]   = useState([]);
  const [filters,  setFilters]    = useState({ search:'', status:'', stock:'', page:1, per_page:20 });
  const [stockModal, setStockModal] = useState(null); // { product }
  const [stockForm,  setStockForm]  = useState({ type:'stock_in', quantity:'', notes:'' });

  useEffect(() => { load(); }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.products(filters);
      setProducts(res.data.data.data);
      setMeta(res.data.data);
      setSummary(res.data.summary);
    } catch { toast.error('Failed to load products'); }
    finally  { setLoading(false); }
  };

  const toggleActive = async (id) => {
    try {
      await adminAPI.toggleProduct(id);
      setProducts(p => p.map(x => x.id===id ? {...x, is_active:!x.is_active} : x));
      toast.success('Product status updated');
    } catch { toast.error('Failed to update'); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteProduct(id);
      setProducts(p => p.filter(x => x.id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const bulkAction = async (action) => {
    if (!selected.length) { toast.error('Select at least one product'); return; }
    if (action==='delete' && !confirm(`Delete ${selected.length} products?`)) return;
    try {
      await adminAPI.bulkAction({ action, ids: selected });
      setSelected([]);
      load();
      toast.success('Bulk action applied');
    } catch { toast.error('Bulk action failed'); }
  };

  const saveStock = async () => {
    if (!stockForm.quantity || stockForm.quantity <= 0) { toast.error('Enter valid quantity'); return; }
    try {
      const res = await adminAPI.updateStock(stockModal.id, stockForm);
      setProducts(p => p.map(x => x.id===stockModal.id ? {...x, stock:res.data.stock} : x));
      setStockModal(null);
      setStockForm({ type:'stock_in', quantity:'', notes:'' });
      toast.success('Stock updated!');
    } catch { toast.error('Failed to update stock'); }
  };

  const allSelected = selected.length === products.length && products.length > 0;
  const toggleAll   = () => setSelected(allSelected ? [] : products.map(p=>p.id));
  const toggleOne   = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const stockTypeColor = {stock_in:'#10b981',stock_out:'#ef4444',adjustment:'#3b82f6',damage:'#f97316'};

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog, stock, and variants</p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          {selected.length > 0 && (
            <>
              <button className="btn-outline-sm" onClick={() => bulkAction('activate')}>✅ Activate</button>
              <button className="btn-outline-sm" onClick={() => bulkAction('deactivate')}>❌ Deactivate</button>
              <button className="btn-danger-sm"  onClick={() => bulkAction('delete')}>🗑️ Delete ({selected.length})</button>
            </>
          )}
          <Link to="/admin/products/new" className="btn-primary-sm" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'6px'}}>+ Add Product</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'12px',marginBottom:'20px'}}>
        {[
          {label:'Total',    value:summary.total,    color:'#1B4332', bg:'#f0fdf4'},
          {label:'Active',   value:summary.active,   color:'#059669', bg:'#ecfdf5'},
          {label:'Inactive', value:summary.inactive, color:'#6b7280', bg:'#f9fafb'},
          {label:'Low Stock',value:summary.low_stock, color:'#f59e0b', bg:'#fffbeb'},
          {label:'Out of Stock',value:summary.out_stock,color:'#ef4444',bg:'#fef2f2'},
        ].map((c,i)=>(
          <div key={i} style={{background:c.bg,border:`1px solid ${c.color}25`,borderRadius:'8px',padding:'14px',cursor:'pointer'}}
            onClick={()=>setFilters(f=>({...f, stock:i===3?'low':i===4?'out':'', status:i===1?'active':i===2?'inactive':''}))}>
            <div style={{fontSize:'1.5rem',fontWeight:'700',color:c.color}}>{c.value ?? 0}</div>
            <div style={{fontSize:'0.75rem',color:'#6b7280',marginTop:'2px'}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input className="filter-input" placeholder="🔍 Search products, SKU..." value={filters.search}
          onChange={e=>setFilters(f=>({...f,search:e.target.value,page:1}))} style={{flex:1,minWidth:'220px'}}/>
        <select className="admin-select" value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value,page:1}))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="admin-select" value={filters.stock} onChange={e=>setFilters(f=>({...f,stock:e.target.value,page:1}))}>
          <option value="">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <select className="admin-select" value={filters.per_page} onChange={e=>setFilters(f=>({...f,per_page:e.target.value,page:1}))}>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>
        <button className="btn-outline-sm" onClick={()=>setFilters({search:'',status:'',stock:'',page:1,per_page:20})}>Clear</button>
      </div>

      {/* Table */}
      <div className="admin-table-card" style={{padding:'0',overflow:'hidden'}}>
        {loading ? (
          <div style={{padding:'60px',textAlign:'center'}}><div className="spinner" style={{margin:'0 auto'}}/></div>
        ) : (
          <table className="admin-table" style={{minWidth:'900px'}}>
            <thead>
              <tr>
                <th style={{width:'40px'}}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}/>
                </th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th style={{width:'160px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggleOne(p.id)}/></td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'40px',height:'40px',borderRadius:'6px',background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>
                        {p.thumbnail ? <img src={`http://localhost:8000/storage/${p.thumbnail}`} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'6px'}}/> : '🏷️'}
                      </div>
                      <div>
                        <div style={{fontWeight:500,fontSize:'0.85rem',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                        <div style={{fontSize:'0.72rem',color:'#9ca3af'}}>{p.product_type}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{fontFamily:'monospace',fontSize:'0.78rem',color:'#6b7280'}}>{p.sku}</span></td>
                  <td><span style={{fontSize:'0.8rem'}}>{p.category?.name}</span></td>
                  <td>
                    <div style={{fontWeight:500,fontSize:'0.85rem'}}>₹{p.price?.toLocaleString()}</div>
                    {p.sale_price && <div style={{fontSize:'0.72rem',color:'#10b981'}}>Sale: ₹{p.sale_price?.toLocaleString()}</div>}
                  </td>
                  <td>
                    <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                      <span style={{
                        fontWeight:600,fontSize:'0.9rem',
                        color: p.stock===0 ? '#ef4444' : p.stock<=p.low_stock_alert ? '#f59e0b' : '#059669'
                      }}>{p.stock}</span>
                      {p.stock <= p.low_stock_alert && p.stock > 0 && <span style={{fontSize:'0.65rem',color:'#f59e0b'}}>⚠ Low</span>}
                      {p.stock === 0 && <span style={{fontSize:'0.65rem',color:'#ef4444'}}>Out of stock</span>}
                    </div>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={p.is_active} onChange={()=>toggleActive(p.id)}/>
                      <span className="toggle-slider"/>
                    </label>
                  </td>
                  <td>
                    <span style={{fontSize:'1rem'}}>{p.is_featured ? '⭐' : '—'}</span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                      <button className="btn-outline-sm" style={{padding:'4px 8px',fontSize:'0.72rem'}}
                        onClick={()=>setStockModal(p)} title="Update Stock">📦 Stock</button>
                      <Link to={`/admin/products/${p.id}/edit`} style={{textDecoration:'none'}}>
                        <button className="btn-outline-sm" style={{padding:'4px 8px',fontSize:'0.72rem'}}>✏️</button>
                      </Link>
                      <button className="btn-danger-sm" style={{padding:'4px 8px',fontSize:'0.72rem'}}
                        onClick={()=>deleteProduct(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr><td colSpan={9} style={{textAlign:'center',padding:'48px',color:'#9ca3af'}}>No products found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span>Showing {products.length} of {meta.total || 0} products</span>
        <div className="pagination-btns">
          <button className="page-btn" disabled={filters.page<=1} onClick={()=>setFilters(f=>({...f,page:f.page-1}))}>← Prev</button>
          {Array.from({length:Math.min(5,meta.last_page||1)},(_,i)=>i+1).map(p=>(
            <button key={p} className={`page-btn ${filters.page===p?'active':''}`} onClick={()=>setFilters(f=>({...f,page:p}))}>{p}</button>
          ))}
          <button className="page-btn" disabled={filters.page>=meta.last_page} onClick={()=>setFilters(f=>({...f,page:f.page+1}))}>Next →</button>
        </div>
      </div>

      {/* Stock Modal */}
      {stockModal && (
        <div className="modal-backdrop" onClick={()=>setStockModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Stock — {stockModal.name}</h2>
              <button className="modal-close" onClick={()=>setStockModal(null)}>✕</button>
            </div>
            <div style={{marginBottom:'16px',padding:'12px',background:'#f9fafb',borderRadius:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem'}}>
                <span style={{color:'#6b7280'}}>Current Stock:</span>
                <span style={{fontWeight:600,color:stockModal.stock===0?'#ef4444':stockModal.stock<=stockModal.low_stock_alert?'#f59e0b':'#059669'}}>
                  {stockModal.stock} units
                </span>
              </div>
            </div>
            <div style={{display:'grid',gap:'14px'}}>
              <div className="form-group">
                <label className="form-label required">Action Type</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  {[
                    {key:'stock_in',  label:'➕ Stock In',  desc:'Add stock'},
                    {key:'stock_out', label:'➖ Stock Out', desc:'Remove stock'},
                    {key:'adjustment',label:'📝 Adjust',    desc:'Set to exact'},
                    {key:'damage',    label:'💔 Damage',    desc:'Mark damaged'},
                  ].map(t=>(
                    <label key={t.key} style={{
                      border:`2px solid ${stockForm.type===t.key?stockTypeColor[t.key]:'#e5e7eb'}`,
                      borderRadius:'8px',padding:'10px',cursor:'pointer',
                      background:stockForm.type===t.key?stockTypeColor[t.key]+'12':'#fff',
                      transition:'all .2s'
                    }}>
                      <input type="radio" name="stock_type" value={t.key} style={{display:'none'}}
                        checked={stockForm.type===t.key} onChange={()=>setStockForm(f=>({...f,type:t.key}))}/>
                      <div style={{fontWeight:500,fontSize:'0.82rem'}}>{t.label}</div>
                      <div style={{fontSize:'0.72rem',color:'#9ca3af'}}>{t.desc}</div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label required">{stockForm.type==='adjustment'?'Set Stock To':'Quantity'}</label>
                <input className="form-input" type="number" min="1" placeholder="Enter quantity"
                  value={stockForm.quantity} onChange={e=>setStockForm(f=>({...f,quantity:e.target.value}))}/>
                {stockForm.type!=='adjustment' && stockForm.quantity && (
                  <div className="form-hint">New stock: {
                    stockForm.type==='stock_in'  ? stockModal.stock + (+stockForm.quantity) :
                    stockForm.type==='stock_out' ? stockModal.stock - (+stockForm.quantity) :
                    stockForm.type==='damage'    ? stockModal.stock - (+stockForm.quantity) :
                    +stockForm.quantity
                  } units</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <input className="form-input" placeholder="Reason for stock change..." value={stockForm.notes}
                  onChange={e=>setStockForm(f=>({...f,notes:e.target.value}))}/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-sm" onClick={()=>setStockModal(null)}>Cancel</button>
              <button className="btn-primary-sm" onClick={saveStock}>Update Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

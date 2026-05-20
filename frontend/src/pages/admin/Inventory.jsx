// src/pages/admin/Inventory.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [logs,     setLogs]     = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [tab,      setTab]      = useState('overview'); // overview | logs | low
  const [loading,  setLoading]  = useState(true);
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ type:'stock_in', quantity:'', notes:'' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [inv, low, logRes] = await Promise.all([adminAPI.inventory(), adminAPI.lowStock(), adminAPI.inventoryLogs()]);
      setProducts(inv.data.data?.data || []);
      setLowStock(low.data.data || []);
      setLogs(logRes.data.data?.data || []);
    } catch { toast.error('Failed to load inventory'); }
    finally  { setLoading(false); }
  };

  const saveAdjust = async () => {
    try {
      await adminAPI.adjustStock({ 
  adjustments: [
    { product_id: adjustModal.id, ...adjustForm }
  ] 
});
      toast.success('Stock adjusted!');
      setAdjustModal(null);
      setAdjustForm({ type:'stock_in', quantity:'', notes:'' });
      loadAll();
    } catch { toast.error('Adjustment failed'); }
  };

  const TYPE_ICON = { stock_in:'🟢', stock_out:'🔴', adjustment:'🔵', sale:'🟡', return:'⬆️', damage:'💔' };
  const TYPE_COLOR = { stock_in:'#059669', stock_out:'#ef4444', adjustment:'#3b82f6', sale:'#f59e0b', return:'#8b5cf6', damage:'#f97316' };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Track stock levels, adjustments, and movement logs</p>
        </div>
        <button className="btn-primary-sm" onClick={loadAll}>↻ Refresh</button>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'20px' }}>
        {[
          { label:'Total Products', value:products.length, color:'#1B4332', bg:'#f0fdf4', icon:'🏷️' },
          { label:'Low Stock',      value:lowStock.length, color:'#f59e0b', bg:'#fffbeb', icon:'⚠️' },
          { label:'Out of Stock',   value:products.filter(p=>p.stock===0).length, color:'#ef4444', bg:'#fef2f2', icon:'❌' },
          { label:'Total Stock Value', value:`₹${products.reduce((s,p)=>s+(p.stock*(p.cost_price||p.price)),0).toLocaleString()}`, color:'#8b5cf6', bg:'#faf5ff', icon:'💰' },
        ].map((c,i)=>(
          <div key={i} style={{ background:c.bg, border:`1px solid ${c.color}20`, borderRadius:'10px', padding:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ fontSize:'1.6rem' }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:'1.3rem', fontWeight:'700', color:c.color }}>{c.value}</div>
              <div style={{ fontSize:'0.75rem', color:'#6b7280' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0', borderBottom:'2px solid #e5e7eb', marginBottom:'20px' }}>
        {[['overview','📦 All Products'],['low','⚠️ Low Stock'],['logs','📋 Stock Logs']].map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{ padding:'10px 20px', border:'none', background:'none', cursor:'pointer', fontSize:'0.83rem', fontWeight:500, color:tab===key?'#1B4332':'#6b7280', borderBottom:tab===key?'2px solid #1B4332':'2px solid transparent', marginBottom:'-2px' }}>{label}</button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && (
        <div className="admin-table-card" style={{ padding:0, overflow:'hidden' }}>
          <table className="admin-table" style={{ minWidth:'700px' }}>
            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Low Alert</th><th>Value</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id}>
                  <td style={{ fontWeight:500, fontSize:'0.85rem' }}>{p.name}</td>
                  <td><span style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'#6b7280' }}>{p.sku}</span></td>
                  <td style={{ fontSize:'0.8rem', color:'#6b7280' }}>{p.category?.name}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontWeight:700, fontSize:'1.05rem', color:p.stock===0?'#ef4444':p.stock<=p.low_stock_alert?'#f59e0b':'#059669' }}>{p.stock}</span>
                      {p.stock===0 && <span style={{ fontSize:'0.65rem', background:'#fef2f2', color:'#ef4444', padding:'2px 6px', borderRadius:'3px' }}>OUT</span>}
                      {p.stock>0&&p.stock<=p.low_stock_alert && <span style={{ fontSize:'0.65rem', background:'#fffbeb', color:'#f59e0b', padding:'2px 6px', borderRadius:'3px' }}>LOW</span>}
                    </div>
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'#6b7280' }}>{p.low_stock_alert}</td>
                  <td style={{ fontSize:'0.82rem' }}>₹{(p.stock*(p.cost_price||p.price)).toLocaleString()}</td>
                  <td>
                    <button onClick={()=>setAdjustModal(p)} className="btn-outline-sm" style={{ padding:'4px 10px', fontSize:'0.73rem' }}>📦 Adjust Stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'low' && (
        <div style={{ display:'grid', gap:'12px' }}>
          {lowStock.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px', background:'#fff', borderRadius:'10px', border:'1px solid #e5e7eb', color:'#9ca3af' }}>
              <div style={{ fontSize:'2rem', marginBottom:'10px' }}>✅</div>
              <div>All products are well stocked!</div>
            </div>
          ) : lowStock.map(p=>(
            <div key={p.id} style={{ background:'#fff', border:`1px solid ${p.stock===0?'#fecaca':'#fde68a'}`, borderRadius:'10px', padding:'18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
              <div>
                <div style={{ fontWeight:500, marginBottom:'3px' }}>{p.name}</div>
                <div style={{ fontSize:'0.75rem', color:'#9ca3af' }}>{p.category?.name} · SKU: {p.sku}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontWeight:700, fontSize:'1.3rem', color:p.stock===0?'#ef4444':'#f59e0b' }}>{p.stock}</div>
                  <div style={{ fontSize:'0.68rem', color:'#9ca3af' }}>Current</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontWeight:600, fontSize:'1rem', color:'#6b7280' }}>{p.low_stock_alert}</div>
                  <div style={{ fontSize:'0.68rem', color:'#9ca3af' }}>Alert At</div>
                </div>
                <button onClick={()=>setAdjustModal(p)} style={{ padding:'8px 16px', background:'#1B4332', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem', fontWeight:500 }}>+ Restock</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'logs' && (
        <div className="admin-table-card" style={{ padding:0, overflow:'hidden' }}>
          <table className="admin-table" style={{ minWidth:'800px' }}>
            <thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>Before</th><th>After</th><th>Reference</th><th>Notes</th><th>Date</th></tr></thead>
            <tbody>
              {logs.map(log=>(
                <tr key={log.id}>
                  <td style={{ fontSize:'0.82rem' }}>{log.product?.name || '—'}</td>
                  <td>
                    <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'0.78rem', fontWeight:500, color:TYPE_COLOR[log.type]||'#6b7280' }}>
                      {TYPE_ICON[log.type]} {log.type?.replace('_',' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight:600, color:['stock_in','return'].includes(log.type)?'#059669':'#ef4444' }}>
                    {['stock_in','return'].includes(log.type)?'+':'-'}{log.quantity}
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'#6b7280' }}>{log.stock_before}</td>
                  <td style={{ fontSize:'0.82rem', fontWeight:500 }}>{log.stock_after}</td>
                  <td style={{ fontSize:'0.75rem', color:'#6b7280' }}>{log.reference_type} {log.reference_id?`#${log.reference_id}`:''}</td>
                  <td style={{ fontSize:'0.78rem', color:'#6b7280', maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.notes||'—'}</td>
                  <td style={{ fontSize:'0.75rem', color:'#9ca3af' }}>{new Date(log.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="modal-backdrop" onClick={()=>setAdjustModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adjust Stock — {adjustModal.name}</h2>
              <button className="modal-close" onClick={()=>setAdjustModal(null)}>✕</button>
            </div>
            <div style={{ background:'#f9fafb', borderRadius:'8px', padding:'12px', marginBottom:'16px', display:'flex', justifyContent:'space-between', fontSize:'0.85rem' }}>
              <span style={{ color:'#6b7280' }}>Current Stock:</span>
              <span style={{ fontWeight:700, color:adjustModal.stock===0?'#ef4444':'#059669' }}>{adjustModal.stock} units</span>
            </div>
            <div style={{ display:'grid', gap:'14px' }}>
              <div className="form-group">
                <label className="form-label required">Type</label>
                <select className="form-select" value={adjustForm.type} onChange={e=>setAdjustForm(f=>({...f,type:e.target.value}))}>
                  <option value="stock_in">➕ Stock In (Restock)</option>
                  <option value="stock_out">➖ Stock Out</option>
                  <option value="adjustment">📝 Adjustment (Set Exact)</option>
                  <option value="damage">💔 Mark as Damaged</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">{adjustForm.type==='adjustment'?'Set Stock To':'Quantity'}</label>
                <input className="form-input" type="number" min="1" placeholder="Enter quantity" value={adjustForm.quantity} onChange={e=>setAdjustForm(f=>({...f,quantity:e.target.value}))}/>
                {adjustForm.quantity && (
                  <div className="form-hint">New stock will be: {
                    adjustForm.type==='adjustment' ? adjustForm.quantity :
                    adjustForm.type==='stock_in' ? adjustModal.stock + (+adjustForm.quantity) :
                    adjustModal.stock - (+adjustForm.quantity)
                  } units</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" placeholder="Reason for adjustment..." value={adjustForm.notes} onChange={e=>setAdjustForm(f=>({...f,notes:e.target.value}))}/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-sm" onClick={()=>setAdjustModal(null)}>Cancel</button>
              <button className="btn-primary-sm" onClick={saveAdjust}>Save Adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

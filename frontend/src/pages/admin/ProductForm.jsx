// src/pages/admin/ProductForm.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name:'', category_id:'', fabric_type_id:'', sku:'', short_description:'', description:'',
    price:'', sale_price:'', cost_price:'', stock:'', low_stock_alert:'10', weight:'', unit:'piece',
    product_type:'simple', is_active:true, is_featured:false, is_custom_available:false,
    is_wholesale_available:true, wholesale_min_qty:'10', wholesale_price:'',
    meta_title:'', meta_description:'', tags:[]
  });
  const [categories,   setCategories]   = useState([]);
  const [fabricTypes,  setFabricTypes]  = useState([]);
  const [images,       setImages]       = useState([]);
  const [existingImgs, setExistingImgs] = useState([]);
  const [variants,     setVariants]     = useState([]);
  const [tagInput,     setTagInput]     = useState('');
  const [saving,       setSaving]       = useState(false);
  const [errors,       setErrors]       = useState({});
  const [activeTab,    setActiveTab]    = useState('basic');

  useEffect(() => { loadMeta(); if(isEdit) loadProduct(); }, []);

  const loadMeta = async () => {
    const [cats, fabs] = await Promise.all([adminAPI.categories(), adminAPI.fabricTypes ? adminAPI.fabricTypes() : Promise.resolve({data:{data:[]}})]);
    setCategories(cats.data.data?.data || cats.data.data || []);
    // fabric types from settings
    try { const f = await fetch('http://localhost:8000/api/fabric-types'); const d = await f.json(); setFabricTypes(d.data); } catch {}
  };

  const loadProduct = async () => {
    try {
      const res = await adminAPI.products({ search:'', page:1 }); // stub - use product show endpoint
      // In real implementation: const res = await adminAPI.product(id);
    } catch { toast.error('Failed to load product'); }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*': []}, maxSize: 4*1024*1024,
    onDrop: (accepted) => setImages(prev => [...prev, ...accepted.map(f=>Object.assign(f,{preview:URL.createObjectURL(f)}))]),
    onDropRejected: () => toast.error('Max 4MB per image'),
  });

  const set = (key, val) => setForm(f => ({...f, [key]: val}));
  const addTag = (e) => {
    if ((e.key==='Enter'||e.key===',') && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) set('tags', [...form.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const addVariant = () => setVariants(v => [...v, { id:Date.now(), size:'', color:'', color_hex:'#000000', sku:'', stock:'0', price:'' }]);
  const updateVariant = (id, key, val) => setVariants(v => v.map(x => x.id===id ? {...x,[key]:val} : x));
  const removeVariant = (id) => setVariants(v => v.filter(x => x.id!==id));

  const handleSubmit = async () => {
    setSaving(true); setErrors({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => {
        if (k==='tags') fd.append(k, JSON.stringify(v));
        else if (typeof v === 'boolean') fd.append(k, v?'1':'0');
        else if (v!=='' && v!==null && v!==undefined) fd.append(k, v);
      });
      images.forEach(img => fd.append('images[]', img));

      const res = isEdit ? await adminAPI.updateProduct(id, fd) : await adminAPI.createProduct(fd);
      const productId = res.data.data.id;

      // Add variants
      for (const v of variants.filter(x=>x.size||x.color)) {
        await adminAPI.addVariant(productId, v);
      }

      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const tabs = ['basic','pricing','images','variants','seo'];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p>{isEdit ? 'Update product details' : 'Fill in the details to create a new product'}</p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="btn-outline-sm" onClick={() => navigate('/admin/products')}>← Back</button>
          <button className="btn-primary-sm" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{display:'flex',gap:'0',borderBottom:'2px solid #e5e7eb',marginBottom:'24px',overflowX:'auto'}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{
            padding:'10px 20px',border:'none',background:'none',cursor:'pointer',
            fontSize:'0.85rem',fontWeight:500,color:activeTab===t?'#1B4332':'#6b7280',
            borderBottom:activeTab===t?'2px solid #1B4332':'2px solid transparent',
            marginBottom:'-2px',textTransform:'capitalize',whiteSpace:'nowrap'
          }}>{t === 'seo' ? 'SEO' : t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {/* BASIC TAB */}
      {activeTab==='basic' && (
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'20px',alignItems:'start'}}>
          <div style={{display:'grid',gap:'16px'}}>
            <div className="admin-table-card">
              <h3 style={{marginBottom:'16px',fontSize:'0.95rem',fontWeight:600}}>Product Information</h3>
              <div className="form-grid">
                <div className="form-group form-full">
                  <label className="form-label required">Product Name</label>
                  <input className="form-input" placeholder="e.g. Pure Cotton Khadi Kurta Set" value={form.name} onChange={e=>set('name',e.target.value)}/>
                  {errors.name && <span className="form-error">{errors.name[0]}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label required">Category</label>
                  <select className="form-select" value={form.category_id} onChange={e=>set('category_id',e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.category_id && <span className="form-error">{errors.category_id[0]}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Fabric Type</label>
                  <select className="form-select" value={form.fabric_type_id} onChange={e=>set('fabric_type_id',e.target.value)}>
                    <option value="">Select Fabric</option>
                    {fabricTypes.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input className="form-input" placeholder="Auto-generated if empty" value={form.sku} onChange={e=>set('sku',e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label required">Product Type</label>
                  <select className="form-select" value={form.product_type} onChange={e=>set('product_type',e.target.value)}>
                    <option value="simple">Simple</option>
                    <option value="variable">Variable (sizes/colors)</option>
                    <option value="fabric_meter">Fabric per meter</option>
                    <option value="custom">Custom only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-select" value={form.unit} onChange={e=>set('unit',e.target.value)}>
                    <option value="piece">Piece</option>
                    <option value="meter">Meter</option>
                    <option value="set">Set</option>
                    <option value="pair">Pair</option>
                  </select>
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Short Description</label>
                  <input className="form-input" placeholder="One-line product summary" value={form.short_description} onChange={e=>set('short_description',e.target.value)}/>
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Full Description</label>
                  <textarea className="form-textarea" rows={5} placeholder="Detailed product description..." value={form.description} onChange={e=>set('description',e.target.value)}/>
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Tags</label>
                  <div className="tags-input" onClick={e=>e.currentTarget.querySelector('input').focus()}>
                    {form.tags.map(tag=>(
                      <span key={tag} className="tag-item">{tag}<button className="tag-remove" onClick={()=>set('tags',form.tags.filter(t=>t!==tag))}>✕</button></span>
                    ))}
                    <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type and press Enter to add tags"/>
                  </div>
                  <span className="form-hint">Press Enter or comma to add a tag</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'grid',gap:'16px'}}>
            {/* Status Card */}
            <div className="admin-table-card">
              <h3 style={{marginBottom:'16px',fontSize:'0.95rem',fontWeight:600}}>Status & Options</h3>
              <div style={{display:'grid',gap:'12px'}}>
                {[
                  {key:'is_active',          label:'Active',               desc:'Visible in store'},
                  {key:'is_featured',        label:'Featured',             desc:'Show on homepage'},
                  {key:'is_custom_available',label:'Custom Tailoring',     desc:'Allow custom orders'},
                  {key:'is_wholesale_available',label:'Wholesale Available',desc:'Allow bulk orders'},
                ].map(opt=>(
                  <div key={opt.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px',background:'#f9fafb',borderRadius:'6px'}}>
                    <div>
                      <div style={{fontSize:'0.83rem',fontWeight:500}}>{opt.label}</div>
                      <div style={{fontSize:'0.72rem',color:'#9ca3af'}}>{opt.desc}</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={!!form[opt.key]} onChange={e=>set(opt.key,e.target.checked)}/>
                      <span className="toggle-slider"/>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Card */}
            <div className="admin-table-card">
              <h3 style={{marginBottom:'16px',fontSize:'0.95rem',fontWeight:600}}>Stock & Weight</h3>
              <div style={{display:'grid',gap:'12px'}}>
                <div className="form-group">
                  <label className="form-label required">Initial Stock</label>
                  <input className="form-input" type="number" min="0" placeholder="0" value={form.stock} onChange={e=>set('stock',e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Low Stock Alert At</label>
                  <input className="form-input" type="number" min="0" value={form.low_stock_alert} onChange={e=>set('low_stock_alert',e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.weight} onChange={e=>set('weight',e.target.value)}/>
                </div>
              </div>
            </div>

            {/* Wholesale */}
            {form.is_wholesale_available && (
              <div className="admin-table-card">
                <h3 style={{marginBottom:'16px',fontSize:'0.95rem',fontWeight:600}}>Wholesale Settings</h3>
                <div style={{display:'grid',gap:'12px'}}>
                  <div className="form-group">
                    <label className="form-label">Min Order Qty (MOQ)</label>
                    <input className="form-input" type="number" value={form.wholesale_min_qty} onChange={e=>set('wholesale_min_qty',e.target.value)}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Wholesale Price (₹)</label>
                    <input className="form-input" type="number" step="0.01" placeholder="Bulk price per unit" value={form.wholesale_price} onChange={e=>set('wholesale_price',e.target.value)}/>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRICING TAB */}
      {activeTab==='pricing' && (
        <div className="admin-table-card" style={{maxWidth:'560px'}}>
          <h3 style={{marginBottom:'16px',fontSize:'0.95rem',fontWeight:600}}>Pricing</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">MRP / Price (₹)</label>
              <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e=>set('price',e.target.value)}/>
              {errors.price && <span className="form-error">{errors.price[0]}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Sale Price (₹)</label>
              <input className="form-input" type="number" step="0.01" placeholder="Optional discount price" value={form.sale_price} onChange={e=>set('sale_price',e.target.value)}/>
              <span className="form-hint">Leave blank for no sale</span>
            </div>
            <div className="form-group">
              <label className="form-label">Cost Price (₹)</label>
              <input className="form-input" type="number" step="0.01" placeholder="For margin calculation" value={form.cost_price} onChange={e=>set('cost_price',e.target.value)}/>
              <span className="form-hint">Not shown to customers</span>
            </div>
            {form.price && form.cost_price && (
              <div style={{padding:'14px',background:'#f0fdf4',borderRadius:'8px',fontSize:'0.82rem',border:'1px solid #bbf7d0'}}>
                <div style={{fontWeight:600,color:'#166534',marginBottom:'4px'}}>Margin Summary</div>
                <div>Margin: ₹{(+form.price - +form.cost_price).toFixed(2)} ({(((+form.price - +form.cost_price)/+form.price)*100).toFixed(1)}%)</div>
                {form.sale_price && <div style={{color:'#f59e0b'}}>Sale margin: ₹{(+form.sale_price - +form.cost_price).toFixed(2)}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* IMAGES TAB */}
      {activeTab==='images' && (
        <div className="admin-table-card">
          <h3 style={{marginBottom:'16px',fontSize:'0.95rem',fontWeight:600}}>Product Images</h3>
          <div {...getRootProps()} className="img-upload-zone" style={{borderColor: isDragActive?'#1B4332':'#d1d5db',background:isDragActive?'#f0fdf4':'#fafafa'}}>
            <input {...getInputProps()}/>
            <div style={{fontSize:'2rem',marginBottom:'8px'}}>📸</div>
            <div style={{fontWeight:500}}>{isDragActive ? 'Drop here!' : 'Drag & drop images or click to browse'}</div>
            <div style={{fontSize:'0.75rem',color:'#9ca3af',marginTop:'4px'}}>JPG, PNG, WebP · Max 4MB each</div>
          </div>
          {images.length > 0 && (
            <>
              <div style={{marginTop:'12px',marginBottom:'8px',fontSize:'0.8rem',color:'#6b7280'}}>New Images ({images.length})</div>
              <div className="img-preview-grid">
                {images.map((img,i)=>(
                  <div key={i} className="img-preview">
                    <img src={img.preview} alt=""/>
                    {i===0 && <span style={{position:'absolute',bottom:'4px',left:'4px',background:'#1B4332',color:'#fff',fontSize:'0.65rem',padding:'2px 6px',borderRadius:'3px'}}>Primary</span>}
                    <button className="img-preview-del" onClick={()=>setImages(imgs=>imgs.filter((_,j)=>j!==i))}>✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
          {existingImgs.length > 0 && (
            <>
              <div style={{marginTop:'16px',marginBottom:'8px',fontSize:'0.8rem',color:'#6b7280'}}>Existing Images</div>
              <div className="img-preview-grid">
                {existingImgs.map(img=>(
                  <div key={img.id} className="img-preview">
                    <img src={`http://localhost:8000/storage/${img.image_path}`} alt=""/>
                    <button className="img-preview-del">✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* VARIANTS TAB */}
      {activeTab==='variants' && (
        <div className="admin-table-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <h3 style={{fontSize:'0.95rem',fontWeight:600}}>Product Variants (Sizes / Colors)</h3>
            <button className="btn-primary-sm" onClick={addVariant}>+ Add Variant</button>
          </div>
          {variants.length===0 ? (
            <div style={{textAlign:'center',padding:'40px',color:'#9ca3af'}}>
              <div style={{fontSize:'2rem',marginBottom:'8px'}}>📦</div>
              <div>No variants yet. Click "Add Variant" to add sizes and colors.</div>
            </div>
          ) : (
            <div style={{display:'grid',gap:'12px'}}>
              {variants.map((v,i)=>(
                <div key={v.id} style={{border:'1px solid #e5e7eb',borderRadius:'8px',padding:'16px',position:'relative'}}>
                  <div style={{fontSize:'0.78rem',fontWeight:600,color:'#6b7280',marginBottom:'12px'}}>Variant #{i+1}</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px 1fr 100px',gap:'12px',alignItems:'end'}}>
                    <div className="form-group">
                      <label className="form-label">Size</label>
                      <select className="form-select" value={v.size} onChange={e=>updateVariant(v.id,'size',e.target.value)}>
                        <option value="">Select</option>
                        {['XS','S','M','L','XL','XXL','36','38','40','42','44'].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Color Name</label>
                      <input className="form-input" placeholder="e.g. Forest Green" value={v.color} onChange={e=>updateVariant(v.id,'color',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Color</label>
                      <input type="color" style={{width:'100%',height:'36px',border:'1px solid #e5e7eb',borderRadius:'6px',cursor:'pointer'}} value={v.color_hex} onChange={e=>updateVariant(v.id,'color_hex',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stock</label>
                      <input className="form-input" type="number" min="0" value={v.stock} onChange={e=>updateVariant(v.id,'stock',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price (₹)</label>
                      <input className="form-input" type="number" placeholder={form.price||'Same as base'} value={v.price} onChange={e=>updateVariant(v.id,'price',e.target.value)}/>
                    </div>
                  </div>
                  <button className="btn-danger-sm" style={{position:'absolute',top:'12px',right:'12px',padding:'4px 8px'}} onClick={()=>removeVariant(v.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEO TAB */}
      {activeTab==='seo' && (
        <div className="admin-table-card" style={{maxWidth:'640px'}}>
          <h3 style={{marginBottom:'16px',fontSize:'0.95rem',fontWeight:600}}>SEO Settings</h3>
          <div style={{display:'grid',gap:'16px'}}>
            <div className="form-group">
              <label className="form-label">Meta Title</label>
              <input className="form-input" placeholder="Page title for search engines" value={form.meta_title} onChange={e=>set('meta_title',e.target.value)}/>
              <span className="form-hint">{form.meta_title.length}/60 characters</span>
            </div>
            <div className="form-group">
              <label className="form-label">Meta Description</label>
              <textarea className="form-textarea" rows={3} placeholder="Brief description for search results" value={form.meta_description} onChange={e=>set('meta_description',e.target.value)}/>
              <span className="form-hint">{form.meta_description.length}/160 characters</span>
            </div>
          </div>
        </div>
      )}

      {/* Save Bottom Bar */}
      <div style={{position:'sticky',bottom:0,background:'rgba(249,250,251,0.95)',backdropFilter:'blur(8px)',padding:'14px 0',borderTop:'1px solid #e5e7eb',marginTop:'24px',display:'flex',justifyContent:'flex-end',gap:'10px',zIndex:10}}>
        <button className="btn-outline-sm" onClick={()=>navigate('/admin/products')}>Cancel</button>
        <button className="btn-primary-sm" onClick={handleSubmit} disabled={saving} style={{minWidth:'140px'}}>
          {saving ? '⏳ Saving...' : (isEdit ? '✅ Update Product' : '✅ Create Product')}
        </button>
      </div>
    </div>
  );
}

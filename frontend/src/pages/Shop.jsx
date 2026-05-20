// ============================================================
// src/pages/Shop.jsx
// ============================================================
import { useState, useEffect } from 'react';
import { useSearchParams, Link, useParams, useNavigate } from 'react-router-dom';
import { productAPI, profileAPI, orderAPI, paymentAPI } from '../services/api';
import { useCartStore } from '../context/authStore';
import toast from 'react-hot-toast';

export function Shop() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [fabrics,    setFabrics]    = useState([]);
  const [meta,       setMeta]       = useState({});
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState('grid'); // grid | list
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const addItem = useCartStore(s => s.addItem);

  const filters = {
    search:      searchParams.get('search') || '',
    category_slug: categorySlug || searchParams.get('category') || '',
    min_price:   searchParams.get('min_price') || '',
    max_price:   searchParams.get('max_price') || '',
    in_stock:    searchParams.get('in_stock') || '',
    featured:    searchParams.get('featured') || '',
    sort:        searchParams.get('sort') || 'newest',
    page:        searchParams.get('page') || '1',
  };

  useEffect(() => { loadProducts(); }, [searchParams, categorySlug]);
  useEffect(() => { loadMeta(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.list({ ...filters, per_page: 16 });
      setProducts(res.data.data.data || []);
      setMeta(res.data.data);
    } catch { toast.error('Failed to load products'); }
    finally  { setLoading(false); }
  };

  const loadMeta = async () => {
    const [cats, fabs] = await Promise.all([productAPI.categories(), productAPI.fabricTypes()]);
    setCategories(cats.data.data || []);
    setFabrics(fabs.data.data || []);
  };

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px', padding: '40px 8%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* SIDEBAR FILTERS */}
      <aside>
        <div style={S.filterCard}>
          <h3 style={S.filterTitle}>Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button style={{ ...S.filterItem, ...(filters.category_slug === '' ? S.filterActive : {}) }} onClick={() => setFilter('category', '')}>All Products</button>
            {categories.map(cat => (
              <div key={cat.id}>
                <button style={{ ...S.filterItem, ...(filters.category_slug === cat.slug ? S.filterActive : {}) }} onClick={() => setFilter('category', cat.slug)}>{cat.name}</button>
                {cat.children?.map(child => (
                  <button key={child.id} style={{ ...S.filterItem, paddingLeft: '20px', fontSize: '0.78rem', ...(filters.category_slug === child.slug ? S.filterActive : {}) }} onClick={() => setFilter('category', child.slug)}>↳ {child.name}</button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={S.filterCard}>
          <h3 style={S.filterTitle}>Price Range</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={S.filterInput} type="number" placeholder="Min ₹" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} />
            <input style={S.filterInput} type="number" placeholder="Max ₹" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {[['Under ₹500','','500'],['₹500–₹1500','500','1500'],['₹1500–₹3000','1500','3000'],['Above ₹3000','3000','']].map(([l,mn,mx])=>(
              <button key={l} style={S.filterItem} onClick={()=>{setFilter('min_price',mn);setFilter('max_price',mx)}}>{l}</button>
            ))}
          </div>
        </div>

        <div style={S.filterCard}>
          <h3 style={S.filterTitle}>Fabric Type</h3>
          {fabrics.map(f => (
            <button key={f.id} style={S.filterItem}>{f.name}</button>
          ))}
        </div>

        <div style={S.filterCard}>
          <h3 style={S.filterTitle}>Availability</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.83rem' }}>
            <input type="checkbox" checked={!!filters.in_stock} onChange={e => setFilter('in_stock', e.target.checked ? '1' : '')} />
            In Stock Only
          </label>
        </div>

        <button onClick={() => setSearchParams({})} style={{ width: '100%', padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280' }}>
          ✕ Clear All Filters
        </button>
      </aside>

      {/* PRODUCTS */}
      <div>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            {loading ? 'Loading...' : `${meta.total || 0} products found`}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select style={S.filterInput} value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['grid','list'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ width: '32px', height: '32px', border: '1px solid #e5e7eb', borderRadius: '4px', background: view === v ? '#1B4332' : '#fff', color: view === v ? '#fff' : '#6b7280', cursor: 'pointer' }}>
                  {v === 'grid' ? '⊞' : '≡'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            {[...Array(8)].map((_,i) => <div key={i} style={{ background: '#f3f4f6', borderRadius: '8px', height: '300px', animation: 'pulse 1.5s infinite' }}/>)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill,minmax(220px,1fr))' : '1fr', gap: '20px' }}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} listView={view === 'list'} onAddToCart={() => addItem(p, 1)} />
            ))}
            {!products.length && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No products found</div>
                <div style={{ fontSize: '0.85rem' }}>Try adjusting your filters</div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
            {[...Array(meta.last_page)].map((_,i) => (
              <button key={i} onClick={() => setFilter('page', String(i+1))} style={{
                width: '36px', height: '36px', border: '1px solid #e5e7eb', borderRadius: '6px',
                background: filters.page == i+1 ? '#1B4332' : '#fff',
                color: filters.page == i+1 ? '#fff' : '#374151',
                cursor: 'pointer', fontWeight: 500
              }}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

function ProductCard({ product: p, listView, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const discount = p.sale_price ? Math.round((1 - p.sale_price / p.price) * 100) : 0;

  const isFabric = /fabric|thaan|linen|cotton|silk|wool/i.test(p.category?.name || p.category?.slug || '');
  const placeholder = isFabric ? '/placeholders/product-fabric.png' : '/placeholders/product-kurta.png';
  const imgSrc = p.thumbnail && !imgErr ? `http://localhost:8000/storage/${p.thumbnail}` : placeholder;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #f0ece4', transition: 'all .25s', transform: hovered ? 'translateY(-4px)' : 'none', boxShadow: hovered ? '0 12px 28px rgba(0,0,0,0.10)' : 'none', display: listView ? 'flex' : 'block' }}>
      {/* Image */}
      <Link to={`/product/${p.slug}`} style={{ display: 'block', position: 'relative', aspectRatio: listView ? '1' : '3/4', width: listView ? '160px' : '100%', flexShrink: 0, background: '#f7f2ea', overflow: 'hidden' }}>
        <img
          src={imgSrc}
          alt={p.name}
          onError={() => setImgErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
        />
        {discount > 0 && <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#1B4332', color: '#fff', padding: '3px 8px', borderRadius: '2px', fontSize: '0.65rem', fontWeight: 600 }}>{discount}% OFF</span>}
        {p.is_custom_available && <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#C5933A', color: '#fff', padding: '3px 8px', borderRadius: '2px', fontSize: '0.65rem' }}>Custom</span>}
        {p.stock === 0 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.5px' }}>Out of Stock</div>}
      </Link>
      {/* Info */}
      <div style={{ padding: '14px', flex: 1 }}>
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '4px' }}>{p.category?.name} · {p.fabric_type?.name}</div>
        <Link to={`/product/${p.slug}`}><div style={{ fontFamily: 'Georgia,serif', fontSize: '1rem', color: '#111', marginBottom: '6px', fontWeight: 400, lineHeight: 1.3 }}>{p.name}</div></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontWeight: 600, fontSize: '1rem', color: '#111' }}>₹{(p.sale_price || p.price)?.toLocaleString()}</span>
          {p.sale_price && <span style={{ fontSize: '0.82rem', color: '#9ca3af', textDecoration: 'line-through' }}>₹{p.price?.toLocaleString()}</span>}
        </div>
        {p.variants?.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
            {p.variants.slice(0, 5).map(v => v.color_hex && (
              <div key={v.id} title={v.color} style={{ width: '14px', height: '14px', borderRadius: '50%', background: v.color_hex, border: '1px solid rgba(0,0,0,0.15)' }} />
            ))}
          </div>
        )}
        <button onClick={onAddToCart} disabled={p.stock === 0} style={{
          width: '100%', padding: '9px', background: p.stock === 0 ? '#f3f4f6' : '#1B4332', color: p.stock === 0 ? '#9ca3af' : '#fff',
          border: 'none', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500, cursor: p.stock === 0 ? 'default' : 'pointer',
          letterSpacing: '0.5px', textTransform: 'uppercase', transition: 'background .2s'
        }}>{p.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}</button>
      </div>
    </div>
  );
}

// ============================================================
// src/pages/Cart.jsx
// ============================================================
export function Cart() {
  const { items, removeItem, updateQty, total: totalFn1, clearCart } = useCartStore();
  const total = totalFn1();

  const navigate = useNavigate();

  if (!items.length) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛍️</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', marginBottom: '12px' }}>Your Cart is Empty</h2>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>Looks like you haven't added anything yet.</p>
      <Link to="/shop" style={{ display: 'inline-block', padding: '12px 32px', background: '#1B4332', color: '#fff', borderRadius: '2px', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Continue Shopping →</Link>
    </div>
  );

  const shipping = total >= 1000 ? 0 : 80;
  const gst      = Math.round(total * 0.05 * 100) / 100;
  const grandTotal = total + shipping + gst;

  return (
    <div style={{ padding: '40px 8%', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', marginBottom: '32px' }}>Shopping Cart ({items.length} items)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map(item => (
            <div key={item.key} style={{ display: 'flex', gap: '16px', background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #f0ece4' }}>
              <div style={{ width: '90px', height: '90px', background: '#f7f2ea', borderRadius: '6px', flexShrink: 0, overflow: 'hidden' }}>
                <img
                  src={item.product.thumbnail ? `http://localhost:8000/storage/${item.product.thumbnail}` : '/placeholders/product-kurta.png'}
                  alt={item.product.name}
                  onError={e => { e.target.src='/placeholders/product-kurta.png'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '1rem', marginBottom: '4px' }}>{item.product.name}</div>
                {item.variant && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px' }}>{item.variant.size} · {item.variant.color}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <button onClick={() => updateQty(item.key, item.quantity - 1)} style={{ width: '32px', height: '32px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '1rem' }}>−</button>
                    <span style={{ width: '40px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 500 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.key, item.quantity + 1)} style={{ width: '32px', height: '32px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                  <button onClick={() => removeItem(item.key)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Remove</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid #fecaca', color: '#ef4444', padding: '7px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑️ Clear Cart</button>
        </div>

        {/* Summary */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #f0ece4', position: 'sticky', top: '88px' }}>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.2rem', marginBottom: '20px' }}>Order Summary</h3>
          {[['Subtotal', `₹${total.toLocaleString()}`],['Shipping', shipping === 0 ? 'FREE 🎉' : `₹${shipping}`],['GST (5%)', `₹${gst}`]].map(([l,v])=>(
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem', color: '#6b7280' }}>
              <span>{l}</span><span style={{ color: v.includes('FREE') ? '#059669' : '#111' }}>{v}</span>
            </div>
          ))}
          {shipping > 0 && <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '12px' }}>Add ₹{(1000 - total).toLocaleString()} more for free shipping!</div>}
          <div style={{ borderTop: '1px solid #f0ece4', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem', marginBottom: '20px' }}>
            <span>Total</span><span>₹{grandTotal.toLocaleString()}</span>
          </div>
          <button onClick={() => navigate('/checkout')} style={{ width: '100%', padding: '14px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px' }}>
            Proceed to Checkout →
          </button>
          <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: '12px', color: '#6b7280', fontSize: '0.82rem' }}>← Continue Shopping</Link>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['Visa','MasterCard','UPI','COD'].map(m => <span key={m} style={{ fontSize: '0.65rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 7px', borderRadius: '3px', color: '#9ca3af' }}>{m}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// src/pages/Checkout.jsx
// ============================================================

export function Checkout() {
  const { items, total: totalFn2, clearCart } = useCartStore();
  const total = totalFn2();

  const [addresses, setAddresses]   = useState([]);
  const [selAddr,   setSelAddr]     = useState(null);
  const [payment,   setPayment]     = useState('cod');
  const [step,      setStep]        = useState(1); // 1=address, 2=payment, 3=review
  const [placing,   setPlacing]     = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    profileAPI.getAddresses().then(r => {
      setAddresses(r.data.data);
      const def = r.data.data.find(a => a.is_default) || r.data.data[0];
      if (def) setSelAddr(def.id);
    });
  }, []);

  const shipping   = total >= 1000 ? 0 : 80;
  const gst        = Math.round(total * 0.05 * 100) / 100;
  const grandTotal = total + shipping + gst;

  const placeOrder = async () => {
    if (!selAddr) { toast.error('Select a delivery address'); return; }
    setPlacing(true);
    try {
      const orderData = {
        items: items.map(i => ({ product_id: i.product.id, variant_id: i.variant?.id, quantity: i.quantity })),
        payment_method: payment,
        address_id: selAddr,
      };
      const res = await orderAPI.place(orderData);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-success/${res.data.data.order_number}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
    finally { setPlacing(false); }
  };

  return (
    <div style={{ padding: '40px 8%', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', marginBottom: '8px' }}>Checkout</h1>
      {/* Steps */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '32px' }}>
        {['Delivery Address','Payment','Review & Place'].map((s,i)=>(
          <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: step < i+1 ? 0.4 : 1 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= i+1 ? '#1B4332' : '#e5e7eb', color: step >= i+1 ? '#fff' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>{step > i+1 ? '✓' : i+1}</div>
              <span style={{ fontSize: '0.82rem', fontWeight: step === i+1 ? 600 : 400 }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: '1px', background: '#e5e7eb', margin: '0 10px' }}/>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
        <div>
          {/* STEP 1: Address */}
          {step === 1 && (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #f0ece4' }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', marginBottom: '20px' }}>Select Delivery Address</h3>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                {addresses.map(addr => (
                  <label key={addr.id} style={{ display: 'flex', gap: '12px', padding: '14px', border: `2px solid ${selAddr === addr.id ? '#1B4332' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', background: selAddr === addr.id ? '#f0fdf4' : '#fff', transition: 'all .2s' }}>
                    <input type="radio" name="address" checked={selAddr === addr.id} onChange={() => setSelAddr(addr.id)} style={{ marginTop: '2px' }}/>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '2px' }}>{addr.full_name} · {addr.phone}</div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5 }}>{addr.address_line1}{addr.address_line2 ? ', '+addr.address_line2 : ''}, {addr.city}, {addr.state} - {addr.pincode}</div>
                      {addr.is_default && <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#166534', padding: '2px 7px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>Default</span>}
                    </div>
                  </label>
                ))}
                <Link to="/account/addresses" style={{ display: 'block', padding: '12px', border: '1px dashed #d1d5db', borderRadius: '8px', textAlign: 'center', color: '#1B4332', fontSize: '0.83rem', fontWeight: 500 }}>+ Add New Address</Link>
              </div>
              <button onClick={() => selAddr && setStep(2)} disabled={!selAddr} style={{ padding: '12px 28px', background: selAddr ? '#1B4332' : '#e5e7eb', color: selAddr ? '#fff' : '#9ca3af', border: 'none', borderRadius: '4px', fontSize: '0.85rem', cursor: selAddr ? 'pointer' : 'default', fontWeight: 500 }}>Continue to Payment →</button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #f0ece4' }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', marginBottom: '20px' }}>Select Payment Method</h3>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {[
                  { key:'cod',    label:'Cash on Delivery', desc:'Pay when your order arrives', icon:'💵' },
                  { key:'upi',    label:'UPI / QR Code',    desc:'PhonePe, GPay, Paytm, BHIM', icon:'📱' },
                  { key:'online', label:'Card / Net Banking', desc:'Debit, Credit card, Net Banking', icon:'💳' },
                ].map(opt => (
                  <label key={opt.key} style={{ display: 'flex', gap: '14px', padding: '16px', border: `2px solid ${payment === opt.key ? '#1B4332' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', background: payment === opt.key ? '#f0fdf4' : '#fff', transition: 'all .2s', alignItems: 'center' }}>
                    <input type="radio" name="payment" value={opt.key} checked={payment === opt.key} onChange={() => setPayment(opt.key)} />
                    <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ padding: '12px 20px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ padding: '12px 28px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>Review Order →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #f0ece4' }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', marginBottom: '20px' }}>Review Your Order</h3>
              <div style={{ marginBottom: '20px', padding: '14px', background: '#f9fafb', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>Delivering to:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{addresses.find(a=>a.id===selAddr)?.full_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{addresses.find(a=>a.id===selAddr)?.address_line1}, {addresses.find(a=>a.id===selAddr)?.city}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {items.map(item => (
                  <div key={item.key} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', background: '#f7f2ea', borderRadius: '6px', flexShrink: 0, overflow: 'hidden' }}>
                    <img
                      src={item.product.thumbnail ? `http://localhost:8000/storage/${item.product.thumbnail}` : '/placeholders/product-kurta.png'}
                      alt={item.product.name}
                      onError={e => { e.target.src='/placeholders/product-kurta.png'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>₹{(item.price*item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{ padding: '12px 20px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>← Back</button>
                <button onClick={placeOrder} disabled={placing} style={{ flex: 1, padding: '13px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                  {placing ? '⏳ Placing Order...' : `✅ Place Order · ₹${grandTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', border: '1px solid #f0ece4', position: 'sticky', top: '88px' }}>
          <h4 style={{ fontFamily: 'Georgia,serif', fontSize: '1rem', marginBottom: '16px' }}>Order Summary</h4>
          {items.slice(0,3).map(item=>(
            <div key={item.key} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#6b7280', marginBottom:'6px' }}>
              <span style={{ maxWidth:'160px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.product.name} ×{item.quantity}</span>
              <span>₹{(item.price*item.quantity).toLocaleString()}</span>
            </div>
          ))}
          {items.length > 3 && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px' }}>+{items.length-3} more items</div>}
          <div style={{ borderTop: '1px solid #f0ece4', paddingTop: '12px', marginTop: '8px', display: 'grid', gap: '6px' }}>
            {[['Subtotal',`₹${total.toLocaleString()}`],['Shipping',shipping===0?'FREE':'₹'+shipping],['GST (5%)',`₹${gst}`]].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:'#6b7280' }}><span>{l}</span><span>{v}</span></div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'1rem', marginTop:'6px', paddingTop:'8px', borderTop:'1px solid #f0ece4' }}><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  filterCard:   { background:'#fff', borderRadius:'8px', padding:'18px', border:'1px solid #f0ece4', marginBottom:'16px' },
  filterTitle:  { fontFamily:'Georgia,serif', fontSize:'0.88rem', fontWeight:500, color:'#111', marginBottom:'12px' },
  filterItem:   { display:'block', width:'100%', textAlign:'left', padding:'7px 10px', border:'none', background:'none', cursor:'pointer', borderRadius:'5px', fontSize:'0.82rem', color:'#4b5563', transition:'all .15s' },
  filterActive: { background:'#f0fdf4', color:'#1B4332', fontWeight:500 },
  filterInput:  { padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'0.82rem', width:'100%', outline:'none' },
};

export default Shop;

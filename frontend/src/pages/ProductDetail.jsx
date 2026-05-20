// ============================================================
// src/pages/ProductDetail.jsx
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, reviewAPI } from '../services/api';
import { useCartStore } from '../context/authStore';
import { useAuthStore } from '../context/authStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selImg,   setSelImg]   = useState(0);
  const [selVar,   setSelVar]   = useState(null);
  const [qty,      setQty]      = useState(1);
  const [tab,      setTab]      = useState('description');
  const [reviews,  setReviews]  = useState([]);
  const [revForm,  setRevForm]  = useState({ rating: 5, title: '', review: '' });
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    productAPI.show(slug).then(r => {
      setProduct(r.data.data);
      setRelated(r.data.related || []);
      setReviews(r.data.data.reviews || []);
    }).catch(() => toast.error('Product not found'))
    .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }}/>
        Loading product...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!product) return <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>Product not found</div>;

  const images = product.images?.length ? product.images : [{ image_path: product.thumbnail }];
  const price  = selVar?.price || product.sale_price || product.price;
  const mrp    = product.price;
  const disc   = mrp && price < mrp ? Math.round((1 - price / mrp) * 100) : 0;

  // Group variants by size and color
  const sizes  = [...new Set(product.variants?.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))];

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addItem(product, qty, selVar);
  };

  const submitReview = async () => {
    if (!isLoggedIn()) { toast.error('Please login to review'); return; }
    try {
      await reviewAPI.add({ product_id: product.id, ...revForm });
      toast.success('Review submitted! It will appear after approval.');
      setRevForm({ rating: 5, title: '', review: '' });
    } catch { toast.error('Review submission failed'); }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div style={{ padding: '40px 8%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '28px' }}>
        <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/shop" style={{ color: '#9ca3af', textDecoration: 'none' }}>Shop</Link>
        <span>/</span>
        <Link to={`/shop/${product.category?.slug}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>{product.category?.name}</Link>
        <span>/</span>
        <span style={{ color: '#374151' }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '60px' }}>
        {/* Images */}
        <div>
          <div style={{ background: '#f7f2ea', borderRadius: '10px', overflow: 'hidden', aspectRatio: '4/5', marginBottom: '12px', position: 'relative' }}>
            {images[selImg]?.image_path
              ? <img src={`http://localhost:8000/storage/${images[selImg].image_path}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🏷️</div>
            }
            {disc > 0 && <div style={{ position: 'absolute', top: '14px', left: '14px', background: '#1B4332', color: '#fff', padding: '5px 12px', borderRadius: '2px', fontSize: '0.78rem', fontWeight: 600 }}>{disc}% OFF</div>}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelImg(i)} style={{ aspectRatio: '1', background: '#f7f2ea', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${selImg === i ? '#1B4332' : 'transparent'}`, cursor: 'pointer', padding: 0 }}>
                  {img.image_path
                    ? <img src={`http://localhost:8000/storage/${img.image_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏷️</div>
                  }
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: '0.72rem', color: '#C5933A', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{product.category?.name} · {product.fabric_type?.name}</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 400, lineHeight: 1.2, marginBottom: '12px' }}>{product.name}</h1>

          {/* Rating */}
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '2px', color: '#C5933A' }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '14px', opacity: s <= avgRating ? 1 : 0.3 }}>★</span>)}
              </div>
              <span style={{ fontSize: '0.83rem', color: '#6b7280' }}>{avgRating} ({reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', fontWeight: 500, color: '#1B4332' }}>₹{price?.toLocaleString()}</span>
            {product.sale_price && <span style={{ fontSize: '1.1rem', color: '#9ca3af', textDecoration: 'line-through' }}>₹{mrp?.toLocaleString()}</span>}
            {disc > 0 && <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>Save ₹{(mrp - price).toLocaleString()}</span>}
          </div>

          <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.8, marginBottom: '24px' }}>{product.short_description}</p>

          {/* Size selector */}
          {sizes.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '8px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Size</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {sizes.map(size => (
                  <button key={size} onClick={() => setSelVar(product.variants?.find(v => v.size === size))} style={{ width: '44px', height: '44px', border: `2px solid ${selVar?.size === size ? '#1B4332' : '#e5e7eb'}`, borderRadius: '4px', background: selVar?.size === size ? '#f0fdf4' : '#fff', cursor: 'pointer', fontWeight: selVar?.size === size ? 600 : 400, color: selVar?.size === size ? '#1B4332' : '#374151', fontSize: '0.82rem', transition: 'all .2s' }}>{size}</button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {colors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '8px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color {selVar?.color && <span style={{ fontWeight: 400, color: '#6b7280' }}>— {selVar.color}</span>}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.variants?.filter((v, i, arr) => arr.findIndex(x => x.color === v.color) === i).map(v => (
                  <button key={v.id} onClick={() => setSelVar(v)} title={v.color} style={{ width: '32px', height: '32px', borderRadius: '50%', background: v.color_hex || '#ccc', border: `3px solid ${selVar?.color === v.color ? '#1B4332' : 'rgba(0,0,0,0.1)'}`, cursor: 'pointer', transition: 'border .2s', outline: selVar?.color === v.color ? '2px solid #1B4332' : 'none', outlineOffset: '2px' }}/>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '38px', height: '38px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
              <span style={{ width: '46px', textAlign: 'center', fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ width: '38px', height: '38px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
            </div>
            <span style={{ fontSize: '0.78rem', color: product.stock < 10 ? '#f59e0b' : '#9ca3af' }}>
              {product.stock === 0 ? '❌ Out of Stock' : product.stock < 10 ? `⚠️ Only ${product.stock} left` : `✅ In Stock (${product.stock})`}
            </span>
          </div>

          {/* Add to Cart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '20px' }}>
            <button onClick={handleAddToCart} disabled={product.stock === 0} style={{ padding: '14px', background: product.stock === 0 ? '#e5e7eb' : '#1B4332', color: product.stock === 0 ? '#9ca3af' : '#fff', border: 'none', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', letterSpacing: '0.5px', transition: 'background .2s' }}>
              {product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
            </button>
            {product.is_custom_available && (
              <Link to="/custom-tailoring" style={{ padding: '14px 18px', border: '1.5px solid #C5933A', borderRadius: '4px', color: '#C5933A', textDecoration: 'none', fontWeight: 500, fontSize: '0.82rem', textAlign: 'center', whiteSpace: 'nowrap' }}>✂️ Custom</Link>
            )}
          </div>

          {/* Features */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            {[['🚚', 'Free shipping', 'Above ₹1,000'], ['↩️', 'Easy Returns', '7-day policy'], ['✅', 'Authentic Khadi', 'Certified fabric'], ['💳', 'COD Available', 'Pay on delivery']].map(([icon, t, d]) => (
              <div key={t} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', marginTop: '1px' }}>{icon}</span>
                <div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{t}</div><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description / Reviews */}
      <div style={{ borderBottom: '2px solid #e5e7eb', marginBottom: '32px' }}>
        {['description', 'reviews', 'care'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: tab === t ? 600 : 400, color: tab === t ? '#1B4332' : '#6b7280', borderBottom: tab === t ? '2px solid #1B4332' : '2px solid transparent', marginBottom: '-2px', textTransform: 'capitalize', fontSize: '0.88rem' }}>{t}</button>
        ))}
      </div>

      {tab === 'description' && (
        <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.9, maxWidth: '700px', whiteSpace: 'pre-wrap' }}>{product.description || product.short_description || 'No description available.'}</div>
      )}

      {tab === 'reviews' && (
        <div style={{ maxWidth: '700px' }}>
          {reviews.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: '#fff', border: '1px solid #f0ece4', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1B4332', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>{r.user?.name?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.user?.name}</div>
                      <div style={{ display: 'flex', gap: '2px' }}>{[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '12px', color: s <= r.rating ? '#C5933A' : '#e5e7eb' }}>★</span>)}</div>
                    </div>
                  </div>
                  {r.title && <div style={{ fontWeight: 500, marginBottom: '6px', fontSize: '0.88rem' }}>{r.title}</div>}
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.7 }}>{r.review}</p>
                  {r.admin_reply && <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.8rem', color: '#166534', borderLeft: '3px solid #1B4332' }}><strong>KhadiCraft Reply:</strong> {r.admin_reply}</div>}
                </div>
              ))}
            </div>
          ) : <p style={{ color: '#9ca3af', marginBottom: '24px' }}>No reviews yet. Be the first!</p>}

          {isLoggedIn() && (
            <div style={{ background: '#fff', border: '1px solid #f0ece4', borderRadius: '10px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', marginBottom: '16px' }}>Write a Review</h3>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                {[1,2,3,4,5].map(s => <button key={s} onClick={() => setRevForm(f => ({...f, rating: s}))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: s <= revForm.rating ? '#C5933A' : '#e5e7eb' }}>★</button>)}
              </div>
              <input style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', marginBottom: '10px' }} placeholder="Review title" value={revForm.title} onChange={e => setRevForm(f => ({...f, title: e.target.value}))}/>
              <textarea rows={3} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', marginBottom: '12px' }} placeholder="Share your experience..." value={revForm.review} onChange={e => setRevForm(f => ({...f, review: e.target.value}))}/>
              <button onClick={submitReview} style={{ padding: '10px 24px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Submit Review</button>
            </div>
          )}
        </div>
      )}

      {tab === 'care' && (
        <div style={{ maxWidth: '500px', display: 'grid', gap: '12px' }}>
          {[['🫧', 'Washing', 'Hand wash in cold water with mild detergent. Avoid machine wash for delicate fabrics.'], ['☀️', 'Drying', 'Dry in shade away from direct sunlight. Sunlight can fade natural dyes.'], ['🔥', 'Ironing', 'Iron on medium heat while slightly damp. Use cloth between iron and fabric.'], ['📦', 'Storage', 'Store folded (not on hangers) in a cool, dry place. Use cotton bags for storage.']].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '14px', padding: '14px', background: '#fff', border: '1px solid #f0ece4', borderRadius: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>{icon}</span>
              <div><div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '3px' }}>{title}</div><div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>{desc}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 400, marginBottom: '28px' }}>You May Also Like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px' }}>
            {related.map(p => (
              <Link to={`/product/${p.slug}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit', background: '#fff', border: '1px solid #f0ece4', borderRadius: '8px', overflow: 'hidden', transition: 'all .2s', display: 'block' }}>
                <div style={{ aspectRatio: '3/4', background: '#f7f2ea', overflow: 'hidden' }}>
                  {p.thumbnail ? <img src={`http://localhost:8000/storage/${p.thumbnail}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name}/> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🏷️</div>}
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: '0.92rem', marginBottom: '5px' }}>{p.name}</div>
                  <div style={{ fontWeight: 600, color: '#1B4332' }}>₹{(p.sale_price || p.price)?.toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

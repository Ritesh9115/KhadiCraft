// src/components/ui/CustomerLayout.jsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../context/authStore';
import { useCartStore } from '../../context/authStore';
import ChatBot from './ChatBot';
import { profileAPI } from '../../services/api';

export default function CustomerLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isLoggedIn, logout, isAdmin } = useAuthStore();
  const cartCount = useCartStore(s => s.count());

  const navigate  = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    if (!isLoggedIn()) return;
    const fetchNotifs = () => {
      profileAPI.getNotifications().then(r => {
        const unread = (r.data?.data?.data || r.data?.data || []).filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }).catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [isLoggedIn()]);

  useEffect(() => {
    const onKey = (e) => { if(e.key==='Escape') { setMobileOpen(false); setSearchOpen(false); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <style>{`
        :root{--green:#1B4332;--gold:#C5933A;--cream:#F7F2EA;--text:#1A1A18;--muted:#5C5C52;--serif:'Georgia',serif}
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Jost',system-ui,sans-serif;color:var(--text);background:#FDFAF6}
        a{text-decoration:none;color:inherit}
        nav.kc-nav{
          position:fixed;top:0;left:0;right:0;z-index:500;
          background:rgba(253,250,246,0.94);backdrop-filter:blur(14px);
          border-bottom:1px solid #EDE3D4;height:68px;
          display:flex;align-items:center;justify-content:space-between;padding:0 5%;
          transition:all .3s
        }
        nav.kc-nav.scrolled{background:rgba(253,250,246,0.98);box-shadow:0 2px 20px rgba(0,0,0,0.06)}
        .kc-logo{display:flex;align-items:center;gap:10px}
        .kc-logo-mark{width:38px;height:38px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:18px;color:#fff;font-weight:600}
        .kc-logo-name{font-family:var(--serif);font-size:1.15rem;color:var(--green);font-weight:600}
        .kc-logo-sub{font-size:0.58rem;color:var(--gold);letter-spacing:2px;text-transform:uppercase}
        .kc-nav-links{display:flex;gap:24px;list-style:none}
        .kc-nav-links a{font-size:0.8rem;letter-spacing:0.5px;color:var(--muted);text-transform:uppercase;font-weight:500;transition:color .2s;position:relative}
        .kc-nav-links a::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1.5px;background:var(--gold);transition:width .3s}
        .kc-nav-links a:hover{color:var(--green)}
        .kc-nav-links a:hover::after{width:100%}
        .kc-nav-right{display:flex;align-items:center;gap:10px}
        .kc-icon-btn{width:38px;height:38px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:background .2s;position:relative;font-size:1.1rem}
        .kc-icon-btn:hover{background:#EDE3D4}
        .kc-cart-badge{position:absolute;top:4px;right:4px;width:16px;height:16px;border-radius:50%;background:var(--gold);color:#fff;font-size:9px;font-weight:600;display:flex;align-items:center;justify-content:center}
        .kc-notif-badge{position:absolute;top:3px;right:3px;min-width:16px;height:16px;border-radius:8px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 3px;line-height:1;animation:kc-pulse 2s infinite}
        @keyframes kc-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 4px rgba(239,68,68,0)}}
        .kc-btn-login{padding:7px 18px;border:1.5px solid var(--green);background:none;color:var(--green);font-size:0.76rem;letter-spacing:1px;text-transform:uppercase;font-weight:500;cursor:pointer;border-radius:2px;transition:all .25s}
        .kc-btn-login:hover{background:var(--green);color:#fff}
        .kc-hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px}
        .kc-hamburger span{width:22px;height:1.5px;background:var(--text);display:block}

        /* Mobile Menu */
        .kc-mobile-menu{position:fixed;inset:0;z-index:600;background:#FDFAF6;transform:translateX(100%);transition:transform .35s ease;padding:80px 8% 40px;display:flex;flex-direction:column;gap:0;overflow-y:auto}
        .kc-mobile-menu.open{transform:translateX(0)}
        .kc-mobile-close{position:absolute;top:18px;right:24px;background:none;border:none;font-size:1.4rem;cursor:pointer}
        .kc-mobile-menu a{font-family:var(--serif);font-size:1.6rem;font-weight:400;color:var(--text);padding:14px 0;border-bottom:1px solid #EDE3D4;display:flex;justify-content:space-between}

        /* Search Overlay */
        .kc-search{position:fixed;inset:0;z-index:700;background:rgba(253,250,246,0.97);backdrop-filter:blur(8px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:120px 8% 40px;opacity:0;pointer-events:none;transition:opacity .3s}
        .kc-search.open{opacity:1;pointer-events:all}
        .kc-search-bar{width:100%;max-width:640px;position:relative;margin-bottom:32px;border-bottom:2px solid var(--text)}
        .kc-search-bar input{width:100%;padding:16px 48px 16px 0;font-family:var(--serif);font-size:1.3rem;border:none;background:none;outline:none;color:var(--text)}
        .kc-search-close{position:absolute;right:0;top:50%;transform:translateY(-50%);background:none;border:none;font-size:1.2rem;cursor:pointer}
        .kc-search-chips{display:flex;flex-wrap:wrap;gap:10px;max-width:640px}
        .kc-chip{padding:7px 16px;border:1px solid #D8CFC0;border-radius:20px;font-size:0.8rem;cursor:pointer;transition:all .2s;background:#fff}
        .kc-chip:hover{border-color:var(--green);color:var(--green)}

        /* Main */
        .kc-main{padding-top:68px;min-height:100vh}

        /* Footer */
        .kc-footer{background:#0D2A1E;color:rgba(255,255,255,.65);padding:60px 8% 28px}
        .kc-footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}
        .kc-footer-title{font-size:0.7rem;letter-spacing:2px;text-transform:uppercase;color:#fff;font-weight:500;margin-bottom:16px}
        .kc-footer-links{list-style:none;display:flex;flex-direction:column;gap:9px}
        .kc-footer-links a{font-size:0.8rem;color:rgba(255,255,255,.5);transition:color .2s}
        .kc-footer-links a:hover{color:var(--gold)}
        .kc-footer-bottom{padding-top:24px;border-top:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
        .kc-footer-copy{font-size:0.73rem;color:rgba(255,255,255,.3)}
        .kc-pay-badges{display:flex;gap:8px}
        .kc-pay{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);padding:3px 9px;border-radius:3px;font-size:0.63rem;color:rgba(255,255,255,.45)}

        @media(max-width:768px){
          .kc-nav-links,.kc-btn-login{display:none}
          .kc-hamburger{display:flex}
          nav.kc-nav{padding:0 6%}
          .kc-footer-grid{grid-template-columns:1fr}
        }
      `}</style>

      {/* SEARCH */}
      <div className={`kc-search ${searchOpen?'open':''}`}>
        <div className="kc-search-bar">
          <input type="text" placeholder="Search kurtas, fabric, custom wear…" autoFocus={searchOpen}
            onKeyDown={e=>{ if(e.key==='Enter') { navigate(`/shop?search=${e.target.value}`); setSearchOpen(false); }}}/>
          <button className="kc-search-close" onClick={()=>setSearchOpen(false)}>✕</button>
        </div>
        <div style={{fontSize:'0.72rem',letterSpacing:'2px',textTransform:'uppercase',color:'#aaa',marginBottom:'14px'}}>Popular</div>
        <div className="kc-search-chips">
          {['Khadi Kurta','Cotton Fabric','Linen Shirt','Custom Tailoring','Wholesale Fabric','Blazer','Silk Blend','Jacket'].map(s=>(
            <span key={s} className="kc-chip" onClick={()=>{ navigate(`/shop?search=${s}`); setSearchOpen(false); }}>{s}</span>
          ))}
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`kc-mobile-menu ${mobileOpen?'open':''}`}>
        <button className="kc-mobile-close" onClick={()=>setMobileOpen(false)}>✕</button>
        {[['Shop All','/shop'],['Fabrics','/shop/fabric-thaan'],['Custom Tailoring','/custom-tailoring'],['Wholesale','/wholesale'],['Appointments','/appointments'],['About','#']].map(([l,p])=>(
          <Link key={p} to={p} onClick={()=>setMobileOpen(false)}>{l}<span>→</span></Link>
        ))}
        <div style={{marginTop:'24px',display:'grid',gap:'10px'}}>
          {isLoggedIn() ? (
            <>
              <Link to="/account" onClick={()=>setMobileOpen(false)} style={{display:'block',padding:'12px',border:'1.5px solid #D8CFC0',textAlign:'center',borderRadius:'2px',fontSize:'0.85rem'}}>My Account</Link>
              <Link to="/account/notifications" onClick={()=>setMobileOpen(false)} style={{display:'block',padding:'12px',border:'1.5px solid #D8CFC0',textAlign:'center',borderRadius:'2px',fontSize:'0.85rem'}}>Notifications {unreadCount > 0 && `(${unreadCount})`}</Link>
              <button onClick={()=>{logout();setMobileOpen(false)}} style={{padding:'12px',background:'#1B4332',color:'#fff',border:'none',borderRadius:'2px',fontSize:'0.85rem',cursor:'pointer'}}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={()=>setMobileOpen(false)} style={{display:'block',padding:'12px',background:'#1B4332',color:'#fff',textAlign:'center',borderRadius:'2px',fontSize:'0.85rem'}}>Login / Sign Up</Link>
          )}
          <Link to="/cart" onClick={()=>setMobileOpen(false)} style={{display:'block',padding:'12px',border:'1.5px solid #D8CFC0',textAlign:'center',borderRadius:'2px',fontSize:'0.85rem'}}>Cart ({cartCount})</Link>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className={`kc-nav ${scrolled?'scrolled':''}`}>
        <Link to="/" className="kc-logo">
          <div className="kc-logo-mark">K</div>
          <div><div className="kc-logo-name">KhadiCraft</div><div className="kc-logo-sub">by Goldy</div></div>
        </Link>
        <ul className="kc-nav-links">
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/shop/fabric-thaan">Fabrics</Link></li>
          <li><Link to="/custom-tailoring">Custom Tailoring</Link></li>
          <li><Link to="/wholesale">Wholesale</Link></li>
          <li><Link to="/appointments">Appointments</Link></li>
        </ul>
        <div className="kc-nav-right">
          <button className="kc-icon-btn" onClick={()=>setSearchOpen(true)} title="Search">🔍</button>
          <Link to="/cart" className="kc-icon-btn" title="Cart">
            🛍️{cartCount > 0 && <span className="kc-cart-badge">{cartCount}</span>}
          </Link>
          {isLoggedIn() ? (
            <>
              {/* Live Notification Bell */}
              <Link to="/account/notifications" className="kc-icon-btn" title="Notifications">
                🔔
                {unreadCount > 0 && <span className="kc-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </Link>
              <Link to="/account" className="kc-icon-btn" title="Account">
                <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#1B4332',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:600}}>
                  {user?.name?.[0]}
                </div>
              </Link>
              <button type="button" className="kc-btn-login" onClick={() => logout()} style={{ borderColor: '#b45309', color: '#b45309' }}>Logout</button>
            </>
          ) : (
            <Link to="/login"><button className="kc-btn-login">Login</button></Link>
          )}
          <button className="kc-hamburger" onClick={()=>setMobileOpen(true)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="kc-main"><Outlet /></main>

      {/* FOOTER */}
      <footer className="kc-footer">
        <div className="kc-footer-grid">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
              <div className="kc-logo-mark" style={{width:'34px',height:'34px',borderRadius:'50%',background:'#C5933A',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'serif',fontSize:'15px',fontWeight:600}}>K</div>
              <div><div style={{fontFamily:'serif',fontSize:'1.1rem',color:'#fff',fontWeight:600}}>KhadiCraft</div><div style={{fontSize:'0.58rem',color:'#C5933A',letterSpacing:'1.5px',textTransform:'uppercase'}}>by Goldy</div></div>
            </div>
            <p style={{fontSize:'0.8rem',lineHeight:1.8,color:'rgba(255,255,255,.45)',maxWidth:'240px',fontWeight:300}}>Authentic handwoven khadi fabrics and bespoke tailoring from Rampur Maniharan, Saharanpur. Weaving tradition into every thread.</p>
          </div>
          <div>
            <div className="kc-footer-title">Shop</div>
            <ul className="kc-footer-links">
              {[['Fabric & Thaan','/shop/fabric-thaan'],['Ready-made','/shop/ready-made'],['Custom Tailoring','/custom-tailoring'],['Accessories','/shop/accessories'],['Wholesale','/wholesale']].map(([l,p])=>(
                <li key={p}><Link to={p}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="kc-footer-title">Services</div>
            <ul className="kc-footer-links">
              {[['Book Appointment','/book-appointment'],['Track My Order','/track-order'],['Measurement Guide','#'],['Size Chart','#'],['Care Instructions','#']].map(([l,p])=>(
                <li key={l}><Link to={p}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="kc-footer-title">Contact</div>
            <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,.45)',lineHeight:2,fontWeight:300}}>
              📍 Rampur Maniharan, Saharanpur<br/>📞 +91 78300 57297<br/>✉️ hello@khadicraft.in<br/>🕘 Mon–Sat: 10am–7pm
            </div>
          </div>
        </div>
        <div className="kc-footer-bottom">
          <div className="kc-footer-copy">© 2025 KhadiCraft by Goldy. Made with ♥ in Saharanpur, India.</div>
          <div className="kc-pay-badges">
            {['Visa','Mastercard','UPI','COD','Net Banking'].map(b=><span key={b} className="kc-pay">{b}</span>)}
          </div>
        </div>
      </footer>

      {/* CHATBOT */}
      <ChatBot />
    </>
  );
}

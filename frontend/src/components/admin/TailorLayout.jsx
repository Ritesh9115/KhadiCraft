import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';

export default function TailorLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isActive = (p) => location.pathname.startsWith(p);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Jost',system-ui,sans-serif" }}>
      <aside style={{ width: '220px', background: '#1B4332', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0 }}>
        <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#C5933A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>K</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>KhadiCraft</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Tailor Portal</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            ['/tailor',        true,  '🏠', 'Dashboard'],
            ['/tailor/orders', false, '✂️', 'My Orders'],
          ].map(([p, exact, icon, label]) => (
            <Link
              key={p}
              to={p}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '6px', textDecoration: 'none',
                color: (exact ? location.pathname === '/tailor' : isActive(p)) ? '#fff' : 'rgba(255,255,255,0.65)',
                background: (exact ? location.pathname === '/tailor' : isActive(p)) ? '#C5933A' : 'transparent',
                fontSize: '0.84rem', fontWeight: 400, transition: 'all .2s',
              }}
            >
              <span>{icon}</span><span>{label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#C5933A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>{user?.name?.[0]}</div>
            <div>
              <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 500 }}>{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Tailor</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: 'rgba(239,68,68,0.8)', cursor: 'pointer', fontSize: '0.8rem' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: '220px', padding: '28px', background: '#F9FAFB', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}

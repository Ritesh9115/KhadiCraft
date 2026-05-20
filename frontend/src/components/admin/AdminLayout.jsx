// src/components/admin/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '🏠', exact: true },
  { label: 'Products', path: '/admin/products', icon: '🏷️' },
  { label: 'Categories', path: '/admin/categories', icon: '📂' },
  { label: 'Orders', path: '/admin/orders', icon: '📦' },
  { label: 'Custom Orders', path: '/admin/custom-orders', icon: '✂️' },
  { label: 'Appointments', path: '/admin/appointments', icon: '📅' },
  { label: 'Inventory', path: '/admin/inventory', icon: '📊' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Wholesale', path: '/admin/wholesale', icon: '🏭' },
  { label: 'Banners', path: '/admin/banners', icon: '🖼️' },
  { label: 'Reports', path: '/admin/reports', icon: '📈' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (item) => item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">K</div>
          {sidebarOpen && (
            <div>
              <div className="sidebar-logo-text">KhadiCraft</div>
              <div className="sidebar-logo-sub">Admin Panel</div>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{user?.name?.[0]}</div>
              <div>
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-role">{user?.role}</div>
              </div>
            </div>
          )}
          <button className="sidebar-logout" onClick={logout} title="Logout">{sidebarOpen ? '🚪 Logout' : '🚪'}</button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>☰</button>
          <div className="topbar-breadcrumb">
            {navItems.find(n => isActive(n))?.label || 'Dashboard'}
          </div>
          <div className="topbar-actions">
            <Link to="/" target="_blank" className="topbar-btn" title="View Site">🌐 View Site</Link>
            <button type="button" className="topbar-btn" onClick={() => logout()} title="Logout">Logout</button>
            <div className="topbar-user">
              <div className="topbar-avatar">{user?.name?.[0]}</div>
              <span>{user?.name}</span>
            </div>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        :root {
          --adm-green:#1B4332; --adm-gold:#C5933A; --adm-cream:#F7F2EA;
          --adm-border:#E5E7EB; --adm-bg:#F9FAFB; --adm-white:#fff;
          --adm-text:#111827; --adm-muted:#6B7280; --adm-sidebar:220px;
          --adm-sidebar-closed:64px;
        }
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Jost',system-ui,sans-serif;background:var(--adm-bg);color:var(--adm-text)}

        .admin-layout{display:flex;min-height:100vh;transition:all .3s}
        .admin-sidebar{
          width:var(--adm-sidebar);flex-shrink:0;
          background:var(--adm-green);
          display:flex;flex-direction:column;
          position:fixed;top:0;left:0;bottom:0;z-index:200;
          transition:width .3s ease;overflow:hidden
        }
        .sidebar-closed .admin-sidebar{width:var(--adm-sidebar-closed)}
        .sidebar-logo{
          display:flex;align-items:center;gap:10px;
          padding:18px 16px;border-bottom:1px solid rgba(255,255,255,0.1);
          min-height:64px;position:relative
        }
        .sidebar-logo-mark{
          width:34px;height:34px;border-radius:8px;
          background:var(--adm-gold);color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-weight:700;font-size:1rem;flex-shrink:0
        }
        .sidebar-logo-text{color:#fff;font-weight:600;font-size:0.95rem;white-space:nowrap}
        .sidebar-logo-sub{color:rgba(255,255,255,0.5);font-size:0.65rem;letter-spacing:1px;text-transform:uppercase}
        .sidebar-toggle{
          position:absolute;right:10px;background:rgba(255,255,255,0.1);
          border:none;color:#fff;width:24px;height:24px;border-radius:50%;
          cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center
        }
        .sidebar-nav{flex:1;padding:12px 8px;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;gap:2px}
        .sidebar-link{
          display:flex;align-items:center;gap:10px;padding:10px 10px;
          border-radius:6px;text-decoration:none;
          color:rgba(255,255,255,0.65);transition:all .2s;white-space:nowrap;
          font-size:0.84rem;font-weight:400
        }
        .sidebar-link:hover{background:rgba(255,255,255,0.1);color:#fff}
        .sidebar-link.active{background:var(--adm-gold);color:#fff;font-weight:500}
        .sidebar-icon{font-size:1.1rem;flex-shrink:0;width:20px;text-align:center}
        .sidebar-footer{padding:12px 8px;border-top:1px solid rgba(255,255,255,0.1)}
        .sidebar-user{display:flex;align-items:center;gap:10px;padding:8px;margin-bottom:4px}
        .sidebar-user-avatar{
          width:30px;height:30px;border-radius:50%;
          background:var(--adm-gold);color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:0.8rem;font-weight:600;flex-shrink:0
        }
        .sidebar-user-name{color:#fff;font-size:0.82rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}
        .sidebar-user-role{color:rgba(255,255,255,0.4);font-size:0.68rem;text-transform:uppercase;letter-spacing:0.5px}
        .sidebar-logout{
          width:100%;padding:8px;background:rgba(239,68,68,0.15);
          border:1px solid rgba(239,68,68,0.3);border-radius:6px;
          color:rgba(239,68,68,0.8);cursor:pointer;font-size:0.8rem;
          transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px
        }
        .sidebar-logout:hover{background:rgba(239,68,68,0.25);color:#ef4444}

        .admin-main{
          flex:1;margin-left:var(--adm-sidebar);
          transition:margin-left .3s ease;min-height:100vh;
          display:flex;flex-direction:column
        }
        .sidebar-closed .admin-main{margin-left:var(--adm-sidebar-closed)}

        .admin-topbar{
          background:var(--adm-white);border-bottom:1px solid var(--adm-border);
          height:64px;display:flex;align-items:center;padding:0 24px;
          gap:16px;position:sticky;top:0;z-index:100
        }
        .mobile-menu-btn{display:none;background:none;border:none;font-size:1.3rem;cursor:pointer}
        .topbar-breadcrumb{flex:1;font-weight:500;font-size:0.95rem;color:var(--adm-text)}
        .topbar-actions{display:flex;align-items:center;gap:12px}
        .topbar-btn{
          padding:6px 14px;border:1px solid var(--adm-border);border-radius:6px;
          background:none;text-decoration:none;color:var(--adm-muted);
          font-size:0.78rem;cursor:pointer;transition:all .2s
        }
        .topbar-btn:hover{border-color:var(--adm-green);color:var(--adm-green)}
        .topbar-user{display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--adm-muted)}
        .topbar-avatar{
          width:32px;height:32px;border-radius:50%;
          background:var(--adm-green);color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:0.78rem;font-weight:600
        }
        .admin-content{flex:1;padding:24px;overflow-x:hidden}

        /* Page */
        .admin-page{}
        .admin-page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
        .admin-page-header h1{font-size:1.4rem;font-weight:600;color:var(--adm-text);margin-bottom:4px}
        .admin-page-header p{font-size:0.83rem;color:var(--adm-muted)}
        .admin-loading{display:flex;align-items:center;justify-content:center;min-height:400px}
        .spinner{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:var(--adm-green);border-radius:50%;animation:spin .7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Stats */
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
        .stat-card{
          background:var(--adm-white);border:1px solid var(--adm-border);
          border-radius:10px;padding:18px;display:flex;align-items:center;gap:14px;
          transition:all .2s
        }
        .stat-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.08);transform:translateY(-2px)}
        .stat-icon{width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
        .stat-value{font-size:1.4rem;font-weight:700;color:var(--adm-text)}
        .stat-label{font-size:0.78rem;color:var(--adm-muted);margin-top:2px}
        .stat-sub{font-size:0.72rem;color:#9CA3AF;margin-top:2px}

        /* Charts */
        .charts-row{display:grid;grid-template-columns:2fr 1.2fr 1fr;gap:16px;margin-bottom:24px}
        .chart-card{background:var(--adm-white);border:1px solid var(--adm-border);border-radius:10px;padding:20px}
        .chart-card.wide{grid-column:span 1}
        .chart-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
        .chart-header h3{font-size:0.95rem;font-weight:600}
        .chart-badge{font-size:0.7rem;background:#f0fdf4;color:#166534;padding:3px 8px;border-radius:4px}
        .pie-legend{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
        .pie-legend-item{display:flex;align-items:center;gap:6px;font-size:0.72rem;color:var(--adm-muted)}
        .pie-legend-item span{width:10px;height:10px;border-radius:50%;display:block;flex-shrink:0}

        /* Bottom */
        .bottom-row{display:grid;grid-template-columns:1.5fr 1fr;gap:16px}
        .admin-table-card{background:var(--adm-white);border:1px solid var(--adm-border);border-radius:10px;padding:20px}
        .card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
        .card-header h3{font-size:0.95rem;font-weight:600}
        .view-all-link{font-size:0.78rem;color:var(--adm-green);text-decoration:none}
        .view-all-link:hover{text-decoration:underline}

        /* Table */
        .admin-table{width:100%;border-collapse:collapse;font-size:0.83rem}
        .admin-table th{padding:8px 12px;text-align:left;font-size:0.72rem;font-weight:500;color:var(--adm-muted);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--adm-border)}
        .admin-table td{padding:10px 12px;border-bottom:1px solid #f3f4f6;color:var(--adm-text)}
        .admin-table tr:hover td{background:#fafafa}
        .admin-table tr:last-child td{border-bottom:none}
        .order-num{font-family:monospace;font-size:0.78rem;color:var(--adm-green);font-weight:600}
        .status-badge{padding:3px 8px;border-radius:4px;font-size:0.7rem;font-weight:500;text-transform:capitalize}

        /* Custom order items */
        .custom-order-item{
          display:flex;justify-content:space-between;align-items:center;
          padding:10px;border-radius:6px;border:1px solid var(--adm-border);
          cursor:pointer;transition:background .2s
        }
        .custom-order-item:hover{background:#fafafa}
        .appt-item{display:flex;align-items:center;gap:12px;padding:10px;border-radius:6px;border:1px solid var(--adm-border)}
        .appt-date-badge{
          width:38px;height:38px;border-radius:8px;background:var(--adm-green);
          color:#fff;display:flex;flex-direction:column;align-items:center;
          justify-content:center;flex-shrink:0;font-size:0.65rem;font-weight:600;
          line-height:1.2
        }

        /* Form elements */
        .admin-select{
          padding:6px 12px;border:1px solid var(--adm-border);border-radius:6px;
          font-size:0.82rem;background:var(--adm-white);color:var(--adm-text);cursor:pointer
        }
        .btn-primary-sm{
          padding:7px 16px;background:var(--adm-green);color:#fff;
          border:none;border-radius:6px;font-size:0.8rem;cursor:pointer;font-weight:500;
          transition:background .2s
        }
        .btn-primary-sm:hover{background:#0D2A1E}
        .btn-gold-sm{
          padding:7px 16px;background:var(--adm-gold);color:#fff;
          border:none;border-radius:6px;font-size:0.8rem;cursor:pointer;font-weight:500
        }
        .btn-outline-sm{
          padding:7px 16px;background:none;color:var(--adm-text);
          border:1px solid var(--adm-border);border-radius:6px;font-size:0.8rem;cursor:pointer;
          transition:all .2s
        }
        .btn-outline-sm:hover{border-color:var(--adm-green);color:var(--adm-green)}
        .btn-danger-sm{
          padding:7px 16px;background:none;color:#ef4444;
          border:1px solid #fecaca;border-radius:6px;font-size:0.8rem;cursor:pointer;
          transition:all .2s
        }
        .btn-danger-sm:hover{background:#fef2f2}

        /* Filters bar */
        .filters-bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;align-items:center}
        .filter-input{
          padding:7px 12px;border:1px solid var(--adm-border);border-radius:6px;
          font-size:0.82rem;outline:none;transition:border .2s;min-width:200px
        }
        .filter-input:focus{border-color:var(--adm-green)}

        /* Pagination */
        .pagination{display:flex;justify-content:space-between;align-items:center;margin-top:16px;font-size:0.82rem;color:var(--adm-muted)}
        .pagination-btns{display:flex;gap:6px}
        .page-btn{
          padding:5px 12px;border:1px solid var(--adm-border);border-radius:5px;
          background:none;cursor:pointer;font-size:0.8rem;color:var(--adm-text);transition:all .2s
        }
        .page-btn:hover{border-color:var(--adm-green);color:var(--adm-green)}
        .page-btn.active{background:var(--adm-green);color:#fff;border-color:var(--adm-green)}
        .page-btn:disabled{opacity:.4;cursor:default}

        /* Modal */
        .modal-backdrop{
          position:fixed;inset:0;background:rgba(0,0,0,0.5);
          z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px
        }
        .modal{
          background:#fff;border-radius:12px;padding:28px;
          width:100%;max-width:560px;max-height:90vh;overflow-y:auto;
          box-shadow:0 20px 60px rgba(0,0,0,0.2)
        }
        .modal-lg{max-width:800px}
        .modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
        .modal-header h2{font-size:1.1rem;font-weight:600}
        .modal-close{background:none;border:none;font-size:1.3rem;cursor:pointer;color:var(--adm-muted)}
        .modal-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:24px;padding-top:16px;border-top:1px solid var(--adm-border)}

        /* Form */
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .form-full{grid-column:1/-1}
        .form-group{display:flex;flex-direction:column;gap:6px}
        .form-label{font-size:0.78rem;font-weight:500;color:var(--adm-text)}
        .form-label.required::after{content:' *';color:#ef4444}
        .form-input,.form-select,.form-textarea{
          padding:8px 12px;border:1px solid var(--adm-border);border-radius:6px;
          font-size:0.85rem;outline:none;transition:border .2s;
          font-family:inherit;background:#fff;color:var(--adm-text)
        }
        .form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--adm-green)}
        .form-textarea{resize:vertical;min-height:80px}
        .form-error{font-size:0.73rem;color:#ef4444;margin-top:2px}
        .form-hint{font-size:0.73rem;color:var(--adm-muted)}
        .toggle-switch{position:relative;width:44px;height:24px}
        .toggle-switch input{opacity:0;width:0;height:0}
        .toggle-slider{
          position:absolute;inset:0;background:#e5e7eb;border-radius:12px;
          cursor:pointer;transition:.3s
        }
        .toggle-slider::before{
          content:'';position:absolute;height:18px;width:18px;
          left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s
        }
        .toggle-switch input:checked + .toggle-slider{background:var(--adm-green)}
        .toggle-switch input:checked + .toggle-slider::before{transform:translateX(20px)}

        /* Image upload */
        .img-upload-zone{
          border:2px dashed var(--adm-border);border-radius:8px;padding:32px;
          text-align:center;cursor:pointer;transition:all .2s;
          color:var(--adm-muted);font-size:0.85rem
        }
        .img-upload-zone:hover{border-color:var(--adm-green);color:var(--adm-green);background:#f0fdf4}
        .img-preview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
        .img-preview{position:relative;aspect-ratio:1;border-radius:6px;overflow:hidden;background:#f3f4f6}
        .img-preview img{width:100%;height:100%;object-fit:cover}
        .img-preview-del{
          position:absolute;top:4px;right:4px;background:rgba(239,68,68,0.9);
          color:#fff;border:none;border-radius:50%;width:20px;height:20px;
          font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center
        }

        /* Tags */
        .tags-input{display:flex;flex-wrap:wrap;gap:6px;padding:6px;border:1px solid var(--adm-border);border-radius:6px;cursor:text}
        .tag-item{display:flex;align-items:center;gap:4px;background:#f0fdf4;color:var(--adm-green);padding:3px 8px;border-radius:4px;font-size:0.75rem}
        .tag-remove{background:none;border:none;cursor:pointer;color:#6b7280;line-height:1}
        .tags-input input{border:none;outline:none;font-size:0.82rem;min-width:100px;flex:1}

        /* Sidebar overlay mobile */
        .sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:199}

        @media(max-width:1200px){
          .stats-grid{grid-template-columns:repeat(4,1fr)}
          .charts-row{grid-template-columns:1fr 1fr}
          .chart-card.narrow{grid-column:span 2}
        }
        @media(max-width:900px){
          .stats-grid{grid-template-columns:repeat(2,1fr)}
          .charts-row{grid-template-columns:1fr}
          .bottom-row{grid-template-columns:1fr}
          .admin-sidebar{transform:translateX(-100%)}
          .admin-sidebar.mobile-open{transform:translateX(0)}
          .admin-main{margin-left:0!important}
          .mobile-menu-btn{display:block}
          .sidebar-closed .admin-sidebar{transform:translateX(-100%)}
        }
        @media(max-width:600px){
          .stats-grid{grid-template-columns:1fr 1fr}
          .form-grid{grid-template-columns:1fr}
          .admin-content{padding:16px}
        }
      `}</style>
    </div>
  );
}
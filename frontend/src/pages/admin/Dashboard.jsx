// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:'#F59E0B', confirmed:'#3B82F6', processing:'#8B5CF6',
  ready:'#10B981', dispatched:'#6366F1', delivered:'#059669',
  cancelled:'#EF4444', returned:'#F97316'
};

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [stats,   setStats]   = useState([]);
  const [range,   setRange]   = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadStats();
  }, [range]);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.dashboard();
      setData(res.data.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally  { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      const res = await adminAPI.stats({ range });
      setStats(res.data.data);
    } catch {}
  };

  if (loading) return <div className="admin-loading"><span className="spinner"/></div>;

  const statCards = [
    { label:"Today's Orders",   value: data?.today_orders,    icon:'📦', color:'#1B4332', sub:`₹${(data?.today_revenue||0).toLocaleString()} revenue`},
    { label:"Month Revenue",    value: `₹${(data?.month_revenue||0).toLocaleString()}`, icon:'💰', color:'#C5933A', sub:'This month'},
    { label:"Pending Orders",   value: data?.pending_orders,  icon:'⏳', color:'#F59E0B', sub:'Needs action', link:'/admin/orders?status=pending'},
    { label:"Custom Orders",    value: data?.custom_orders,   icon:'✂️', color:'#8B5CF6', sub:'In progress',  link:'/admin/custom-orders'},
    { label:"Today Appointments",value:data?.today_appointments,icon:'📅',color:'#3B82F6', sub:`${data?.pending_appointments} pending`},
    { label:"Total Customers",  value: data?.total_customers, icon:'👥', color:'#059669', sub:`+${data?.new_customers_month} this month`},
    { label:"Low Stock",        value: data?.low_stock_products,icon:'⚠️',color:'#F97316', sub:`${data?.out_of_stock} out of stock`, link:'/admin/inventory?stock=low'},
    { label:"Active Products",  value: data?.total_products,  icon:'🏷️', color:'#6366F1', sub:'Listed products'},
  ];

  const pieData = Object.entries(data?.order_status_breakdown || {}).map(([k,v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1), value: v, color: STATUS_COLORS[k] || '#ccc'
  }));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <select className="admin-select" value={range} onChange={e=>setRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button className="btn-primary-sm" onClick={loadDashboard}>↻ Refresh</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" onClick={() => card.link && (window.location.href = card.link)}
            style={{ cursor: card.link ? 'pointer' : 'default' }}>
            <div className="stat-icon" style={{ background: card.color + '18', color: card.color }}>{card.icon}</div>
            <div className="stat-body">
              <div className="stat-value">{card.value ?? '—'}</div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="chart-card wide">
          <div className="chart-header">
            <h3>Revenue Trend</h3>
            <span className="chart-badge">Last {range} days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{fontSize:11}} tickFormatter={d=>new Date(d).toLocaleDateString('en',{month:'short',day:'numeric'})}/>
              <YAxis tick={{fontSize:11}} tickFormatter={v=>`₹${v>=1000?(v/1000).toFixed(1)+'k':v}`}/>
              <Tooltip formatter={(v)=>[`₹${v.toLocaleString()}`,'Revenue']}/>
              <Line type="monotone" dataKey="total" stroke="#1B4332" strokeWidth={2.5} dot={false} activeDot={{r:5}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue */}
        <div className="chart-card">
          <div className="chart-header"><h3>Monthly Revenue</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.monthly_revenue?.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="month" tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v)=>[`₹${v.toLocaleString()}`,'Revenue']}/>
              <Bar dataKey="revenue" fill="#C5933A" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="chart-card narrow">
          <div className="chart-header"><h3>Order Status</h3></div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {pieData.map((d,i) => (
              <div key={i} className="pie-legend-item">
                <span style={{background:d.color}}/>
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row">
        {/* Recent Orders */}
        <div className="admin-table-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="view-all-link">View All →</Link>
          </div>
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {(data?.recent_orders || []).map(order => (
                <tr key={order.id} onClick={()=>window.location.href=`/admin/orders/${order.id}`} style={{cursor:'pointer'}}>
                  <td><span className="order-num">{order.order_number}</span></td>
                  <td>{order.user?.name}</td>
                  <td>₹{order.total?.toLocaleString()}</td>
                  <td><span className="status-badge" style={{background:STATUS_COLORS[order.status]+'20',color:STATUS_COLORS[order.status]}}>{order.status}</span></td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
          {/* Custom Orders */}
          <div className="admin-table-card">
            <div className="card-header">
              <h3>Custom Orders</h3>
              <Link to="/admin/custom-orders" className="view-all-link">View All →</Link>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {(data?.recent_custom || []).map(order => (
                <div key={order.id} className="custom-order-item" onClick={()=>window.location.href=`/admin/custom-orders/${order.id}`}>
                  <div>
                    <div className="order-num">{order.custom_order_number}</div>
                    <div style={{fontSize:'0.78rem',color:'#888'}}>{order.style_type} · {order.user?.name}</div>
                  </div>
                  <span className="status-badge" style={{background:STATUS_COLORS[order.status]+'20',color:STATUS_COLORS[order.status]||'#666'}}>{order.status?.replace('_',' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="admin-table-card">
            <div className="card-header">
              <h3>Upcoming Appointments</h3>
              <Link to="/admin/appointments" className="view-all-link">View All →</Link>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {(data?.upcoming_appointments || []).map(apt => (
                <div key={apt.id} className="appt-item">
                  <div className="appt-date-badge">
                    <span>{new Date(apt.appointment_date).toLocaleDateString('en',{day:'2-digit'})}</span>
                    <span>{new Date(apt.appointment_date).toLocaleDateString('en',{month:'short'})}</span>
                  </div>
                  <div>
                    <div style={{fontWeight:500,fontSize:'0.85rem'}}>{apt.user?.name}</div>
                    <div style={{fontSize:'0.75rem',color:'#888'}}>{apt.time_slot} · {apt.type?.replace('_',' ')}</div>
                  </div>
                  <span style={{fontSize:'0.72rem',background:'#dbeafe',color:'#1d4ed8',padding:'3px 8px',borderRadius:'4px'}}>{apt.purpose}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

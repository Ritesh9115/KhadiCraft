import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ACOLOR = { pending: '#f59e0b', confirmed: '#059669', rescheduled: '#3b82f6', completed: '#6b7280', cancelled: '#ef4444' };

export default function AdminAppointments() {
  const [apts,    setApts]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', date_from: '', page: 1 });

  useEffect(() => { load(); }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.appointments(filters);
      setApts(r.data.data?.data || []);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    await adminAPI.updateApptStatus(id, { status });
    setApts(a => a.map(x => x.id === id ? { ...x, status } : x));
    toast.success('Status updated!');
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Appointments</h1><p>Manage measurement and consultation bookings</p></div>
      </div>

      <div className="filters-bar">
        <input
          className="filter-input"
          placeholder="🔍 Search customer..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          style={{ flex: 1 }}
        />
        <select className="admin-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          className="admin-select"
          style={{ padding: '6px 10px' }}
          value={filters.date_from}
          onChange={e => setFilters(f => ({ ...f, date_from: e.target.value, page: 1 }))}
        />
        <button className="btn-outline-sm" onClick={() => setFilters({ search: '', status: '', date_from: '', page: 1 })}>Clear</button>
      </div>

      <div className="admin-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : (
            <table className="admin-table" style={{ minWidth: '850px' }}>
              <thead>
                <tr><th>Apt #</th><th>Customer</th><th>Date &amp; Slot</th><th>Type</th><th>Purpose</th><th>Staff</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {apts.map(a => (
                  <tr key={a.id}>
                    <td><span className="order-num">{a.appointment_number}</span></td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.83rem' }}>{a.user?.name}</div>
                      <div style={{ fontSize: '0.71rem', color: '#9ca3af' }}>{a.user?.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                        {new Date(a.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{a.time_slot}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '4px', background: a.type === 'home_visit' ? '#fef3c7' : '#f0fdf4', color: a.type === 'home_visit' ? '#92400e' : '#166534' }}>
                        {a.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{a.purpose}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {a.staff?.name || <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>Unassigned</span>}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: (ACOLOR[a.status] || '#6b7280') + '20', color: ACOLOR[a.status] || '#6b7280' }}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {a.status === 'pending' && (
                          <button onClick={() => updateStatus(a.id, 'confirmed')} className="btn-primary-sm" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>✓ Confirm</button>
                        )}
                        {a.status !== 'cancelled' && a.status !== 'completed' && (
                          <button onClick={() => updateStatus(a.id, 'completed')} className="btn-outline-sm" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>✅ Done</button>
                        )}
                        {a.status !== 'cancelled' && (
                          <button onClick={() => updateStatus(a.id, 'cancelled')} className="btn-danger-sm" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>✕</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!apts.length && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>No appointments found</td></tr>
                )}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

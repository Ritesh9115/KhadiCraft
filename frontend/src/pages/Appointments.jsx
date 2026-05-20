import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    appointmentAPI.list()
      .then(r => setAppointments(r.data.data?.data || r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  }, []);

  const STATUS_COLOR = { pending: '#f59e0b', confirmed: '#059669', completed: '#6b7280', cancelled: '#ef4444', rescheduled: '#3b82f6' };
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div style={{ padding: '40px 8%', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', fontWeight: 400, marginBottom: '4px' }}>Appointments</h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Schedule and manage your store visits</p>
        </div>
        <Link to="/book-appointment" style={{ padding: '11px 22px', background: '#1B4332', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
          📅 Book New Appointment
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', border: `1px solid ${filter === s ? '#1B4332' : '#e5e7eb'}`, borderRadius: '20px', background: filter === s ? '#1B4332' : '#fff', color: filter === s ? '#fff' : '#6b7280', fontSize: '0.78rem', cursor: 'pointer', textTransform: 'capitalize' }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading
        ? <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading...</div>
        : !filtered.length
        ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af', background: '#fff', borderRadius: '10px', border: '1px solid #f0ece4' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📅</div>
            <p style={{ marginBottom: '20px' }}>No appointments yet</p>
            <Link to="/book-appointment" style={{ padding: '11px 22px', background: '#1B4332', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem' }}>Book Your First Appointment</Link>
          </div>
        )
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.map(apt => (
              <div key={apt.id} style={{ background: '#fff', border: '1px solid #f0ece4', borderRadius: '10px', padding: '20px', borderLeft: `4px solid ${STATUS_COLOR[apt.status] || '#e5e7eb'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontFamily:'monospace', color:'#1B4332', fontWeight:600, fontSize:'0.88rem' }}>APT #{apt.id}</span>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: (STATUS_COLOR[apt.status] || '#6b7280') + '15', color: STATUS_COLOR[apt.status] || '#6b7280', textTransform: 'capitalize' }}>{apt.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '2px' }}>
                      📅 {new Date(apt.appointment_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {apt.time_slot}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                      {apt.type === 'home_visit' ? '🏠 Home Visit' : '🏪 Shop Visit'} · Purpose: {apt.purpose}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

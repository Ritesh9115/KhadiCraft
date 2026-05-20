// src/pages/account/Notifications.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TYPE_ICON  = { order:'📦', custom:'✂️', info:'ℹ️', success:'✅', warning:'⚠️' };
const TYPE_COLOR = { order:'#3b82f6', custom:'#8b5cf6', info:'#6b7280', success:'#059669', warning:'#f59e0b' };

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await profileAPI.getNotifications();
      setNotifs(res.data.data?.data || res.data.data || []);
    } catch { toast.error('Failed to load notifications'); }
    finally  { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await profileAPI.markRead(id);
      setNotifs(n => n.map(x => x.id===id ? {...x, is_read:true} : x));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await profileAPI.markAllRead();
      setNotifs(n => n.map(x => ({...x, is_read:true})));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const filtered  = filter==='all' ? notifs : filter==='unread' ? notifs.filter(n=>!n.is_read) : notifs.filter(n=>n.type===filter);
  const unreadCnt = notifs.filter(n => !n.is_read).length;

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins  = Math.floor(diff/60000);
    const hours = Math.floor(diff/3600000);
    const days  = Math.floor(diff/86400000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7)   return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  };

  return (
    <div style={{ padding:'40px 8%', maxWidth:'720px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.8rem', fontWeight:400 }}>Notifications</h1>
            {unreadCnt > 0 && (
              <span style={{ background:'#ef4444', color:'#fff', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:700 }}>{unreadCnt}</span>
            )}
          </div>
          <p style={{ color:'#6b7280', fontSize:'0.84rem' }}>{notifs.length} notification{notifs.length!==1?'s':''}</p>
        </div>
        {unreadCnt > 0 && (
          <button onClick={markAllRead} style={{ padding:'8px 18px', border:'1px solid #e5e7eb', background:'#fff', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem', color:'#1B4332', fontWeight:500, transition:'all .2s' }}>
            ✓ Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {[
          { key:'all',    label:`All (${notifs.length})` },
          { key:'unread', label:`Unread (${unreadCnt})` },
          { key:'order',  label:'📦 Orders' },
          { key:'custom', label:'✂️ Custom' },
          { key:'info',   label:'ℹ️ Info' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding:'6px 14px', border:`1.5px solid ${filter===f.key?'#1B4332':'#e5e7eb'}`, borderRadius:'20px', background:filter===f.key?'#1B4332':'#fff', color:filter===f.key?'#fff':'#6b7280', fontSize:'0.78rem', cursor:'pointer', fontWeight:filter===f.key?500:400, transition:'all .2s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>
          <div style={{ width:'28px', height:'28px', border:'3px solid #e5e7eb', borderTopColor:'#1B4332', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 10px' }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading notifications...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px', background:'#fff', borderRadius:'10px', border:'1px solid #f0ece4', color:'#9ca3af' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🔔</div>
          <div style={{ fontSize:'1.1rem', color:'#374151', marginBottom:'8px' }}>
            {filter==='unread' ? 'No unread notifications' : 'No notifications yet'}
          </div>
          <p style={{ fontSize:'0.85rem' }}>You'll be notified about your orders, appointments, and updates here.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              style={{ background: n.is_read ? '#fff' : '#fafffe', border:`1px solid ${n.is_read?'#f0ece4':'#bbf7d0'}`, borderRadius:'10px', padding:'16px 18px', cursor: n.is_read ? 'default' : 'pointer', transition:'all .2s', display:'flex', gap:'14px', alignItems:'flex-start', position:'relative' }}
              onMouseOver={e => { if(!n.is_read) e.currentTarget.style.background='#f0fdf4'; }}
              onMouseOut={e  => { if(!n.is_read) e.currentTarget.style.background='#fafffe'; }}
            >
              {/* Unread dot */}
              {!n.is_read && (
                <div style={{ position:'absolute', top:'14px', right:'14px', width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444' }}/>
              )}

              {/* Icon */}
              <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:(TYPE_COLOR[n.type]||'#6b7280')+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>
                {TYPE_ICON[n.type] || '🔔'}
              </div>

              {/* Content */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px', marginBottom:'3px' }}>
                  <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize:'0.88rem', color:'#111', lineHeight:1.3 }}>{n.title}</div>
                  <div style={{ fontSize:'0.72rem', color:'#9ca3af', flexShrink:0 }}>{timeAgo(n.created_at)}</div>
                </div>
                <div style={{ fontSize:'0.82rem', color:n.is_read?'#6b7280':'#374151', lineHeight:1.6 }}>{n.message}</div>
                {n.action_url && (
                  <Link to={n.action_url} onClick={e=>e.stopPropagation()} style={{ display:'inline-block', marginTop:'8px', fontSize:'0.75rem', color:'#1B4332', fontWeight:500, textDecoration:'none' }}>
                    View Details →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more (if paginated) */}
      {filtered.length >= 20 && (
        <div style={{ textAlign:'center', marginTop:'20px' }}>
          <button onClick={load} style={{ padding:'10px 28px', border:'1px solid #e5e7eb', background:'#fff', borderRadius:'6px', cursor:'pointer', fontSize:'0.83rem', color:'#6b7280' }}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

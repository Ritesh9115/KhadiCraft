import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [tab,     setTab]     = useState('sales');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [range,   setRange]   = useState({
    from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });

  useEffect(() => { loadReport(); }, [tab, range]);

  const loadReport = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'sales')    res = await adminAPI.salesReport(range);
      if (tab === 'orders')   res = await adminAPI.orderReport(range);
      if (tab === 'products') res = await adminAPI.productReport(range);
      if (tab === 'tailor')   res = await adminAPI.tailorReport(range);
      setData(res?.data?.data || null);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  const exportReport = async () => {
    try {
      const res = await adminAPI.exportReport(tab, range);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tab}-report-${range.from}.csv`;
      a.click();
      toast.success('Report exported!');
    } catch { toast.error('Export failed'); }
  };

  const TABS = [['sales', '💰 Sales'], ['orders', '📦 Orders'], ['products', '🏷️ Products'], ['tailor', '✂️ Tailor Performance']];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Reports &amp; Analytics</h1><p>Business insights and performance data</p></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="date" className="admin-select" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))} />
          <span style={{ alignSelf: 'center', color: '#6b7280', fontSize: '0.82rem' }}>to</span>
          <input type="date" className="admin-select" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))} />
          <button className="btn-outline-sm" onClick={exportReport}>📥 Export CSV</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: '24px' }}>
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 500, color: tab === key ? '#1B4332' : '#6b7280', borderBottom: tab === key ? '2px solid #1B4332' : '2px solid transparent', marginBottom: '-2px' }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading
        ? <div className="admin-loading"><span className="spinner" /></div>
        : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {data?.summary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '14px' }}>
                {Object.entries(data.summary).map(([k, v]) => (
                  <div key={k} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1B4332' }}>
                      {typeof v === 'number' && v > 100 ? `₹${v.toLocaleString()}` : v}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: '3px', textTransform: 'capitalize' }}>
                      {k.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {data?.rows && (
              <div className="admin-table-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="admin-table">
                  <thead>
                    <tr>{data.columns?.map(c => <th key={c} style={{ textTransform: 'capitalize' }}>{c.replace(/_/g, ' ')}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row, i) => (
                      <tr key={i}>{data.columns?.map(c => <td key={c} style={{ fontSize: '0.83rem' }}>{row[c] !== null && row[c] !== undefined ? row[c] : '—'}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!data && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
                <div>Select a date range to view the report</div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

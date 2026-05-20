// src/pages/admin/Wholesale.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminWholesale() {
  const [buyers, setBuyers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('buyers'); // buyers | quotes
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });

  useEffect(() => { loadAll(); }, [tab, filters]);

  const loadAll = async () => {
    setLoading(true);
    try {
      if (tab === 'buyers') {
        const res = await adminAPI.wholesaleBuyers(filters);
        setBuyers(res.data.data?.data || []);
      } else {
        const res = await adminAPI.wholesaleQuotes(filters);
        setQuotes(res.data.data?.data || []);
      }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const updateBuyerStatus = async (id, status) => {
    try {
      await adminAPI.updateBuyerStatus(id, { status });
      setBuyers(b => b.map(buyer => 
        buyer.id === id ? { ...buyer, status } : buyer
      ));
      toast.success('Buyer status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  const setBuyerDiscount = async (id, discount) => {
    try {
      await adminAPI.setBuyerDiscount(id, { discount_percentage: discount });
      setBuyers(b => b.map(buyer => 
        buyer.id === id ? { ...buyer, discount_percentage: discount } : buyer
      ));
      toast.success('Discount updated!');
    } catch { toast.error('Failed to update discount'); }
  };

  const updateQuoteStatus = async (id, status) => {
    try {
      await adminAPI.updateQuote(id, { status });
      setQuotes(q => q.map(quote => 
        quote.id === id ? { ...quote, status } : quote
      ));
      toast.success('Quote status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  const STATUS_COLOR = {
    pending: '#f59e0b',
    approved: '#059669',
    rejected: '#ef4444',
    suspended: '#6b7280',
    reviewed: '#3b82f6',
    quoted: '#8b5cf6',
    accepted: '#10b981',
    expired: '#f97316'
  };

  const BUSINESS_TYPES = ['retailer', 'wholesaler', 'manufacturer', 'designer', 'exporter', 'other'];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Wholesale Management</h1>
          <p>Manage wholesale buyers and quote requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: '20px' }}>
        {[
          ['buyers', '👥 Wholesale Buyers'],
          ['quotes', '📋 Quote Requests']
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.83rem',
              fontWeight: 500,
              color: tab === key ? '#1B4332' : '#6b7280',
              borderBottom: tab === key ? '2px solid #1B4332' : '2px solid transparent',
              marginBottom: '-2px'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          className="filter-input"
          placeholder="🔍 Search..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          style={{ flex: 1 }}
        />
        <select className="admin-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {tab === 'buyers' 
            ? ['pending', 'approved', 'rejected', 'suspended'].map(s => (
                <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
              ))
            : ['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'expired'].map(s => (
                <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
              ))
          }
        </select>
        <button className="btn-outline-sm" onClick={() => setFilters({ search: '', status: '', page: 1 })}>
          Clear
        </button>
      </div>

      {/* Content */}
      <div className="admin-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : tab === 'buyers' ? (
          <table className="admin-table" style={{ minWidth: '1000px' }}>
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Location</th>
                <th>Monthly Value</th>
                <th>Discount</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map(buyer => (
                <tr key={buyer.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{buyer.business_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>GST: {buyer.gst_number}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{buyer.user?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{buyer.user?.email}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{buyer.user?.phone}</div>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.78rem', 
                      padding: '3px 8px', 
                      borderRadius: '4px', 
                      background: '#f0fdf4', 
                      color: '#166534' 
                    }}>
                      {buyer.business_type}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>{buyer.city}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{buyer.state}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{buyer.expected_monthly_value?.toLocaleString()}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={buyer.discount_percentage || 0}
                      onChange={e => setBuyerDiscount(buyer.id, parseInt(e.target.value) || 0)}
                      style={{ 
                        width: '60px', 
                        padding: '4px', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                    />%
                  </td>
                  <td>
                    <span className="status-badge" style={{ 
                      background: (STATUS_COLOR[buyer.status] || '#6b7280') + '20', 
                      color: STATUS_COLOR[buyer.status] || '#6b7280' 
                    }}>
                      {buyer.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                    {new Date(buyer.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {buyer.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateBuyerStatus(buyer.id, 'approved')}
                            className="btn-primary-sm" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            onClick={() => updateBuyerStatus(buyer.id, 'rejected')}
                            className="btn-danger-sm" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}
                      {buyer.status === 'approved' && (
                        <button 
                          onClick={() => updateBuyerStatus(buyer.id, 'suspended')}
                          className="btn-outline-sm" 
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          ⏸ Suspend
                        </button>
                      )}
                      {buyer.status === 'suspended' && (
                        <button 
                          onClick={() => updateBuyerStatus(buyer.id, 'approved')}
                          className="btn-primary-sm" 
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          ✓ Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!buyers.length && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    No wholesale buyers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="admin-table" style={{ minWidth: '1100px' }}>
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Buyer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Valid Until</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote.id}>
                  <td><span className="order-num">{quote.quote_number}</span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{quote.buyer?.business_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{quote.buyer?.user?.name}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{quote.items?.length || 0} items</td>
                  <td style={{ fontWeight: 600 }}>₹{quote.total_amount?.toLocaleString()}</td>
                  <td>
                    <span className="status-badge" style={{ 
                      background: (STATUS_COLOR[quote.status] || '#6b7280') + '20', 
                      color: STATUS_COLOR[quote.status] || '#6b7280' 
                    }}>
                      {quote.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                    {new Date(quote.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                    {new Date(quote.valid_until).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {quote.status === 'pending' && (
                        <button 
                          onClick={() => updateQuoteStatus(quote.id, 'reviewed')}
                          className="btn-primary-sm" 
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          📋 Review
                        </button>
                      )}
                      {quote.status === 'reviewed' && (
                        <button 
                          onClick={() => updateQuoteStatus(quote.id, 'quoted')}
                          className="btn-primary-sm" 
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          💰 Quote
                        </button>
                      )}
                      {quote.status === 'quoted' && (
                        <button 
                          onClick={() => updateQuoteStatus(quote.id, 'expired')}
                          className="btn-outline-sm" 
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          ⏰ Expire
                        </button>
                      )}
                      <button 
                        className="btn-outline-sm" 
                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                      >
                        👁️ View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!quotes.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    No quote requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

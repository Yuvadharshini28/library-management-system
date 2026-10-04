import React, { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Search,
  BookOpen
} from 'lucide-react';
import { getTransactions, returnBook } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [returningId, setReturningId] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      const res = await getTransactions(params);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to load circulation records',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const handleReturn = async (tx) => {
    try {
      setReturningId(tx._id);
      const res = await returnBook(tx._id);
      setNotification({
        type: 'success',
        message: res.data.message || `Book "${tx.bookId?.title}" returned successfully!`,
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
      fetchTransactions();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to return book',
      });
    } finally {
      setReturningId(null);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const titleMatch = tx.bookId?.title?.toLowerCase().includes(term);
    const authorMatch = tx.bookId?.author?.toLowerCase().includes(term);
    const memberMatch = tx.memberId?.name?.toLowerCase().includes(term);
    const emailMatch = tx.memberId?.email?.toLowerCase().includes(term);
    return titleMatch || authorMatch || memberMatch || emailMatch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Circulation & Return Records</h1>
          <p className="page-subtitle">Track book borrowings, returns, and process book check-ins</p>
        </div>
      </div>

      {notification.message && (
        <div className={`alert-banner alert-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="card-container">
        <div className="table-header-bar">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search transactions by book or member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className={`btn btn-sm ${statusFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter('All')}
              >
                All Records
              </button>
              <button
                className={`btn btn-sm ${statusFilter === 'issued' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter('issued')}
              >
                Currently Issued
              </button>
              <button
                className={`btn btn-sm ${statusFilter === 'returned' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter('returned')}
              >
                Returned History
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            {filteredTransactions.length} transaction entries
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Book Details</th>
                <th>Member</th>
                <th>Issue Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Loading circulation history...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <ArrowRightLeft size={40} className="empty-icon" />
                    <div>No circulation records found.</div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIssued = tx.status === 'issued';
                  return (
                    <tr key={tx._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                          {tx.bookId?.title || 'Unknown Title'}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
                          By {tx.bookId?.author || 'Unknown'} &bull; ISBN: {tx.bookId?.isbn || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                          {tx.memberId?.name || 'Unknown Member'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {tx.memberId?.email || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} color="var(--slate-400)" />
                          {new Date(tx.issueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        {tx.returnDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)' }}>
                            <CheckCircle size={14} />
                            {new Date(tx.returnDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>Pending Return</span>
                        )}
                      </td>
                      <td>
                        {isIssued ? (
                          <span className="badge badge-warning">Issued</span>
                        ) : (
                          <span className="badge badge-success">Returned</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isIssued ? (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleReturn(tx)}
                            disabled={returningId === tx._id}
                          >
                            <RotateCcw size={14} />
                            {returningId === tx._id ? 'Returning...' : 'Mark as Returned'}
                          </button>
                        ) : (
                          <span className="badge badge-gray">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

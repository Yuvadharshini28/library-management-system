import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  ArrowUpRight,
  CheckCircle,
  PlusCircle,
  Layers,
  Clock,
  Sparkles
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDashboardStats, returnBook } from '../services/api';

const Dashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReturn = async (id, title) => {
    try {
      await returnBook(id);
      setActionSuccess(`"${title}" has been successfully marked as returned!`);
      setTimeout(() => setActionSuccess(''), 4000);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return book');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--slate-600)' }}>
          Loading library statistics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-banner alert-danger">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Library Overview Dashboard</h1>
          <p className="page-subtitle">Real-time statistics of books, registered members, and circulation activity</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setActiveTab('books')}>
            <BookOpen size={16} /> Manage Books
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('issue')}>
            <PlusCircle size={16} /> Issue a Book
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert-banner alert-success">
          <CheckCircle size={18} /> {actionSuccess}
        </div>
      )}

      {/* 4 Stat Cards as requested in Module 4.1 */}
      <div className="stats-grid">
        <StatCard
          title="Total Books"
          value={stats?.totalBooks || 0}
          description={`${stats?.totalCopies || 0} total copies in catalog (${stats?.totalAvailable || 0} available)`}
          icon={BookOpen}
          colorClass="stat-blue"
        />
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          description="Registered library patrons"
          icon={Users}
          colorClass="stat-purple"
        />
        <StatCard
          title="Issued Books"
          value={stats?.issuedBooks || 0}
          description="Books currently borrowed"
          icon={ArrowUpRight}
          colorClass="stat-amber"
        />
        <StatCard
          title="Returned Books"
          value={stats?.returnedBooks || 0}
          description="All-time completed returns"
          icon={CheckCircle}
          colorClass="stat-green"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Categories breakdown */}
        <div className="card-container" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--primary)" /> Book Categories
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {stats?.categoryStats?.map((cat) => (
              <div
                key={cat._id}
                style={{
                  background: 'var(--slate-100)',
                  border: '1px solid var(--slate-200)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                <span>{cat._id}</span>
                <span className="badge badge-primary">{cat.count} titles</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Guide Card */}
        <div className="card-container" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', borderColor: '#c7d2fe' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} /> Quick Library Actions
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
            Everything is set up and functional. You can add new book titles, register new readers, issue available copies, and record returns in seconds.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('members')}>
              View Members
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('transactions')}>
              Transaction History
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="card-container">
        <div className="table-header-bar">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--slate-500)" /> Recent Circulation Activities
          </h3>
          <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('transactions')}>
            View All Transactions &rarr;
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Member</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTransactions?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                stats?.recentTransactions?.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                        {tx.bookId?.title || 'Unknown Title'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        By {tx.bookId?.author || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tx.memberId?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{tx.memberId?.email}</div>
                    </td>
                    <td>{new Date(tx.issueDate).toLocaleDateString()}</td>
                    <td>
                      {tx.status === 'issued' ? (
                        <span className="badge badge-warning">Issued</span>
                      ) : (
                        <span className="badge badge-success">Returned</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {tx.status === 'issued' ? (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleReturn(tx._id, tx.bookId?.title)}
                        >
                          Mark Returned
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

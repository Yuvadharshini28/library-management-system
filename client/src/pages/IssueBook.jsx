import React, { useEffect, useState } from 'react';
import { getBooks, getMembers, issueBook } from '../services/api';
import { BookPlus, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const IssueBook = ({
  setActiveTab,
  preselectedBook,
  preselectedMember,
  clearPreselections,
}) => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [booksRes, membersRes] = await Promise.all([getBooks(), getMembers()]);
        if (booksRes.data.success) {
          setBooks(booksRes.data.data);
        }
        if (membersRes.data.success) {
          setMembers(membersRes.data.data);
        }

        if (preselectedBook) {
          setSelectedBookId(preselectedBook._id);
        }
        if (preselectedMember) {
          setSelectedMemberId(preselectedMember._id);
        }
      } catch (err) {
        setError('Failed to load books or members list');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();

    return () => {
      if (clearPreselections) clearPreselections();
    };
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedBookId) return setError('Please choose a book to issue');
    if (!selectedMemberId) return setError('Please choose a member');
    if (!issueDate) return setError('Please specify an issue date');

    try {
      setSubmitting(true);
      const res = await issueBook({
        bookId: selectedBookId,
        memberId: selectedMemberId,
        issueDate,
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Book issued successfully!');
        // Refresh available books
        const booksRes = await getBooks();
        if (booksRes.data.success) setBooks(booksRes.data.data);

        // Reset inputs
        setSelectedBookId('');
        setSelectedMemberId('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBookDetails = books.find((b) => b._id === selectedBookId);
  const selectedMemberDetails = members.find((m) => m._id === selectedMemberId);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Issue Book to Member</h1>
          <p className="page-subtitle">Assign an available library book copy to a registered member</p>
        </div>
      </div>

      <div className="form-card">
        {successMsg && (
          <div className="alert-banner alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <CheckCircle size={18} /> {successMsg}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setActiveTab('transactions')}
              >
                View in Circulation Log &rarr;
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--slate-500)' }}>
            Loading library records...
          </div>
        ) : (
          <form onSubmit={handleIssue}>
            {/* Choose Member */}
            <div className="form-group">
              <label className="form-label">Select Registered Member *</label>
              <select
                className="form-control"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
              >
                <option value="">-- Choose a Member --</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email}) - {member.activeLoans} active loans
                  </option>
                ))}
              </select>
            </div>

            {/* Choose Book */}
            <div className="form-group">
              <label className="form-label">Select Book to Issue *</label>
              <select
                className="form-control"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                required
              >
                <option value="">-- Choose an Available Book --</option>
                {books.map((book) => {
                  const isAvailable = book.availableQuantity > 0;
                  return (
                    <option
                      key={book._id}
                      value={book._id}
                      disabled={!isAvailable}
                    >
                      {book.title} by {book.author} —{' '}
                      {isAvailable
                        ? `[${book.availableQuantity} of ${book.quantity} copies in stock]`
                        : `[OUT OF STOCK]`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Issue Date */}
            <div className="form-group">
              <label className="form-label">Issue Date *</label>
              <input
                type="date"
                className="form-control"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            {/* Preview Box */}
            {(selectedBookDetails || selectedMemberDetails) && (
              <div
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                  Issue Summary Preview:
                </div>
                {selectedMemberDetails && (
                  <div>
                    <strong>Member:</strong> {selectedMemberDetails.name} ({selectedMemberDetails.phone})
                  </div>
                )}
                {selectedBookDetails && (
                  <div>
                    <strong>Book:</strong> {selectedBookDetails.title} (ISBN: {selectedBookDetails.isbn})
                    <br />
                    <strong>Available Copies:</strong> {selectedBookDetails.availableQuantity}
                  </div>
                )}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={submitting}
              >
                <BookPlus size={18} />
                {submitting ? 'Issuing Book...' : 'Confirm Book Issue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default IssueBook;

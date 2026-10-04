import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  BookPlus
} from 'lucide-react';
import { getBooks, deleteBook } from '../services/api';
import Modal from '../components/Modal';
import AddEditBook from './AddEditBook';

const BooksList = ({ setActiveTab, setSelectedBookForIssue }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await getBooks({
        search: searchTerm || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
      });
      if (res.data.success) {
        setBooks(res.data.data);
      }
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to fetch books',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, categoryFilter]);

  const handleOpenAdd = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleDelete = async (book) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${book.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteBook(book._id);
      setNotification({
        type: 'success',
        message: `Book "${book.title}" has been deleted.`,
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
      fetchBooks();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete book',
      });
    }
  };

  const handleSuccess = (msg) => {
    setIsModalOpen(false);
    setNotification({ type: 'success', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    fetchBooks();
  };

  const handleQuickIssue = (book) => {
    if (setSelectedBookForIssue) {
      setSelectedBookForIssue(book);
    }
    setActiveTab('issue');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Book Management</h1>
          <p className="page-subtitle">Add, edit, track stock, and organize library books</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New Book
        </button>
      </div>

      {notification.message && (
        <div className={`alert-banner alert-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="card-container">
        <div className="table-header-bar">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Literature">Literature</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Business & Economics">Business & Economics</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            {books.length} {books.length === 1 ? 'book' : 'books'} listed
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title & Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>Total Qty</th>
                <th>Available</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Loading book catalog...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <BookOpen size={40} className="empty-icon" />
                    <div>No books found matching your criteria.</div>
                  </td>
                </tr>
              ) : (
                books.map((book) => {
                  const isAvailable = book.availableQuantity > 0;
                  return (
                    <tr key={book._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                          {book.title}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
                          By {book.author}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-gray">{book.category}</span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.825rem', color: 'var(--slate-600)' }}>
                          {book.isbn}
                        </code>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--slate-800)' }}>{book.quantity}</strong>
                      </td>
                      <td>
                        {isAvailable ? (
                          <span className="badge badge-success">
                            {book.availableQuantity} in stock
                          </span>
                        ) : (
                          <span className="badge badge-danger">Out of stock</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {isAvailable && (
                            <button
                              className="btn btn-sm btn-secondary"
                              title="Issue this book"
                              onClick={() => handleQuickIssue(book)}
                            >
                              <BookPlus size={14} color="var(--primary)" /> Issue
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-secondary"
                            title="Edit book"
                            onClick={() => handleOpenEdit(book)}
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            title="Delete book"
                            onClick={() => handleDelete(book)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBook ? 'Edit Book Details' : 'Add New Book to Library'}
      >
        <AddEditBook
          book={selectedBook}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default BooksList;

import React, { useState, useEffect } from 'react';
import { createBook, updateBook } from '../services/api';
import { BookOpen, Check, X } from 'lucide-react';

const CATEGORIES = [
  'Computer Science',
  'Literature',
  'Science',
  'History',
  'Mathematics',
  'Philosophy',
  'Business & Economics',
  'Biography',
  'Art & Design',
  'Other'
];

const AddEditBook = ({ book, onSuccess, onCancel }) => {
  const isEditing = Boolean(book && book._id);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Computer Science',
    isbn: '',
    quantity: 1,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        category: book.category || 'Computer Science',
        isbn: book.isbn || '',
        quantity: book.quantity || 1,
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || '' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) return setError('Please enter a book title');
    if (!formData.author.trim()) return setError('Please enter an author name');
    if (!formData.isbn.trim()) return setError('Please enter an ISBN code');
    if (!formData.quantity || formData.quantity < 1) return setError('Quantity must be at least 1');

    try {
      setLoading(true);
      if (isEditing) {
        await updateBook(book._id, formData);
      } else {
        await createBook(formData);
      }
      onSuccess(isEditing ? 'Book updated successfully!' : 'Book added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save book record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert-banner alert-danger">{error}</div>}

      <div className="form-group">
        <label className="form-label">Book Title *</label>
        <input
          type="text"
          name="title"
          className="form-control"
          placeholder="e.g. Clean Code"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Author Name *</label>
        <input
          type="text"
          name="author"
          className="form-control"
          placeholder="e.g. Robert C. Martin"
          value={formData.author}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Total Quantity *</label>
          <input
            type="number"
            name="quantity"
            min="1"
            className="form-control"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">ISBN Number *</label>
        <input
          type="text"
          name="isbn"
          className="form-control"
          placeholder="e.g. 978-0132350884"
          value={formData.isbn}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Check size={16} />
          {loading ? 'Saving...' : isEditing ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  );
};

export default AddEditBook;

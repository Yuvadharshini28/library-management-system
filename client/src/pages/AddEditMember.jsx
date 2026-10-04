import React, { useState, useEffect } from 'react';
import { createMember, updateMember } from '../services/api';
import { Check } from 'lucide-react';

const AddEditMember = ({ member, onSuccess, onCancel }) => {
  const isEditing = Boolean(member && member._id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membershipDate: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        membershipDate: member.membershipDate
          ? new Date(member.membershipDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Please enter member name');
    if (!formData.email.trim()) return setError('Please enter a valid email address');
    if (!formData.phone.trim()) return setError('Please enter a phone number');

    try {
      setLoading(true);
      if (isEditing) {
        await updateMember(member._id, formData);
      } else {
        await createMember(formData);
      }
      onSuccess(isEditing ? 'Member updated successfully!' : 'Member registered successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save member record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert-banner alert-danger">{error}</div>}

      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input
          type="text"
          name="name"
          className="form-control"
          placeholder="e.g. Alice Johnson"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email Address *</label>
        <input
          type="email"
          name="email"
          className="form-control"
          placeholder="e.g. alice.johnson@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number *</label>
        <input
          type="tel"
          name="phone"
          className="form-control"
          placeholder="e.g. +1 (555) 234-5678"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Membership Date</label>
        <input
          type="date"
          name="membershipDate"
          className="form-control"
          value={formData.membershipDate}
          onChange={handleChange}
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
          {loading ? 'Saving...' : isEditing ? 'Update Member' : 'Register Member'}
        </button>
      </div>
    </form>
  );
};

export default AddEditMember;

import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  BookPlus,
  Mail,
  Phone
} from 'lucide-react';
import { getMembers, deleteMember } from '../services/api';
import Modal from '../components/Modal';
import AddEditMember from './AddEditMember';

const MembersList = ({ setActiveTab, setSelectedMemberForIssue }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await getMembers({
        search: searchTerm || undefined,
      });
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to fetch members',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleDelete = async (member) => {
    if (
      !window.confirm(
        `Are you sure you want to remove member "${member.name}"?`
      )
    ) {
      return;
    }

    try {
      await deleteMember(member._id);
      setNotification({
        type: 'success',
        message: `Member "${member.name}" removed successfully.`,
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
      fetchMembers();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete member',
      });
    }
  };

  const handleSuccess = (msg) => {
    setIsModalOpen(false);
    setNotification({ type: 'success', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    fetchMembers();
  };

  const handleQuickIssue = (member) => {
    if (setSelectedMemberForIssue) {
      setSelectedMemberForIssue(member);
    }
    setActiveTab('issue');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Member Management</h1>
          <p className="page-subtitle">Register and manage library members and track their active loans</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Register Member
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
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search members by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            {members.length} {members.length === 1 ? 'member' : 'members'} registered
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Contact Info</th>
                <th>Membership Date</th>
                <th>Active Borrowed Books</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Loading registered members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <Users size={40} className="empty-icon" />
                    <div>No members found matching your search.</div>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                        {member.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                        <Mail size={13} color="var(--slate-400)" /> {member.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        <Phone size={13} color="var(--slate-400)" /> {member.phone}
                      </div>
                    </td>
                    <td>
                      {new Date(member.membershipDate).toLocaleDateString()}
                    </td>
                    <td>
                      {member.activeLoans > 0 ? (
                        <span className="badge badge-warning">
                          {member.activeLoans} {member.activeLoans === 1 ? 'book' : 'books'} issued
                        </span>
                      ) : (
                        <span className="badge badge-gray">No active loans</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          title="Issue a book to this member"
                          onClick={() => handleQuickIssue(member)}
                        >
                          <BookPlus size={14} color="var(--primary)" /> Issue Book
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          title="Edit member"
                          onClick={() => handleOpenEdit(member)}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          title="Remove member"
                          onClick={() => handleDelete(member)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMember ? 'Edit Member Information' : 'Register New Library Member'}
      >
        <AddEditMember
          member={selectedMember}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default MembersList;

// src/components/admin/UserManagement.jsx - REAL API + 0 ESLint Errors
import React, { useState, useEffect, useCallback } from 'react';
import { UserX, UserCheck, Search, ShieldAlert } from 'lucide-react';
import api from "../../utils/api"

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');

  // Added Modal State for professional interaction
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null });

  // REAL API: Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
const response = await api.get('/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const usersData = await response.json();
      // Map backend data to match frontend expectations
      const formattedUsers = usersData.map(user => ({
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        phone: user.phone || 'N/A',
        created_at: user.created_at || user.createdAt
      }));
      setUsers(formattedUsers);
    } catch (err) {
      setError('Failed to load users');
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // REAL API: Toggle user status (suspend/activate)
  const handleToggleStatus = async () => {
    const { user } = confirmModal;
    if (!user) return;

    try {
      setActionLoading(prev => ({ ...prev, [user.id]: true }));
      
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
    
      
      // Close modal immediately for smooth UX
      setConfirmModal({ show: false, user: null });

      // FIXED: Changed URL to /api/admin/users/:id/status and method to PATCH to match your routes
  await api.patch(`/admin/users/${user.id}/status`, {
  status: newStatus
});

      

      // Update local state immediately
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ));
      
    } catch (err) {
      alert("Error updating user status");
      console.error("Status update error:", err);
    } finally {
      setActionLoading(prev => ({ ...prev, [user.id]: false }));
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: {
      background: 'white',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #f1f5f9',
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    countBadge: {
      background: '#dbeafe',
      color: '#3b82f6',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '700',
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: '#f8fafc',
      padding: '12px 20px',
      borderRadius: '12px',
      width: '350px',
      border: '2px solid transparent',
      transition: 'all 0.2s ease',
    },
    searchInput: {
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontSize: '14px',
      width: '100%',
      color: '#0f172a',
    },
    tableContainer: {
      overflowX: 'auto',
      borderRadius: '16px',
      border: '1px solid #f1f5f9',
      background: 'white',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1000px',
    },
    th: {
      padding: '20px 16px',
      textAlign: 'left',
      fontSize: '14px',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #f1f5f9',
    },
    td: {
      padding: '20px 16px',
      borderBottom: '1px solid #f8fafc',
      fontSize: '14px',
      color: '#0f172a',
    },
    roleBadge: (role) => ({
      background: role === 'admin' ? '#fef3c7' : 
                   role === 'seller' ? '#dbeafe' : '#f0fdf4',
      color: role === 'admin' ? '#92400e' : 
            role === 'seller' ? '#3b82f6' : '#166534',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
    }),
    statusBadge: (status) => ({
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      background: status === 'active' ? '#dcfce7' : '#fee2e2',
      color: status === 'active' ? '#166534' : '#991b1b',
    }),
    actionBtn: (status, loading) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '10px',
      border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      opacity: loading ? 0.7 : 1,
      background: status === 'active' ? '#ef4444' : '#10b981',
      color: 'white',
    }),
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      background: 'white',
      width: '95%',
      maxWidth: '400px',
      borderRadius: '28px',
      padding: '32px',
      textAlign: 'center',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      color: '#64748b',
      gap: '16px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 40px',
      color: '#64748b',
    },
    errorState: {
      textAlign: 'center',
      padding: '80px 40px',
      color: '#ef4444',
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Search size={48} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorState}>
        <UserX size={64} color="#ef4444" />
        <h3 style={{ color: '#0f172a', margin: '20px 0 8px 0', fontSize: '24px' }}>
          Error loading users
        </h3>
        <p>{error}</p>
        <button 
          onClick={fetchUsers}
          style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>
          <UserCheck size={32} />
          User Management
        </h3>
        <div style={styles.countBadge}>
          {filteredUsers.length} Users
        </div>
      </div>

      <div style={styles.searchBar}>
        <Search size={20} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div style={styles.emptyState}>
          <Search size={64} color="#94a3b8" />
          <h3 style={{ color: '#0f172a', margin: '20px 0 8px 0', fontSize: '24px' }}>
            No users found
          </h3>
          <p>Try adjusting your search terms.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '700' }}>{user.name}</div>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {user.phone}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.roleBadge(user.role)}>{user.role}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(user.status)}>{user.status}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => setConfirmModal({ show: true, user })}
                      disabled={actionLoading[user.id]}
                      style={styles.actionBtn(user.status, actionLoading[user.id])}
                    >
                      {actionLoading[user.id] ? '⏳' : 
                       user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                      {actionLoading[user.id] ? 'Processing...' : 
                       user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Professional Confirmation Modal */}
      {confirmModal.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ 
              background: confirmModal.user.status === 'active' ? '#fff1f2' : '#f0fdf4', 
              width: '64px', height: '64px', borderRadius: '22px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
            }}>
              <ShieldAlert size={32} color={confirmModal.user.status === 'active' ? '#e11d48' : '#10b981'} />
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Security Confirmation</h3>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '30px' }}>
              Are you sure you want to {confirmModal.user.status === 'active' ? 'Suspend' : 'Activate'} <b>{confirmModal.user.name}</b>?
            </p>
            <div style={{ display: 'flex', gap: '14px' }}>
              <button 
                onClick={() => setConfirmModal({ show: false, user: null })}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleToggleStatus}
                style={{ 
                  flex: 1, padding: '14px', borderRadius: '14px', border: 'none', 
                  background: confirmModal.user.status === 'active' ? '#e11d48' : '#10b981', 
                  color: 'white', fontWeight: '700', cursor: 'pointer' 
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
// src/components/admin/SellerApprovals.jsx - REAL API + 0 ESLint Errors
import React, { useState, useEffect } from 'react';
import api from "../../utils/api"
import { 
  CheckCircle, XCircle, Building2, FileCheck, Phone, Mail, Calendar, UserCheck, ShieldAlert, Loader2
} from 'lucide-react';

const SellerApprovals = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');

  // Brand Palette for Consistency
  const brand = {
    emerald: "#10b981",
    navy: "#0f172a",
    slate: "#64748b",
    bg: "#f1f5f9",
    blue: "#3b82f6",
    rose: "#e11d48",
    amber: "#f59e0b"
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  // REAL API: Fetch pending sellers
  const fetchPendingSellers = async () => {
  try {
    setLoading(true);
    setError('');

    const response = await api.get('/admin/sellers/pending');

    
    const sellers = response.data;

    const formattedSellers = sellers.map(seller => ({
      id: seller.id,
      name: seller.name,
      email: seller.email,
      phone: seller.phone || 'N/A',
      businessName: seller.business_name || 'No business name',
      licenseNumber: seller.business_license || 'N/A',
      created_at: seller.created_at
    }));

    setPendingSellers(formattedSellers);

  } catch (err) {
    console.error("REAL ERROR:", err.response || err);
    setError('Failed to load sellers');
  } finally {
    setLoading(false);
  }
};

  
  const handleAction = async (id, status) => {
  try {
    setActionLoading(prev => ({ ...prev, [id]: true }));

    
    await api.patch(`/admin/sellers/${id}/approve`, {
      status 
    });

    
    setPendingSellers(prev => prev.filter(seller => seller.id !== id));

    alert(`Seller ${status} successfully!`);

    await fetchPendingSellers();

  } catch (err) {
    alert("Failed to update seller status");
    console.error("Action error:", err);
  } finally {
    setActionLoading(prev => ({ ...prev, [id]: false }));
  }
};

  const styles = {
    wrapper: {
      backgroundColor: brand.bg,
      padding: '40px',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    container: {
      maxWidth: '1100px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: '30px',
    },
    titleGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: brand.navy,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    countBadge: {
      backgroundColor: 'white',
      padding: '10px 20px',
      borderRadius: '14px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      fontSize: '14px',
      fontWeight: '700',
      color: brand.navy
    },
    tableCard: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
    },
    th: {
      padding: '20px',
      fontSize: '12px',
      color: brand.slate,
      fontWeight: '700',
      textTransform: 'uppercase',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
    },
    td: {
      padding: '20px',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px',
    },
    businessIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: brand.blue,
    },
    actionBtn: (loading, type) => ({
      padding: '8px 16px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '700',
      fontSize: '13px',
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
      ...(type === 'approve' 
        ? { background: brand.emerald, color: 'white' }
        : { background: '#f1f5f9', color: brand.rose, border: `1px solid #fee2e2` }
      ),
    }),
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      color: brand.slate,
      gap: '16px',
    }
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loadingContainer}>
          <Loader2 size={48} color={brand.blue} className="animate-spin" />
          <span style={{ fontWeight: '600' }}>Verifying seller applications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.tableCard, padding: '60px', textAlign: 'center' }}>
          <ShieldAlert size={64} color={brand.rose} style={{ margin: '0 auto 20px' }} />
          <h3 style={{ color: brand.navy, fontSize: '24px', fontWeight: '800' }}>System Error</h3>
          <p style={{ color: brand.slate, marginBottom: '24px' }}>{error}</p>
          <button onClick={fetchPendingSellers} style={styles.actionBtn(false, 'approve')}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        
        {/* HEADER SECTION */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: brand.amber, padding: '8px', borderRadius: '12px' }}>
                <UserCheck color="white" size={24} />
              </div>
              <h2 style={styles.title}>Seller Approvals</h2>
            </div>
            <p style={{ color: brand.slate, margin: 0, fontSize: '15px' }}>
              Review and authorize new merchant accounts for the platform.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={styles.countBadge}>
              {pendingSellers.length} Requests Pending
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={styles.tableCard}>
          {pendingSellers.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
              <CheckCircle size={64} color={brand.emerald} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <h3 style={{ color: brand.navy, fontWeight: '800', fontSize: '22px' }}>Inbox Cleared</h3>
              <p style={{ color: brand.slate }}>All seller applications have been processed.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Merchant</th>
                  <th style={styles.th}>Contact Details</th>
                  <th style={styles.th}>Business License</th>
                  <th style={styles.th}>Submission Date</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {pendingSellers.map(seller => (
                  <tr key={seller.id}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.businessIcon}>
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: brand.navy }}>{seller.businessName}</div>
                          <div style={{ fontSize: '12px', color: brand.slate }}>{seller.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: brand.navy }}>
                          <Mail size={14} color={brand.slate} /> {seller.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: brand.slate }}>
                          <Phone size={14} /> {seller.phone}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 10px', 
                        background: '#f8fafc', 
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontWeight: '600'
                      }}>
                        <FileCheck size={14} color={brand.blue} />
                        {seller.licenseNumber}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: brand.slate }}>
                        <Calendar size={14} />
                        {new Date(seller.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleAction(seller.id, 'approved')}
                          disabled={actionLoading[seller.id]}
                          style={styles.actionBtn(actionLoading[seller.id], 'approve')}
                        >
                          {actionLoading[seller.id] ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(seller.id, 'rejected')}
                          disabled={actionLoading[seller.id]}
                          style={styles.actionBtn(actionLoading[seller.id], 'reject')}
                        >
                          {actionLoading[seller.id] ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerApprovals;
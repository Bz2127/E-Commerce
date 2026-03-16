import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Package, ShoppingBag, BarChart3, 
  RefreshCw, TrendingUp, AlertTriangle, X, ArrowRight,
  Clock, ShieldAlert
} from 'lucide-react';
import api from '../../utils/api';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalSellers: 0, totalProducts: 0, totalOrders: 0,
    totalRevenue: 0, pendingSellers: 0, pendingOrders: 0, lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the Pop-up Modal
  const [selectedDetail, setSelectedDetail] = useState(null);

  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (token) {
      fetchStats();
    } else {
      setError('Please login first');
      setLoading(false);
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(''); 
      
      const currentToken = localStorage.getItem('token');
      console.log('🔥 TOKEN:', currentToken ? 'EXISTS' : 'MISSING');
      
      if (!currentToken) {
        throw new Error('No token found');
      }

      console.log('🔥 FETCHING STATS...');
      const response = await api.get('/admin/dashboard');

      console.log('✅ FULL STATS DATA:', response.data);
      
      setStats({
        totalUsers: response.data.totalUsers || 0,
        totalSellers: response.data.totalSellers || 0,
        totalProducts: response.data.totalProducts || 0,
        totalOrders: response.data.totalOrders || 0,
        totalRevenue: response.data.totalRevenue || 0,
        pendingSellers: response.data.pendingSellers || 0,
        pendingOrders: response.data.pendingOrders || 0,
        lowStock: response.data.lowStock || 0
      });
      
      console.log('✅ STATS STATE UPDATED!');
      
    } catch (err) {
      console.error('❌ FULL ERROR:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401) {
        setError('🔐 Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('🚫 Admin access required');
      } else {
        setError('⚠️ Failed to load stats. Backend may be down.');
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '10px',
      background: 'transparent',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#1e293b',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      background: 'white',
      color: '#10b981', // Brand Green
      border: '1px solid #10b981',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: '0.2s',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '30px',
    },
    statCard: (color) => ({
      padding: '24px',
      background: 'white',
      borderRadius: '20px',
      border: '1px solid #f1f5f9',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
    }),
    iconWrapper: (color) => ({
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `${color}15`,
      color: color,
      marginBottom: '16px',
    }),
    statLabel: { fontSize: '14px', color: '#64748b', fontWeight: '600', marginBottom: '4px' },
    statValue: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
    trendBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      fontWeight: '700',
      color: '#10b981', // Brand Green
      marginTop: '8px',
    },
    actionSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '20px',
    },
    actionCard: (isWarning) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px',
      background: isWarning ? '#fff7ed' : 'white',
      borderRadius: '20px',
      border: `1px solid ${isWarning ? '#f59e0b' : '#e2e8f0'}`,
      cursor: 'pointer',
      transition: '0.3s',
    }),
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)', // Dark Slate Overlay
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    },
    modalContent: {
      background: 'white',
      width: '90%',
      maxWidth: '450px',
      borderRadius: '28px',
      padding: '32px',
      position: 'relative',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      textAlign: 'center'
    },
    actionBtn: (color) => ({
      width: '100%',
      padding: '14px',
      background: color || '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '20px',
      fontSize: '15px'
    })
  };

  const StatCard = ({ icon: Icon, label, value, color, detailType }) => (
    <div 
      style={styles.statCard(color)}
      onClick={() => setSelectedDetail({ label, value, type: detailType, color })}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = '#10b981';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#f1f5f9';
      }}
    >
      <div style={styles.iconWrapper(color)}>
        <Icon size={24} />
      </div>
      <p style={styles.statLabel}>{label}</p>
      <h3 style={styles.statValue}>
        {typeof value === 'number' ? value.toLocaleString() : '0'}
      </h3>
      <div style={styles.trendBox}>
        <TrendingUp size={14} /> Tracking Live
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <RefreshCw size={40} color="#10b981" style={{ animation: 'spin 2s linear infinite' }} />
      <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '600' }}>Synchronizing Data...</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px', background: '#fef2f2', borderRadius: '24px', border: '1px solid #fee2e2' }}>
      <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
      <h3 style={{ color: '#991b1b', margin: '0 0 8px 0' }}>Data Sync Error</h3>
      <p style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</p>
      <button style={styles.refreshBtn} onClick={fetchStats}>Try Again</button>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>EthMarket Dashboard</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Real-time Marketplace Performance</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchStats}>
          <RefreshCw size={16} /> Update Data
        </button>
      </div>

      <div style={styles.statsGrid}>
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#3b82f6" detailType="users" />
        <StatCard icon={UserCheck} label="Active Sellers" value={stats.totalSellers} color="#10b981" detailType="sellers" />
        <StatCard icon={Package} label="Inventory" value={stats.totalProducts} color="#8b5cf6" detailType="products" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="#f59e0b" detailType="orders" />
      </div>

      <div style={styles.actionSection}>
        <div style={styles.actionCard(false)} onClick={() => setSelectedDetail({ label: 'Pending Sellers', value: stats.pendingSellers, color: '#3b82f6', action: 'Verify Now' })}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...styles.iconWrapper('#3b82f6'), marginBottom: 0 }}><Clock size={24} /></div>
            <div>
              <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>{stats.pendingSellers} Pending</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Awaiting Approval</p>
            </div>
          </div>
          <ArrowRight size={20} color="#94a3b8" />
        </div>

        <div style={styles.actionCard(true)} onClick={() => setSelectedDetail({ label: 'Stock Alerts', value: stats.lowStock, color: '#f59e0b', action: 'Restock Now' })}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...styles.iconWrapper('#f59e0b'), marginBottom: 0 }}><AlertTriangle size={24} /></div>
            <div>
              <h4 style={{ margin: 0, fontSize: '18px', color: '#92400e' }}>{stats.lowStock} Low Stock</h4>
              <p style={{ margin: 0, color: '#b45309', fontSize: '14px' }}>Needs Attention</p>
            </div>
          </div>
          <ArrowRight size={20} color="#f59e0b" />
        </div>
      </div>

      {/* POP-UP MODAL */}
      {selectedDetail && (
        <div style={styles.modalOverlay} onClick={() => setSelectedDetail(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedDetail(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ margin: '0 auto 20px', background: `${selectedDetail.color}15`, color: selectedDetail.color, width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={36} />
            </div>
            
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              {selectedDetail.label}
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '25px' }}>
              You have <b>{selectedDetail.value}</b> {selectedDetail.label.toLowerCase()} recorded in the system for this period.
            </p>

            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Current Total</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{selectedDetail.value}</span>
              </div>
            </div>

            <button 
              style={styles.actionBtn(selectedDetail.color)}
              onClick={() => setSelectedDetail(null)}
            >
              {selectedDetail.action || 'View All Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
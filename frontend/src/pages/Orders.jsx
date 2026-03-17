import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// ✅ FIXED: Using your custom api utility
import api from '../utils/api';
import { ShoppingBag, Package, Clock, Truck, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const statusConfig = {
    pending: { label: 'Pending', color: '#f59e0b', icon: Clock },
    confirmed: { label: 'Confirmed', color: '#10b981', icon: CheckCircle },
    processing: { label: 'Processing', color: '#3b82f6', icon: Package },
    shipped: { label: 'Shipped', color: '#8b5cf6', icon: Truck },
    delivered: { label: 'Delivered', color: '#10b981', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: '#ef4444', icon: XCircle },
    returned: { label: 'Returned', color: '#f97316', icon: RefreshCw }
  };

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError('Please login to view orders');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/orders/my-orders?page=${page}&limit=10`);
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleReturnRequest = async (orderId) => {
    if (!token) return;
    
    try {
      await api.post(`/orders/${orderId}/return`, {});
      fetchOrders();
      alert('Return request submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request return');
    }
  };

  if (loading) {
    return (
      <div style={container}>
        <div style={loadingContainer}>
          <div style={loadingSpinner}></div>
          <p style={{fontWeight: '700', color: '#10b981'}}>Loading your <span style={{color: '#0f172a'}}>Eth</span>market orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={header}>
        <h1 style={title}>My <span style={{color: '#10b981'}}>Eth</span>market Orders</h1>
        <p style={subtitle}>Track and manage your recent purchases</p>
      </div>

      {error && (
        <div style={errorContainer}>
          <p style={{fontWeight: '600'}}>{error}</p>
          {!token && <Link to="/login" style={loginBtn}>Login to view orders</Link>}
          {token && <button onClick={fetchOrders} style={retryBtn}>Retry</button>}
        </div>
      )}

      {orders.length === 0 && !loading && !error ? (
        <div style={emptyState}>
          <div style={iconCircle}>
            <ShoppingBag size={40} color="#10b981" />
          </div>
          <h2 style={emptyTitle}>No orders yet</h2>
          <p style={emptyText}>Looks like you haven't placed any orders. Start exploring our shop!</p>
          <Link to="/shop" style={shopBtn}>
            Go to Shop →
          </Link>
        </div>
      ) : (
        <>
          <div style={ordersHeader}>
            <span style={{fontWeight: '700'}}>Total Orders: {orders.length}</span>
            <div style={pagination}>
              <button 
                onClick={() => setPage(p => Math.max(1, p-1))} 
                disabled={page === 1}
                style={{...paginationBtn, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer'}}
              >
                Previous
              </button>
              <span style={pageInfo}>Page {page}</span>
              <button 
                onClick={() => setPage(p => p+1)} 
                style={paginationBtn}
                disabled={orders.length < 10}
              >
                Next
              </button>
            </div>
          </div>

          <div style={ordersList}>
            {orders.map(order => {
              const status = order.status?.toLowerCase() || 'pending';
              const config = statusConfig[status] || statusConfig.pending;
              const StatusIcon = config.icon;
              
              return (
                <div key={order.id} style={orderCard}>
                  <div style={orderHeader}>
                    <div style={orderNumber}>
                      <strong style={{fontSize: '18px'}}>Order #{order.id}</strong>
                      <span style={orderDate}>
                        {new Date(order.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div style={statusContainer}>
                      <StatusIcon size={20} color={config.color} />
                      <span style={{...statusBadge, color: config.color, backgroundColor: config.color + '15' }}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <div style={orderItemsPreview}>
                    <span style={{fontWeight: '600', color: '#64748b'}}>{order.total_items || 0} items purchased</span>
                    <span style={totalAmount}>{parseFloat(order.total_amount || 0).toLocaleString()} ETB</span>
                  </div>

                  <div style={orderActions}>
                    <Link 
                      to={`/orders/${order.id}`} 
                      style={viewDetailsBtn}
                    >
                      View Order Details
                    </Link>
                    {status === 'delivered' && (
                      <button 
                        onClick={() => handleReturnRequest(order.id)}
                        style={returnBtn}
                      >
                        Request Return
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// --- STYLES ---
const container = { padding: '60px 10%', minHeight: '80vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" };
const header = { marginBottom: '40px' };
const title = { fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' };
const subtitle = { color: '#64748b', marginTop: '8px', fontSize: '16px' };
const emptyState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center', border: '1px solid #f1f5f9' };
const iconCircle = { background: '#f0fdf4', padding: '30px', borderRadius: '50%', marginBottom: '20px' };
const emptyTitle = { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 10px 0' };
const emptyText = { color: '#64748b', maxWidth: '350px', marginBottom: '30px', lineHeight: '1.6' };
const shopBtn = { background: '#10b981', color: 'white', padding: '16px 35px', borderRadius: '14px', textDecoration: 'none', fontWeight: '800', boxShadow: '0 10px 15px rgba(16, 185, 129, 0.2)' };
const ordersList = { display: 'flex', flexDirection: 'column', gap: '25px' };
const ordersHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '20px 30px', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' };
const pagination = { display: 'flex', gap: '12px', alignItems: 'center' };
const paginationBtn = { padding: '10px 18px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };
const pageInfo = { fontWeight: '700', color: '#0f172a', minWidth: '80px', textAlign: 'center' };
const orderCard = { background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' };
const orderHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' };
const orderNumber = { display: 'flex', flexDirection: 'column', gap: '4px' };
const orderDate = { fontSize: '14px', color: '#94a3b8', fontWeight: '500' };
const statusContainer = { display: 'flex', alignItems: 'center', gap: '8px' };
const statusBadge = { fontSize: '13px', fontWeight: '800', padding: '6px 14px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const orderItemsPreview = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' };
const totalAmount = { fontSize: '22px', fontWeight: '800', color: '#10b981' };
const orderActions = { display: 'flex', gap: '15px', flexWrap: 'wrap' };
const viewDetailsBtn = { padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', background: '#0f172a', color: 'white', fontWeight: '700', fontSize: '14px', transition: '0.2s' };
const returnBtn = { padding: '14px 28px', borderRadius: '12px', background: '#f97316', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px' };
const loadingContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' };
const loadingSpinner = { width: '45px', height: '45px', border: '5px solid #f3f4f6', borderTop: '5px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' };
const errorContainer = { textAlign: 'center', padding: '30px', background: '#fff1f2', borderRadius: '16px', border: '1px solid #fecaca', marginBottom: '20px' };
const retryBtn = { background: '#ef4444', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', marginTop: '15px' };
const loginBtn = { background: '#3b82f6', color: 'white', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', marginTop: '15px', textDecoration: 'none', display: 'inline-block' };

export default Orders;
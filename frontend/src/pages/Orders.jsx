import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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

  // ✅ FIXED: useCallback eliminates ESLint warning
  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError('Please login to view orders');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/orders/my-orders?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  // ✅ Now useEffect has correct dependencies
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleReturnRequest = async (orderId) => {
    if (!token) return;
    
    try {
      await axios.post(`http://localhost:5000/api/orders/${orderId}/return`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      alert('Return request submitted successfully!');
    } catch (err) {
      alert('Failed to request return');
    }
  };

  if (loading) {
    return (
      <div style={container}>
        <div style={loadingContainer}>
          <div style={loadingSpinner}></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={header}>
        <h1 style={title}>My Orders</h1>
        <p style={subtitle}>Track and manage your recent purchases</p>
      </div>

      {error && (
        <div style={errorContainer}>
          <p>{error}</p>
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
            <span>Total Orders: {orders.length}</span>
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
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              return (
                <div key={order.id} style={orderCard}>
                  <div style={orderHeader}>
                    <div style={orderNumber}>
                      <strong>Order #{order.id}</strong>
                      <span style={orderDate}>
                        {new Date(order.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div style={statusContainer}>
                      <StatusIcon size={20} color={statusConfig[order.status]?.color} />
                      <span style={{...statusBadge, color: statusConfig[order.status]?.color, backgroundColor: statusConfig[order.status]?.color + '10' }}>
                        {statusConfig[order.status]?.label || order.status}
                      </span>
                    </div>
                  </div>

                  <div style={orderItemsPreview}>
                    <span>{order.total_items || 0} items</span>
                    <span style={totalAmount}>ETB {parseFloat(order.total_amount || 0).toLocaleString()}</span>
                  </div>

                  <div style={orderActions}>
                    <Link 
                      to={`/orders/${order.id}`} 
                      style={viewDetailsBtn}
                    >
                      View Details
                    </Link>
                    {order.status === 'delivered' && (
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

// ALL STYLES (unchanged from previous)
const container = { padding: '60px 10%', minHeight: '80vh', background: '#f8fafc' };
const header = { marginBottom: '40px' };
const title = { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 };
const subtitle = { color: '#64748b', marginTop: '8px' };
const emptyState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', textAlign: 'center' };
const iconCircle = { background: '#ecfdf5', padding: '30px', borderRadius: '50%', marginBottom: '20px' };
const emptyTitle = { fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: '0 0 10px 0' };
const emptyText = { color: '#64748b', maxWidth: '300px', marginBottom: '30px', lineHeight: '1.6' };
const shopBtn = { background: '#10b981', color: 'white', padding: '14px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' };
const ordersList = { display: 'flex', flexDirection: 'column', gap: '20px' };
const ordersHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const pagination = { display: 'flex', gap: '10px', alignItems: 'center' };
const paginationBtn = { padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '14px' };
const pageInfo = { fontWeight: '500', color: '#475569', minWidth: '80px', textAlign: 'center' };
const orderCard = { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' };
const orderHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' };
const orderNumber = { display: 'flex', flexDirection: 'column', gap: '4px' };
const orderDate = { fontSize: '14px', color: '#64748b' };
const statusContainer = { display: 'flex', alignItems: 'center', gap: '8px' };
const statusBadge = { fontSize: '14px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', background: '#f8fafc' };
const orderItemsPreview = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' };
const totalAmount = { fontSize: '20px', fontWeight: '800', color: '#1e293b' };
const orderActions = { display: 'flex', gap: '12px', flexWrap: 'wrap' };
const viewDetailsBtn = { padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', background: '#3b82f6', color: 'white', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' };
const returnBtn = { padding: '12px 24px', borderRadius: '12px', background: '#f97316', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)' };
const loadingContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', padding: '40px' };
const loadingSpinner = { width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' };
const errorContainer = { textAlign: 'center', padding: '40px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '20px' };
const retryBtn = { background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '12px' };
const loginBtn = { background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '12px', textDecoration: 'none', display: 'inline-block' };

export default Orders;

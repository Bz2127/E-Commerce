import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle, Printer, ShoppingBag, ShieldCheck, AlertCircle } from 'lucide-react';

import api from '../utils/api';

const OrderSuccess = () => {
  const { setCart } = useCart();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const trx_ref = searchParams.get('trx_ref') || searchParams.get('tx_ref');

  useEffect(() => {
    // 1. Clear the cart immediately on success page entry
    localStorage.removeItem('cart');
    if (setCart) {
      setCart([]);
    }

    const fetchReceipt = async () => {
      if (!trx_ref) {
        setLoading(false);
        setError("No transaction reference found.");
        return;
      }

      try {
        setLoading(true);
        
        const res = await api.get(`/orders/receipt/${trx_ref}`);
        
        if (res.data && res.data.order) {
          setOrderDetails(res.data);
        } else {
          setError("Order data not found.");
        }
      } catch (err) {
        console.error("Receipt fetch error:", err);
        setError(err.response?.data?.error || "Payment verification failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [setCart, trx_ref]);

  if (loading) return (
    <div style={loadingOverlay}>
      <div className="loader"></div>
      <h3 style={{ color: '#0f172a', fontWeight: '800', marginTop: '20px' }}>
        <span style={{color: '#10b981'}}>Eth</span>market: Verifying Payment...
      </h3>
      <style>{`.loader { border: 5px solid #f1f5f9; border-top: 5px solid #10b981; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div className="no-print" style={{ textAlign: 'center' }}>
        <CheckCircle size={80} color="#10b981" style={{ marginBottom: '20px' }} />
        <h1 style={titleStyle}>Payment Success!</h1>
        <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '40px' }}>Your order has been confirmed.</p>
      </div>

      {orderDetails && orderDetails.order ? (
        <div id="receipt-print" style={receiptBox}>
          <div style={receiptHeader}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={logoPlaceholder}>E</div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '0.05em', color: 'white' }}>ETHMARKET</h2>
             </div>
             <p style={receiptSubtitle}>Official Transaction Receipt</p>
          </div>

          <div style={receiptBody}>
            <div style={receiptGrid}>
              <div style={receiptColumn}>
                <span style={labelStyle}>SHIPPING TO</span>
                <p style={valStyle}>{orderDetails.order.phone_number}</p>
                <p style={subValStyle}>
                  {typeof orderDetails.order.shipping_address === 'object' && orderDetails.order.shipping_address !== null
                    ? orderDetails.order.shipping_address.address 
                    : orderDetails.order.shipping_address}
                </p>
              </div>
              <div style={{ ...receiptColumn, textAlign: 'right' }}>
                <span style={labelStyle}>ORDER DETAILS</span>
                <p style={valStyle}>
                  {new Date(orderDetails.order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
                <p style={subValRef}>REF: {trx_ref.substring(0, 15)}...</p>
              </div>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ITEM DESCRIPTION</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>QTY</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items && orderDetails.items.map((item, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{item.product_name}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700' }}>
                      {(item.price_at_purchase * item.quantity).toLocaleString()} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={totalSection}>
              <span style={totalLabel}>TOTAL PAID</span>
              <span style={totalAmount}>
                {parseFloat(orderDetails.order.total_amount).toLocaleString()} ETB
              </span>
            </div>

            <div style={chapaBadge}>
                <ShieldCheck size={18} color="#10b981" />
                <span>Verified Payment Securely Processed via <strong>Chapa</strong></span>
            </div>
          </div>
        </div>
      ) : (
        <div style={errorCard}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#991b1b', margin: '0 0 8px 0' }}>Data Verification Error</h3>
          <p style={{ color: '#b91c1c', fontSize: '14px', margin: '0 0 20px 0' }}>{error || "Receipt data could not be retrieved."}</p>
          <Link to="/" style={errorLink}>Return to Marketplace</Link>
        </div>
      )}

      <div style={actionRow} className="no-print">
        <Link to="/" style={btnOutline}>
          <ShoppingBag size={20} /> Continue Shopping
        </Link>
        {orderDetails && (
          <button onClick={() => window.print()} style={btnSuccess}>
            <Printer size={20} /> Print Receipt
          </button>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          #receipt-print, #receipt-print * { visibility: visible; }
          #receipt-print { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", sans-serif' };
const loadingOverlay = { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const titleStyle = { fontSize: '42px', fontWeight: '900', marginBottom: '8px', color: '#0f172a', letterSpacing: '-2px' };
const receiptBox = { width: '100%', maxWidth: '580px', background: 'white', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e2e8f0' };
const receiptHeader = { padding: '50px 20px', background: '#0f172a', textAlign: 'center' };
const receiptSubtitle = { color: '#94a3b8', fontSize: '12px', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 };
const logoPlaceholder = { width: '45px', height: '45px', background: '#10b981', borderRadius: '14px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '24px' };
const receiptBody = { padding: '45px' };
const receiptGrid = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', paddingBottom: '25px', borderBottom: '1px solid #f1f5f9' };
const receiptColumn = { flex: 1 };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' };
const valStyle = { margin: '0', fontSize: '16px', fontWeight: '700', color: '#1e293b' };
const subValStyle = { margin: '6px 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.6' };
const subValRef = { margin: '6px 0 0', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thStyle = { padding: '12px 0', textAlign: 'left', fontSize: '11px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', fontWeight: '800', textTransform: 'uppercase' };
const tdStyle = { padding: '20px 0', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f8fafc' };
const totalSection = { marginTop: '20px', padding: '30px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #e2e8f0' };
const totalLabel = { color: '#64748b', fontSize: '16px', fontWeight: '700' };
const totalAmount = { color: '#10b981', fontWeight: '900', fontSize: '32px', letterSpacing: '-1px' };
const chapaBadge = { marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: '#f0fdf4', borderRadius: '16px', fontSize: '13px', color: '#166534', fontWeight: '600', border: '1px solid #dcfce7' };
const actionRow = { display: 'flex', gap: '20px', marginTop: '40px' };
const errorCard = { textAlign: 'center', background: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '24px', padding: '50px', maxWidth: '500px' };
const errorLink = { color: '#ef4444', fontWeight: '800', textDecoration: 'none', fontSize: '15px', borderBottom: '2px solid #ef4444' };
const btnSuccess = { display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 35px', background: '#10b981', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' };
const btnOutline = { display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 35px', border: '2px solid #e2e8f0', background: 'white', color: '#475569', textDecoration: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '800' };

export default OrderSuccess;
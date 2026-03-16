import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle, Printer, ShoppingBag, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

const OrderSuccess = () => {
  const { setCart } = useCart();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const trx_ref = searchParams.get('trx_ref') || searchParams.get('tx_ref');

  useEffect(() => {
    localStorage.removeItem('cart');
    if (setCart) {
      setCart([]);
    }

   const fetchReceipt = async () => {
  const token = localStorage.getItem('token'); // Get the token
  
  if (!trx_ref) {
    setLoading(false);
    setError("No transaction reference found.");
    return;
  }

  try {
    const res = await axios.get(`http://localhost:5000/api/orders/receipt/${trx_ref}`, {
      headers: { Authorization: `Bearer ${token}` } // Add this header
    });
    
    if (res.data && res.data.order) {
      setOrderDetails(res.data);
    } else {
      setError("Order data not found.");
    }
  } catch (err) {
    console.error("Receipt fetch error:", err);
    setError("Verification failed.");
  } finally {
    setLoading(false);
  }
};

    fetchReceipt();
  }, [setCart, trx_ref]);

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <div className="loader"></div>
      <h3 style={{ color: '#0f172a', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>EthMarket: Verifying Payment...</h3>
      <style>{`.loader { border: 4px solid #f1f5f9; border-top: 4px solid #10b981; border-radius: 50%; width: 45px; height: 45px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div className="no-print" style={{ textAlign: 'center' }}>
        <CheckCircle size={80} color="#10b981" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px', color: '#0f172a', letterSpacing: '-0.02em' }}>Success!</h1>
        <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '40px' }}>Thank you for choosing EthMarket</p>
      </div>

      {/* --- PREMIUM RECEIPT BOX --- */}
      {orderDetails && orderDetails.order ? (
        <div id="receipt-print" style={receiptBox}>
          <div style={receiptHeader}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={logoPlaceholder}>E</div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '0.05em', color: 'white' }}>ETHMARKET</h2>
             </div>
             <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Transaction Confirmation</p>
          </div>

          <div style={receiptBody}>
            <div style={receiptGrid}>
              <div style={receiptColumn}>
                <span style={labelStyle}>SHIP TO</span>
                <p style={valStyle}>{orderDetails.order.phone_number}</p>
                <p style={subValStyle}>
  {typeof orderDetails.order.shipping_address === 'object' && orderDetails.order.shipping_address !== null
    ? orderDetails.order.shipping_address.address 
    : orderDetails.order.shipping_address}
</p>
              </div>
              <div style={{ ...receiptColumn, textAlign: 'right' }}>
                <span style={labelStyle}>ORDER INFO</span>
                <p style={valStyle}>{new Date(orderDetails.order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                <p style={subValStyle}>REF: {trx_ref}</p>
              </div>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ITEM</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>QTY</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>PRICE</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items && orderDetails.items.map((item, i) => (
                  <tr key={i}>
                   <td style={tdStyle}>{item.product_name}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700' }}>{parseFloat(item.price_at_purchase * item.quantity).toLocaleString()} ETB</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={totalSection}>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>Total Paid</span>
              <span style={{ color: '#0f172a' }}>{parseFloat(orderDetails.order.total_amount).toLocaleString()} ETB</span>
            </div>

            <div style={chapaBadge}>
                <ShieldCheck size={16} color="#10b981" />
                <span>Verified Secure Payment by <strong>Chapa</strong></span>
            </div>
          </div>
        </div>
      ) : (
        <div style={errorCard}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#991b1b', margin: '0 0 8px 0' }}>Data Missing</h3>
          <p style={{ color: '#b91c1c', fontSize: '14px', margin: '0 0 20px 0' }}>{error || "We couldn't load your receipt details."}</p>
          <Link to="/" style={errorLink}>Return to Marketplace</Link>
        </div>
      )}

      {/* --- ACTION ROW --- */}
      <div style={actionRow} className="no-print">
        <Link to="/" style={btnOutline}>
          <ShoppingBag size={20} /> Shop More
        </Link>
        {orderDetails && (
          <button onClick={() => window.print()} style={btnSuccess}>
            <Printer size={20} /> Download Receipt
          </button>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          #receipt-print, #receipt-print * { visibility: visible; }
          #receipt-print { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// --- UPDATED BRANDED STYLES ---
const containerStyle = { padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", "system-ui", sans-serif' };
const receiptBox = { width: '100%', maxWidth: '520px', background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', overflow: 'hidden', border: '1px solid #e2e8f0' };
const receiptHeader = { padding: '45px 20px', background: '#0f172a', textAlign: 'center' };
const logoPlaceholder = { width: '42px', height: '42px', background: '#10b981', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '24px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' };
const receiptBody = { padding: '40px' };
const receiptGrid = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', paddingBottom: '25px', borderBottom: '1px solid #f1f5f9' };
const receiptColumn = { flex: 1 };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' };
const valStyle = { margin: '0', fontSize: '15px', fontWeight: '700', color: '#1e293b' };
const subValStyle = { margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '400', lineHeight: '1.5' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const thStyle = { padding: '12px 0', textAlign: 'left', fontSize: '12px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', fontWeight: '700' };
const tdStyle = { padding: '18px 0', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f8fafc' };
const totalSection = { marginTop: '25px', padding: '30px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '900', fontSize: '28px', borderTop: '2px dashed #e2e8f0' };
const chapaBadge = { marginTop: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', background: '#ecfdf5', borderRadius: '14px', fontSize: '13px', color: '#065f46', fontWeight: '600' };
const actionRow = { display: 'flex', gap: '20px', marginTop: '50px' };

const errorCard = { textAlign: 'center', background: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '20px', padding: '40px', maxWidth: '480px' };
const errorLink = { color: '#ef4444', fontWeight: '700', textDecoration: 'none', fontSize: '15px', borderBottom: '2px solid #ef4444' };

const btnSuccess = { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 32px', background: '#10b981', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' };
const btnOutline = { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 32px', border: '2px solid #e2e8f0', background: 'white', color: '#475569', textDecoration: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', transition: 'border-color 0.2s' };

export default OrderSuccess;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, X, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const triggerPopup = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      triggerPopup("Please log in to your Ethmarket account to proceed.", "error");
      // Exam Tip: Delaying navigation allows the user to actually read the error message
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  const subtotal = getCartTotal();

  return (
    <div style={styles.pageContainer}>
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            style={styles.popupContainer}
          >
            <div style={{...styles.popupContent, borderColor: notification.type === 'error' ? '#ef4444' : '#10b981'}}>
              <div style={styles.iconWrapper}>
                {notification.type === 'error' ? 
                  <AlertCircle size={16} color="#ef4444" /> : 
                  <CheckCircle2 size={16} color="#10b981" />
                }
              </div>
              <span style={styles.popupText}>{notification.message}</span>
              <X size={14} style={{ cursor: 'pointer', marginLeft: '8px', color: '#64748b' }} onClick={() => setNotification({ ...notification, show: false })} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 style={styles.titleStyle}>
        <ShoppingBag size={32} color="#10b981" /> 
        Your <span style={{color: '#10b981'}}>Eth</span><span style={{color: '#0f172a'}}>market</span> Bag
      </h2>

      {cart.length === 0 ? (
        <div style={styles.emptyContainer}>
           <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛍️</div>
          <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600' }}>Your cart is currently empty.</p>
          <button onClick={() => navigate('/shop')} style={styles.shopBtn}>
            <ArrowLeft size={18} /> Continue Shopping
          </button>
        </div>
      ) : (
        <div style={styles.cartLayout}>
          <div style={{ flex: 2 }}>
            <table style={styles.tableStyle}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.thStyle}>Product</th>
                  <th style={styles.thStyle}>Price</th>
                  <th style={styles.thStyle}>Quantity</th>
                  <th style={styles.thStyle}>Subtotal</th>
                  <th style={styles.thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={`${item.id}-${item.variant_id || 'default'}`} style={styles.trStyle}>
                    <td style={styles.tdProduct}>
                      <img 
                        src={
                          item.image_url ? item.image_url : 
                          (Array.isArray(item.images) && item.images.length > 0) ? item.images[0] : 
                          "https://placehold.jp/100x100.png?text=No+Image"
                        } 
                        width="70" 
                        height="70" 
                        style={styles.imgStyle} 
                        alt={item.name} 
                        onError={(e) => { e.target.src = "https://placehold.jp/100x100.png?text=Ethmarket" }}
                      />
                      <div>
                        <Link to={`/product/${item.id}`} style={styles.nameLink}>{item.name}</Link>
                        <div style={styles.vendorSmall}>
                          Vendor: <span style={{color: '#10b981', fontWeight: '700'}}>{item.business_name || 'Ethmarket Verified'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={styles.tdStyle}>ETB {Number(item.price || 0).toLocaleString()}</td>
                    <td style={styles.tdStyle}>
                      <div style={styles.quantityGroup}>
                        <button 
                          style={styles.qtyBtn} 
                          onClick={() => {
                            if ((item.quantity || 1) > 1) {
                              updateQuantity(item.id, (item.quantity || 1) - 1, item.variant_id);
                            }
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={styles.qtyValue}>{item.quantity || 1}</span>
                        <button 
                          style={styles.qtyBtn} 
                          onClick={() => {
                            const currentQty = item.quantity || 1;
                            if (currentQty < 99) {
                              updateQuantity(item.id, currentQty + 1, item.variant_id);
                            }
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td style={styles.tdStyle}>
                      <span style={styles.subtotalText}>ETB {(item.price * (item.quantity || 1)).toLocaleString()}</span>
                    </td>
                    <td style={styles.tdStyle}>
                      <button 
                        style={styles.deleteBtn}
                        onClick={() => {
                          removeFromCart(item.id, item.variant_id);
                          triggerPopup(`${item.name} removed from bag`);
                        }} 
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.summaryContainer}>
            <h3 style={{ marginTop: 0, marginBottom: '25px', fontSize: '20px', fontWeight: '800' }}>Order Summary</h3>
            
            <div style={styles.summaryRow}>
              <span>Items Subtotal</span>
              <span style={{color: 'white'}}>ETB {subtotal.toLocaleString()}</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{ color: '#10b981', fontWeight: '700' }}>FREE</span>
            </div>
            
            <hr style={styles.hrStyle} />
            
            <div style={styles.totalRow}>
              <span>Estimated Total</span>
              <span style={styles.totalPrice}>ETB {subtotal.toLocaleString()}</span>
            </div>
            
            <button onClick={handleCheckout} style={styles.checkoutBtn}>
              Proceed to Checkout
            </button>

            <div style={styles.secureNote}>
               <ShieldCheck size={14} color="#10b981" />
               <span>Secure payment for <span style={{color:'#10b981'}}>Eth</span>market users</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: { padding: '60px 8%', minHeight: '85vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  titleStyle: { display: 'flex', alignItems: 'center', gap: '15px', fontSize: '32px', fontWeight: '800', marginBottom: '40px', color: '#0f172a', letterSpacing: '-1.5px' },
  cartLayout: { display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' },
  tableStyle: { width: '100%', background: 'white', borderRadius: '24px', borderCollapse: 'separate', borderSpacing: 0, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' },
  tableHeaderRow: { background: '#f8fafc' },
  thStyle: { padding: '20px', textAlign: 'left', color: '#475569', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' },
  trStyle: { transition: '0.2s' },
  tdStyle: { padding: '24px 20px', verticalAlign: 'middle', borderBottom: '1px solid #f8fafc' },
  tdProduct: { padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #f8fafc' },
  imgStyle: { objectFit: 'contain', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '8px', background: '#fff' },
  nameLink: { textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '16px' },
  vendorSmall: { fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: '600', textTransform: 'uppercase' },
  quantityGroup: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' },
  qtyBtn: { background: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', color: '#0f172a', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  qtyValue: { fontWeight: '800', minWidth: '24px', textAlign: 'center', fontSize: '14px' },
  subtotalText: { fontWeight: '800', color: '#0f172a', fontSize: '15px' },
  deleteBtn: { background: '#fff1f2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '12px', transition: '0.2s' },
  summaryContainer: { flex: 1, minWidth: '320px', background: '#0f172a', color: 'white', padding: '40px', borderRadius: '28px', position: 'sticky', top: '20px', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '18px', color: '#94a3b8', fontSize: '14px', fontWeight: '600' },
  totalRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '18px', fontWeight: '800' },
  totalPrice: { color: '#10b981', fontSize: '26px' },
  checkoutBtn: { width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)', transition: '0.3s' },
  secureNote: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', color: '#64748b', marginTop: '20px', fontWeight: '700' },
  hrStyle: { border: 'none', borderTop: '1px solid #1e293b', margin: '25px 0' },
  emptyContainer: { textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9' },
  shopBtn: { marginTop: '25px', background: '#0f172a', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '700' },
  popupContainer: { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 },
  popupContent: { background: 'white', padding: '10px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #10b981' },
  iconWrapper: { background: '#f0fdf4', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  popupText: { fontSize: '14px', fontWeight: '700', color: '#0f172a' }
};

export default Cart;
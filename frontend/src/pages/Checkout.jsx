import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, ChevronRight, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // --- POPUP NOTIFICATION STATE ---
  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });

  const [formData, setFormData] = useState({
    fullName: '',
    streetAddress: '',
    city: 'Addis Ababa',
    phone: '',
    email: ''
  });

  // PRESERVED LOGIC: Calculate Totals
  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + (price * qty);
  }, 0);
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  // PRESERVED LOGIC: Auth Guard
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/shop');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    } else {
      setIsVerifying(false);
    }
  }, [cart, navigate, location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PROFESSIONAL NOTIFICATION TRIGGER
  const triggerPopup = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 4000);
  };

  const handlePlaceOrder = async () => {
    if (loading) return;

    if (cart.length === 0) {
      triggerPopup("Your cart is empty!", 'error');
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.streetAddress || !formData.email) {
      triggerPopup("Please fill in all required billing information!", 'error');
      return;
    }

    if (!formData.email.includes("@")) {
      triggerPopup("Please enter a valid email address.", 'error');
      return;
    }

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      // PRESERVED LOGIC: Exact Backend Payload Structure
      const orderData = {
        items: cart.map(item => ({
          variant_id: item.variant_id || item.id,
          seller_id: item.seller_id || 1, 
          quantity: Number(item.quantity) || 1,
          price_at_purchase: Number(item.price) || 0 
        })),
        total_amount: total,
        phone_number: formData.phone,
        email: formData.email,
        currency: "ETB",
        shipping_address: {
          fullName: formData.fullName,
          street: formData.streetAddress,
          city: formData.city
        }
      };

      const res = await axios.post('http://localhost:5000/api/orders/create', orderData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.data && res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        throw new Error("Payment initialization failed.");
      }

    } catch (err) {
      console.error("Checkout Error:", err.response?.data || err);
      triggerPopup(err.response?.data?.message || err.response?.data?.error || "Order failed.", 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) return <div style={styles.loaderWrap}><h3>Verifying <span style={{color: '#10b981'}}>Eth</span>Market Session...</h3></div>;

  return (
    <div style={styles.containerStyle}>
      {/* PROFESSIONAL FLOATING NOTIFICATION (Matches image_5af5dd.png style) */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            style={styles.popupContainer}
          >
            <div style={styles.popupContent}>
              {notification.type === 'error' ? 
                <AlertCircle size={20} color="#ef4444" /> : 
                <CheckCircle2 size={20} color="#10b981" />
              }
              <span style={styles.popupText}>{notification.message}</span>
              <X size={16} style={{ cursor: 'pointer' }} onClick={() => setNotification({ ...notification, show: false })} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ width: '100%', marginBottom: '40px' }}>
        <h1 style={styles.pageTitle}><span style={{color: '#10b981'}}>Eth</span>market Checkout</h1>
        <div style={styles.breadcrumb}>
            <span>Cart</span> <ChevronRight size={14}/> <strong>Secure Checkout</strong>
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* LEFT: BILLING FORM */}
        <div style={styles.formSection}>
          <div style={styles.sectionHeader}>
            <Truck size={22} color="#10b981" />
            <h3 style={{ margin: 0 }}>Shipping & Billing Information</h3>
          </div>
          
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.labelStyle}>Full Name*</label>
              <input type="text" name="fullName" placeholder="Abebe Bikila" style={styles.fullInput} onChange={handleChange} required />
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
               <div style={{ flex: 2 }}>
                  <label style={styles.labelStyle}>Street Address*</label>
                  <input type="text" name="streetAddress" placeholder="Bole, House #123" style={styles.fullInput} onChange={handleChange} required />
               </div>
               <div style={{ flex: 1 }}>
                  <label style={styles.labelStyle}>City*</label>
                  <input type="text" name="city" value={formData.city} style={styles.fullInput} onChange={handleChange} required />
               </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.labelStyle}>Phone Number*</label>
                <input type="tel" name="phone" placeholder="0911223344" style={styles.fullInput} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.labelStyle}>Email Address*</label>
                <input type="email" name="email" placeholder="abebe@ethmarket.com" style={styles.fullInput} onChange={handleChange} required />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div style={styles.summaryContainer}>
          <div style={styles.sectionHeader}>
            <CreditCard size={20} color="#10b981" />
            <h3 style={{ margin: 0 }}>Order Summary</h3>
          </div>

          <div style={styles.orderScrollList}>
            {cart.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img 
                    src={(item.images && item.images.length > 0) ? item.images[0] : (item.image_url || "https://placehold.jp/100x100.png?text=Product")} 
                    alt={item.name}
                    style={styles.itemImg}
                    onError={(e) => { e.target.src = "https://placehold.jp/100x100.png?text=No+Image"; }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{item.name}</p>
                    <small style={{ color: '#94a3b8' }}>Qty: {item.quantity || 1}</small>
                  </div>
                </div>
                <span style={{ fontWeight: '700' }}>{(item.price * (item.quantity || 1)).toLocaleString()} ETB</span>
              </div>
            ))}
          </div>

          <div style={styles.billingBlock}>
            <div style={styles.priceLine}><span>Subtotal</span><span>{subtotal.toLocaleString()} ETB</span></div>
            <div style={styles.priceLine}><span>Delivery Fee</span><span>{shipping === 0 ? "FREE" : `${shipping} ETB`}</span></div>
            <div style={styles.totalLine}>
              <span>Total Payable</span>
              <span style={{ color: '#10b981' }}>{total.toLocaleString()} ETB</span>
            </div>
          </div>

          <div style={styles.chapaBox}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800' }}>CHAPA SECURE PAYMENT</span>
                <img src="https://chapa.co/wp-content/uploads/2022/07/Logos-04.png" alt="Chapa" style={{ height: '16px' }} />
             </div>
             <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Pay with Telebirr, CBE Birr, or International Cards.</p>
          </div>

          <button onClick={handlePlaceOrder} disabled={loading} style={styles.checkoutBtn(loading)}>
            {loading ? "Initializing Chapa..." : `Proceed to Payment`}
          </button>

          <div style={styles.secureFooter}>
            <ShieldCheck size={14} /> <span>ENCRYPTED TRANSACTION</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  containerStyle: { padding: '40px 10%', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  pageTitle: { fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginTop: '10px' },
  contentGrid: { display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' },
  formSection: { flex: 1.6, background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '30px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelStyle: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
  fullInput: { width: '100%', padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' },
  summaryContainer: { flex: 1, minWidth: '350px', background: '#0f172a', color: 'white', padding: '40px', borderRadius: '24px', position: 'sticky', top: '20px' },
  orderScrollList: { maxHeight: '200px', overflowY: 'auto', marginBottom: '25px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  itemImg: { width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px', background: 'white' },
  billingBlock: { borderTop: '1px solid #1e293b', paddingTop: '20px' },
  priceLine: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#94a3b8' },
  totalLine: { display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '24px', fontWeight: '800' },
  chapaBox: { background: '#1e293b', padding: '20px', borderRadius: '16px', marginTop: '30px', border: '1px solid #334155' },
  loaderWrap: { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800' },
  checkoutBtn: (loading) => ({
    width: '100%', background: '#10b981', color: 'white', padding: '18px', borderRadius: '14px', border: 'none', 
    cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '16px', marginTop: '25px', 
    boxShadow: '0 10px 15px rgba(16, 185, 129, 0.2)', transition: '0.2s', opacity: loading ? 0.7 : 1
  }),
  secureFooter: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', color: '#475569', fontSize: '10px', fontWeight: '700' },
  
  // --- POPUP STYLES (MATCHES image_5af5dd.png) ---
  popupContainer: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 },
  popupContent: { 
    background: 'white', 
    padding: '12px 24px', 
    borderRadius: '100px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid #10b981'
  },
  popupText: { fontSize: '14px', fontWeight: '700', color: '#0f172a' }
};

export default Checkout;
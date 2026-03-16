import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// ✅ FIXED: Removed unused ArrowLeft to clear the warning
import { Trash2, ShoppingCart, Package, X, CheckCircle2, AlertCircle, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const token = localStorage.getItem('token');

  const triggerPopup = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // ✅ PRESERVED: Same Logic as your original code
  const fetchWishlist = useCallback(async () => {
    if (!token) {
      setError('Please login to view wishlist');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data.wishlist || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleMoveToCart = async (product) => {
    try {
      const cartItem = {
        ...product,
        id: product.id,
        price: product.price,
        name: product.name,
        images: product.images || [product.image_url],
        quantity: 1
      };

      addToCart(cartItem); 
      
      await axios.delete(`http://localhost:5000/api/wishlist/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      triggerPopup(`"${product.name}" moved to cart!`, 'success');
    } catch (err) {
      triggerPopup('Failed to move item', 'error');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(prev => prev.filter(item => item.id !== productId));
      triggerPopup('Item removed from wishlist', 'success');
    } catch (err) {
      triggerPopup('Failed to remove item', 'error');
    }
  };

  const moveAllToCart = async () => {
    try {
      // eslint-disable-next-line
      for (const item of wishlist) {
        if (item.stock_quantity > 0) {
          addToCart(item); 
          await axios.delete(`http://localhost:5000/api/wishlist/${item.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
      setWishlist([]);
      triggerPopup('All available items moved to cart!', 'success');
    } catch (err) {
      triggerPopup('Error moving some items', 'error');
    }
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Package size={48} style={{ margin: '0 auto 20px', color: '#10b981', opacity: 0.6 }} />
          <p style={{ color: '#64748b', fontWeight: '600' }}>Loading your <span style={{color:'#10b981'}}>Eth</span>market Wishlist...</p>
        </div>
      </div>
    );
  }

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
              {notification.type === 'error' ? 
                <AlertCircle size={18} color="#ef4444" /> : 
                <CheckCircle2 size={18} color="#10b981" />
              }
              <span style={styles.popupText}>{notification.message}</span>
              <X size={14} style={{ cursor: 'pointer', marginLeft: '8px' }} onClick={() => setNotification({ ...notification, show: false })} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.headerSection}>
        <h3 style={styles.wishlistCount}>
          <span style={{color: '#10b981'}}>Eth</span>market Wishlist <span style={styles.badgeStyle}>{wishlist.length}</span>
        </h3>
        
        {wishlist.length > 0 && (
          <button onClick={moveAllToCart} style={styles.moveAllBtn}>
            Move All To Cart
          </button>
        )}
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={fetchWishlist} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {wishlist.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.emptyCard}
        >
          <div style={styles.iconCircle}>
            <Heart size={40} color="#10b981" fill="#10b981" style={{ opacity: 0.2 }} />
            <Heart size={32} color="#10b981" style={styles.absoluteIcon} />
          </div>
          <h2 style={styles.emptyTitle}>Your Wishlist is Empty</h2>
          <p style={styles.emptySubtitle}>
            Looks like you haven't saved any favorites yet. <br />
            Explore our shop and find something you love!
          </p>
          <button onClick={() => navigate('/shop')} style={styles.returnBtn}>
            <ShoppingCart size={18} />
            <span>Start Shopping</span>
          </button>
        </motion.div>
      ) : (
        <div style={styles.wishlistGrid}>
          {wishlist.map(item => (
            <div key={item.id} style={styles.cardStyle}>
              <div style={styles.imageContainer}>
                {item.stock_quantity === 0 && (
                  <span style={styles.outOfStockBadge}>Out of Stock</span>
                )}
                
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  style={styles.removeIconBtn}
                >
                  <Trash2 size={18} color="#ef4444" />
                </button>

                <img 
                  src={item.image_url || "https://placehold.jp/200x200.png?text=Ethmarket"} 
                  alt={item.name} 
                  style={styles.imageStyle}
                  onError={(e) => e.target.src = "https://placehold.jp/200x200.png?text=Product"}
                />
                
                <button 
                  onClick={() => handleMoveToCart(item)}
                  style={{...styles.addToCartBtn, opacity: item.stock_quantity === 0 ? 0.5 : 1, cursor: item.stock_quantity === 0 ? 'not-allowed' : 'pointer'}}
                  disabled={item.stock_quantity === 0}
                >
                  <ShoppingCart size={16} />
                  <span>{item.stock_quantity === 0 ? 'Sold Out' : 'Add To Cart'}</span>
                </button>
              </div>
              
              <div style={styles.contentStyle}>
                <h4 style={styles.productName}>{item.name}</h4>
                <div style={styles.priceRow}>
                  <span style={styles.currentPrice}>{parseFloat(item.price || 0).toLocaleString()} ETB</span>
                  {item.stock_quantity === 0 && (
                    <span style={styles.outOfStockText}>Not available</span>
                  )}
                </div>
                <small style={styles.vendorText}>By: <span style={{color: '#10b981', fontWeight: '600'}}>{item.business_name || 'Verified Seller'}</span></small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: { padding: '60px 8%', minHeight: '80vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  wishlistCount: { fontSize: '28px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-1px' },
  badgeStyle: { background: '#10b981', color: 'white', padding: '2px 14px', borderRadius: '20px', fontSize: '14px' },
  moveAllBtn: { background: 'transparent', border: '2px solid #10b981', color: '#10b981', padding: '10px 20px', cursor: 'pointer', fontWeight: '700', borderRadius: '12px' },
  wishlistGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '30px' },
  cardStyle: { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' },
  imageContainer: { background: '#f8fafc', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  imageStyle: { maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' },
  removeIconBtn: { position: 'absolute', top: '15px', right: '15px', background: 'white', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  addToCartBtn: { position: 'absolute', bottom: 15, width: '90%', left: '5%', background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: '700' },
  contentStyle: { padding: '20px' },
  productName: { fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  currentPrice: { color: '#10b981', fontWeight: '800', fontSize: '18px' },
  vendorText: { display: 'block', marginTop: '12px', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' },
  emptyCard: { background: 'white', padding: '80px 40px', borderRadius: '32px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', maxWidth: '600px', margin: '40px auto' },
  iconCircle: { width: '100px', height: '100px', background: '#f0fdf4', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  absoluteIcon: { position: 'absolute' },
  emptyTitle: { fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' },
  emptySubtitle: { color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' },
  returnBtn: { display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#10b981', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '16px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' },
  errorContainer: { textAlign: 'center', padding: '40px', background: '#fef2f2', borderRadius: '20px' },
  retryBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px' },
  outOfStockBadge: { position: 'absolute', top: '15px', left: '15px', background: '#ef4444', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '10px' },
  outOfStockText: { color: '#ef4444', fontSize: '11px' },
  popupContainer: { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 },
  popupContent: { background: 'white', padding: '14px 28px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', border: '2px solid #10b981' },
  popupText: { fontSize: '14px', fontWeight: '800', color: '#0f172a' }
};

export default Wishlist;
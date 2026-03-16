import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingBag, ArrowLeft, Truck, ShieldCheck, Star, Minus, Plus, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext'; 

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth(); 

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Default');
  
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const token = localStorage.getItem('token');
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  // Extract sizes and colors from product variants
const sizes = product?.variants
  ? [...new Set(product.variants.map(v => v.size))]
  : [];

const colors = product?.variants
  ? [...new Set(product.variants.map(v => v.color))]
  : [];

  // Custom Toast state for professional pop-up
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/review/product/${id}`);
        setReviews(res.data.reviews || []);
        setProduct(prev => ({ ...prev, avg_rating: res.data.stats.avg_rating }));
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchReviews();
  }, [id]);

const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    try {
      setReviewLoading(true);
      await axios.post('http://localhost:5000/api/review', { 
        product_id: id, 
        rating: newReview.rating, 
        comment: newReview.comment 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      triggerToast("Review submitted successfully!", "success");
      setNewReview({ rating: 5, comment: '' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      if (err.response?.status === 403) {
        // Instead of alert(), we use our professional triggerToast
        triggerToast("Ethmarket Policy: Verified purchase required for reviews.", "error");
      } else {
        triggerToast(err.response?.data?.error || "Error submitting review", "error");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/review/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(reviews.filter(r => r.id !== reviewId));
      triggerToast("✅ Review deleted successfully!");
    } catch (err) {
      triggerToast("Error deleting review.", "error");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/products/details/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const checkWishlistStatus = useCallback(async () => {
    if (!token || !product?.id) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/wishlist/${product.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsInWishlist(response.data.inWishlist);
    } catch {
      setIsInWishlist(false);
    }
  }, [token, product?.id]);

  const toggleWishlist = async () => {
    if (!token) {
      triggerToast('Please login to manage wishlist', 'error');
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await axios.delete(`http://localhost:5000/api/wishlist/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsInWishlist(false);
        triggerToast('Removed from wishlist');
      } else {
        await axios.post('http://localhost:5000/api/wishlist', {
          product_id: product.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsInWishlist(true);
        triggerToast('Added to wishlist! ❤️');
      }
    } catch (err) {
      triggerToast(err.response?.status === 409 ? 'Already in wishlist!' : 'Failed to update wishlist', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);

const handleAddToCart = () => {

  if (!user) {
    triggerToast("Please login to add items to cart", "error");
    navigate('/login');
    return;
  }

  const variant = product?.variants?.find(
    v => v.size === selectedSize && v.color === selectedColor
  );

  const itemForCart = {
    ...product,
    variant_id: variant?.id,
    price: variant?.price || product.base_price,
    quantity,
    selectedSize,
    selectedColor
  };

  addToCart(itemForCart);   // ⭐ THIS WAS MISSING
  triggerToast("Added to cart successfully!");
};
  const handleBuyNow = () => {
    if (user) {
      const itemForCart = { 
        ...product, 
        price: product.base_price, 
        quantity, 
        selectedSize, 
        selectedColor 
      };
      addToCart(itemForCart);
      navigate('/checkout');
    } else {
      triggerToast("Please login to buy products!", "error");
      navigate('/login');
    }
  };

  if (loading) return <div style={styles.loader}>Loading Ethmarket Product...</div>;
 if (!product) {
    return (
      <div style={styles.errorContainer}>
        <h2>Product Not Found</h2>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          <ArrowLeft size={18} /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Professional Pop-up Notification */}
{toast.show && (
        <div style={styles.toastOverlay}>
          <div style={{
            ...styles.toastCard,
            borderTop: `5px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`
          }}>
            <div style={styles.toastIcon}>
              {toast.type === 'error' ? 
                <ShieldCheck size={32} color="#ef4444" /> : 
                <CheckCircle2 size={32} color="#10b981" />
              }
            </div>
            <div style={styles.toastBody}>
              <h3 style={styles.toastHeader}>
                {toast.type === 'error' ? 'Policy Verification' : 'Success'}
              </h3>
              <p style={styles.toastMsgText}>{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              style={styles.toastCloseBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{width: '100%', marginBottom: '20px'}}>
         <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={18} /> Back to Shop
        </button>
      </div>

      <div style={styles.mainLayout}>
        {/* --- LEFT SIDE: Image Gallery --- */}
        <div style={styles.imageSection}>
          {(() => {
            let imageUrl = "https://via.placeholder.com/500x500.png?text=Ethmarket+Verified";
            if (product.images) {
              try {
                const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                if (parsed && parsed.length > 0) imageUrl = parsed[0];
              } catch (e) { imageUrl = product.images; }
            } else if (product.image || product.img) {
              imageUrl = product.image || product.img;
            }
            return (
              <img 
                src={imageUrl} 
                alt={product.name} 
                style={styles.mainImage} 
                onError={(e) => { e.target.src = "https://via.placeholder.com/500x500.png?text=No+Image+Available"; }}
              />
            );
          })()}
        </div>

        {/* --- RIGHT SIDE: Info Section --- */}
        <div style={styles.infoSection}>
          <div style={styles.breadcrumb}>Shop / {product.category || 'Quality Goods'}</div>
          <h1 style={styles.title}>{product.name}</h1>
          
          <div style={styles.metaRow}>
            <span style={styles.rating}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" style={{marginRight: '4px', marginBottom: '-2px'}} />
              {Number(product.avg_rating || 0).toFixed(1)}
              <span style={{color: '#64748b', marginLeft: '4px'}}> ({reviews.length} Reviews)</span>
            </span>
            <span style={styles.sellerName}>Store: {product.business_name || "Ethmarket Verified"}</span>
            <span style={product.stock_quantity > 0 ? styles.inStock : styles.outOfStock}>
              {product.stock_quantity > 0 ? `✓ ${product.stock_quantity} In Stock` : 'Out of Stock'}
            </span>
          </div>

          <h2 style={styles.price}>
            ETB {product?.base_price ? Number(product.base_price).toLocaleString() : "0"}
          </h2>
          
          <p style={styles.description}>{product.description || "Premium authentic quality item."}</p>

          <hr style={styles.divider} />
          
          <div style={styles.optionGroup}>
            <p style={styles.optionTitle}><b>Available Colors:</b></p>
            <div style={styles.flexRow}>
{colors.map(color => (
  <span
    key={color}
    onClick={() => setSelectedColor(color)}
    style={{
      ...styles.colorDot,
      background: color,
      border: selectedColor === color
        ? '3px solid #0984e3'
        : '1px solid #e2e8f0'
    }}
  ></span>
))}
            </div>
          </div>

          <div style={styles.optionGroup}>
            <p style={styles.optionTitle}><b>Select Size:</b></p>
            <div style={styles.flexRow}>
{sizes.map(size => (
  <span
    key={size}
    onClick={() => setSelectedSize(size)}
    style={{
      ...styles.sizeBox,
      background: selectedSize === size ? '#1e293b' : 'white',
      color: selectedSize === size ? 'white' : 'black',
    }}
  >
    {size}
  </span>
))}
            </div>
          </div>

          <div style={styles.actionRow}>
            <div style={styles.qtyContainer}>
              <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} style={styles.qtyBtn}><Minus size={16}/></button>
              <span style={styles.qtyDisplay}>{quantity}</span>
              <button onClick={() => setQuantity(q => q < product.stock_quantity ? q + 1 : q)} style={styles.qtyBtn}><Plus size={16}/></button>
            </div>

            <button onClick={handleBuyNow} style={styles.buyNowBtn}>Buy Now</button>

            <button onClick={toggleWishlist} disabled={wishlistLoading} style={styles.wishBtn}>
              <Heart size={22} fill={isInWishlist ? '#e11d48' : 'none'} color={isInWishlist ? '#e11d48' : '#64748b'} />
            </button>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            style={product.stock_quantity > 0 ? styles.cartBtn : styles.disabledBtn}
          >
            <ShoppingBag size={20} /> Add to Ethmarket Cart
          </button>

          <div style={styles.trustBox}>
            <div style={styles.trustItem}>
              <Truck size={20} color="#0984e3" /> 
              <div><h4 style={styles.trustTitle}>Reliable Delivery</h4><p style={styles.trustText}>Verified Logistics</p></div>
            </div>
            <div style={styles.trustItem}>
              <ShieldCheck size={20} color="#0984e3" />
              <div><h4 style={styles.trustTitle}>Secure Payment</h4><p style={styles.trustText}>Escrow Protected</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div style={styles.reviewSection}>
        <h2 style={styles.sectionTitle}>Customer Reviews</h2>
        
        {user && user.role === 'customer' ? (
          <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
            <h4 style={{marginBottom: '10px'}}>Share your thoughts</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <span key={num} onClick={() => setNewReview({ ...newReview, rating: num })}
                  style={{ fontSize: '24px', cursor: 'pointer', color: num <= newReview.rating ? '#f59e0b' : '#cbd5e1' }}>★</span>
              ))}
            </div>
            <textarea 
              placeholder="Write your review here..."
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              style={styles.reviewInput}
              required
            />
            <button type="submit" disabled={reviewLoading} style={styles.submitReviewBtn}>
              <ShieldCheck size={18} style={{marginRight: '6px'}} />
              {reviewLoading ? 'Verifying Purchase...' : 'Post Verified Review'}
            </button>
          </form>
        ) : (
          <div style={styles.guestNotice}>
            <p>Please <strong onClick={() => navigate('/login')} style={{cursor:'pointer', color:'#0984e3'}}>Login</strong> to review.</p>
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          {reviews.map((rev) => (
            <div key={rev.id} style={styles.reviewCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <strong>{rev.customer_name}</strong>
                  <span style={styles.verifiedBadge}><ShieldCheck size={10} /> Verified Purchase</span>
                  {user && (user.id === rev.customer_id || user.role === 'admin') && (
                    <button onClick={() => handleDeleteReview(rev.id)} style={styles.deleteBtn}>Delete</button>
                  )}
                </div>
                <span style={styles.rating}>{'⭐'.repeat(rev.rating)}</span>
              </div>
              <p style={{ margin: '10px 0', color: '#475569' }}>{rev.comment}</p>
              <small style={{ color: '#94a3b8' }}>{new Date(rev.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px 10%', maxWidth: '1400px', margin: '0 auto' },
  toast: { position: 'fixed', top: '20px', right: '20px', color: 'white', padding: '15px 30px', borderRadius: '10px', zIndex: 1000, fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  mainLayout: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'start' },
  imageSection: { background: '#f8fafc', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9' },
  mainImage: { width: '100%', objectFit: 'contain', borderRadius: '12px' },
  infoSection: { display: 'flex', flexDirection: 'column' },
  title: { fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' },
  price: { fontSize: '32px', color: '#10b981', fontWeight: '800', margin: '20px 0' },
  breadcrumb: { fontSize: '13px', color: '#94a3b8', fontWeight: '600', marginBottom: '10px' },
  metaRow: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' },
  inStock: { color: '#10b981', background: '#ecfdf5', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  outOfStock: { color: '#ef4444', background: '#fef2f2', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  description: { lineHeight: '1.7', color: '#475569', fontSize: '15px' },
  divider: { border: '0', borderTop: '1px solid #f1f5f9', margin: '25px 0' },
  flexRow: { display: 'flex', gap: '12px' },
  colorDot: { width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' },
  sizeBox: { border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' },
  actionRow: { display: 'flex', gap: '15px', marginTop: '30px' },
  qtyContainer: { display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '12px' },
  qtyBtn: { padding: '10px', border: 'none', background: 'none', cursor: 'pointer' },
  qtyDisplay: { padding: '0 15px', fontWeight: '800' },
  buyNowBtn: { flex: 1, background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
  cartBtn: { width: '100%', marginTop: '15px', height: '56px', background: '#0f172a', color: 'white', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  wishBtn: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white' },
  trustBox: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '30px' },
  trustItem: { display: 'flex', gap: '10px', padding: '15px', background: '#f8fafc', borderRadius: '12px', alignItems: 'center' },
  trustTitle: { margin: 0, fontSize: '14px', fontWeight: '700' },
  trustText: { margin: 0, fontSize: '11px', color: '#64748b' },
  reviewSection: { marginTop: '80px', paddingTop: '40px', borderTop: '2px solid #f1f5f9' },
  reviewForm: { background: '#f8fafc', padding: '30px', borderRadius: '20px' },
  reviewInput: { width: '100%', height: '100px', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px', resize: 'none' },
  submitReviewBtn: { background: '#0f172a', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' },
  verifiedBadge: { background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', display: 'flex', gap: '4px', alignItems: 'center' },
  reviewCard: { padding: '20px 0', borderBottom: '1px solid #f1f5f9' },
  deleteBtn: { border: 'none', background: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '11px' },
  loader: { height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700', color: '#10b981' },
  backBtn: { background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', color: '#64748b' },
  toastOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' },
  toastCard: { background: '#fff', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  toastHeader: { margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' },
  toastMsgText: { color: '#64748b', fontSize: '15px', lineHeight: '1.5', margin: 0 },
  toastCloseBtn: { marginTop: '10px', padding: '10px 25px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
};

export default ProductDetails;
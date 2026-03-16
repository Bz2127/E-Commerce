import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Filter, ChevronDown, ShoppingCart, Star, Heart, LayoutGrid, CheckCircle2, X } from 'lucide-react';
import { useCart } from '../context/CartContext'; 
import { motion, AnimatePresence } from 'framer-motion';

const BrandColors = {
  primary: '#10b981', 
  secondary: '#0f172a',
  danger: '#ef4444',
  textMuted: '#64748b'
};

const Shop = () => {
  const { addToCart } = useCart();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(100000); 
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const token = localStorage.getItem('token');

  // NEW: Premium Notification State (Replaces boring alerts)
  const [notif, setNotif] = useState({ show: false, msg: '' });

  const triggerNotif = (msg) => {
    setNotif({ show: true, msg });
    setTimeout(() => setNotif({ show: false, msg: '' }), 3000);
  };

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        setCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.log("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products with cleanup logic
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      const queryParams = new URLSearchParams(location.search);
      const keyword = queryParams.get('keyword'); 

      try {
        const response = await axios.get(`http://localhost:5000/api/products/all`, {
          params: {
            maxPrice: price,
            category: selectedCategory === 'All' ? undefined : selectedCategory,
            sort: sortBy,
            keyword: keyword 
          }
        });
        if (isMounted) setProducts(response.data.products || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => { isMounted = false; };
  }, [price, selectedCategory, sortBy, location.search]);

  // Fetch user's wishlist on mount
  useEffect(() => {
    if (!token) return;
    const fetchWishlist = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const wishlistSet = new Set(response.data.wishlist.map(item => item.id));
        setWishlistItems(wishlistSet);
      } catch (err) {
        console.log('Failed to fetch wishlist');
      }
    };
    fetchWishlist();
  }, [token]);

  // Handlers
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation(); 
    addToCart(product);
    triggerNotif(`${product.name} added to cart!`);
  };

  const handleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      triggerNotif('Please login first');
      return;
    }

    try {
      if (wishlistItems.has(product.id)) {
        await axios.delete(`http://localhost:5000/api/wishlist/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
        triggerNotif('Removed from wishlist');
      } else {
        await axios.post('http://localhost:5000/api/wishlist', {
          product_id: product.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistItems(prev => new Set(prev).add(product.id));
        triggerNotif('Added to wishlist');
      }
    } catch (err) {
      triggerNotif('Wishlist update failed');
    }
  };

  const isInWishlist = (id) => wishlistItems.has(id);

  return (
    <div style={pageContainer}>
      {/* SLIDE-IN NOTIFICATION */}
      <AnimatePresence>
        {notif.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -50 }}
            style={notifBox}
          >
            <CheckCircle2 color={BrandColors.primary} size={20} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{notif.msg}</span>
            <X size={14} style={{ cursor: 'pointer' }} onClick={() => setNotif({ show: false, msg: '' })} />
          </motion.div>
        )}
      </AnimatePresence>

      <aside style={sidebarStyle}>
        <div style={sidebarHeader}>
          <Filter size={20} color={BrandColors.primary} />
          <h3 style={{ margin: 0, fontSize: '18px' }}>Filters</h3>
        </div>
        
        <div style={filterSection}>
          <h4 style={filterTitle}>Categories</h4>
          {['All', ...categories.map(c => c?.name)].map(cat => (
            <label key={cat} style={labelStyle}>
              <input 
                type="radio" 
                name="category" 
                checked={selectedCategory === cat}
                onChange={() => setSelectedCategory(cat)} 
                style={radioStyle}
              /> {cat}
            </label>
          ))}
        </div>

        <div style={filterSection}>
          <h4 style={filterTitle}>Price Range</h4>
          <input 
            type="range" 
            min="100" 
            max="100000" 
            step="100"
            value={price} 
            onChange={(e) => setPrice(Number(e.target.value))}
            style={rangeStyle} 
          />
          <div style={priceLabel}>
            <span>Under: ETB {Number(price).toLocaleString()}</span>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, paddingLeft: '40px' }}>
        <div style={mainHeader}>
          <h2 style={{ margin: 0, color: BrandColors.secondary }}>Ethmarket Catalog <span style={countTag}>{products.length}</span></h2>
          <div style={sortWrapper}>
            <div style={{ position: 'relative' }}>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                style={selectStyle}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
              <ChevronDown size={14} style={selectIcon} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={loaderStyle}>Refreshing Ethmarket...</div>
        ) : products.length === 0 ? (
          <div style={loaderStyle}>No products found in this range.</div>
        ) : (
          <div style={productGrid}>
            {products.map(product => (
              <motion.div whileHover={{ y: -5 }} style={cardStyle} key={product.id}>
                <div style={imageContainer}>
                  <Link to={`/product/${product.id}`} style={imgLink}>
                    <img 
                      src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "https://placehold.jp/200x200.png?text=Ethmarket"} 
                      alt={product.name} 
                      style={imageStyle} 
                      onError={(e) => { e.target.src = "https://placehold.jp/200x200.png?text=Ethmarket" }}
                    />
                  </Link>
                  <div style={actionButtonsGroup}>
                    <button 
                      onClick={(e) => handleWishlist(e, product)} 
                      style={{...iconBtn, color: isInWishlist(product.id) ? BrandColors.danger : '#64748b'}} 
                    >
                      <Heart size={18} fill={isInWishlist(product.id) ? BrandColors.danger : 'none'} />
                    </button>
                    <button onClick={(e) => handleAddToCart(e, product)} style={iconBtn}>
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
                
                <div style={contentStyle}>
                  <small style={categoryLabel}>{product.category || 'General'}</small>
                  <h4 style={productName}>{product.name}</h4>
                  <div style={ratingRow}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span style={ratingText}>{Number(product.avg_rating || 0).toFixed(1)}</span>
                  </div>
                  <div style={priceRow}>
                    <span style={currentPrice}>ETB {Number(product.price).toLocaleString()}</span>
                  </div>
                  <div style={sellerInfo}>
                    <LayoutGrid size={12} />
                    <span>Vendor: {product.business_name || 'Verified Seller'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// UPDATED STYLES FOR BRAND CONSISTENCY
const pageContainer = { display: 'flex', padding: '40px 6%', minHeight: '80vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' };
const sidebarStyle = { width: '260px', background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: 'fit-content', position: 'sticky', top: '20px' };
const sidebarHeader = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' };
const filterSection = { marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' };
const filterTitle = { fontSize: '14px', fontWeight: '700', marginBottom: '15px', color: '#475569' };
const labelStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer', fontSize: '14px' };
const radioStyle = { width: '16px', height: '16px', accentColor: BrandColors.primary };
const rangeStyle = { width: '100%', accentColor: BrandColors.primary, cursor: 'pointer' };
const priceLabel = { marginTop: '10px', fontSize: '13px', fontWeight: 'bold', color: BrandColors.primary };
const mainHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const countTag = { fontSize: '14px', background: '#e2e8f0', padding: '2px 10px', borderRadius: '12px', marginLeft: '8px' };
const sortWrapper = { display: 'flex', alignItems: 'center', gap: '10px' };
const selectStyle = { padding: '8px 35px 8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', appearance: 'none', background: 'white', cursor: 'pointer', fontWeight: '600' };
const selectIcon = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };
const productGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' };
const cardStyle = { background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' };
const imageContainer = { position: 'relative', background: '#f8fafc', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const imgLink = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const imageStyle = { maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' };
const actionButtonsGroup = { position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '8px' };
const iconBtn = { background: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };
const contentStyle = { padding: '20px' };
const categoryLabel = { fontSize: '11px', color: BrandColors.primary, textTransform: 'uppercase', fontWeight: '800' };
const productName = { fontSize: '16px', fontWeight: '700', color: BrandColors.secondary, margin: '5px 0 10px 0', height: '40px', overflow: 'hidden' };
const ratingRow = { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' };
const ratingText = { fontSize: '13px', color: '#64748b' };
const priceRow = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' };
const currentPrice = { fontSize: '18px', fontWeight: '800', color: BrandColors.secondary };
const sellerInfo = { fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' };
const loaderStyle = { textAlign: 'center', padding: '100px', color: '#64748b', fontSize: '18px' };
const notifBox = { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '12px 24px', borderRadius: '50px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, border: `1px solid ${BrandColors.primary}` };

export default Shop;
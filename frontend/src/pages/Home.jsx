import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api"
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Heart, Eye, Truck, Headset, 
  ShieldCheck, ChevronRight, Star, Clock
} from "lucide-react";
import { useCart } from "../context/CartContext";

// Core Brand Colors for Consistency
const BrandColors = {
  primary: '#10b981', 
  secondary: '#0f172a',
  accent: '#3b82f6',
  danger: '#ef4444',
  bgLight: '#f8fafc',
  textMain: '#1e293b',
  textMuted: '#64748b'
};

const Home = () => {
  // --- YOUR ORIGINAL STATE ---
  const [flashProducts, setFlashProducts] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const { addToCart, fetchWishlist } = useCart();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const token = localStorage.getItem("token");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  // --- YOUR ORIGINAL TIMER LOGIC ---
  useEffect(() => {
    const targetDate = new Date().getTime() + (3 * 24 * 60 * 60 * 1000);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
      if (distance < 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- YOUR ORIGINAL API CALLS ---
  useEffect(() => {
    const loadHomeProducts = async () => {
      try {
        const [flash, featured, best, arrivals] = await Promise.all([
          api.get(`/products/flash-sales`),
          api.get(`/products/featured`),
          api.get(`/products/best-sellers`),
          api.get(`/products/new-arrivals`)
        ]);
        setFlashProducts(Array.isArray(flash.data) ? flash.data : flash.data.products || []);
        setFeaturedProducts(Array.isArray(featured.data) ? featured.data : featured.data.products || []);
        setBestSellers(Array.isArray(best.data) ? best.data : best.data.products || []);
        setNewArrivals(Array.isArray(arrivals.data) ? arrivals.data : arrivals.data.products || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load homepage products", err);
        setLoading(false);
      }
    };
    loadHomeProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(`/categories`);
        if (res.data && res.data.success) { setCategories(res.data.data); }
      } catch (err) { console.error("Failed to load categories:", err); }
    };
    const fetchBanners = async () => {
      try {
        const res = await api.get('/banners');
        if (res.data) { setBanners(res.data); }
      } catch (err) { console.error("Failed to load banners", err); }
    };
    fetchCategories();
    fetchBanners(); 
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
      }, 5000); 
      return () => clearInterval(timer);
    }
  }, [banners]);

  // --- YOUR ORIGINAL WISHLIST LOGIC ---
  useEffect(() => {
    if (!token) return;
    const fetchWishlist = async () => {
      try {
const res = await api.get(`/wishlist`);;
        const ids = new Set(res.data.wishlist.map((p) => p.id));
        setWishlistItems(ids);
      } catch (err) { console.log("Wishlist not loaded"); }
    };
    fetchWishlist();
  }, [token]);

  const handleWishlist = async (product) => {
    if (!token) { 
        alert("Please login first"); 
        navigate("/login"); 
        return; 
    }

    try {
        if (wishlistItems.has(product.id)) {
            // Delete from database
          await api.delete(`/wishlist/${product.id}`);
            // Update local state for the heart color
            const updated = new Set(wishlistItems); 
            updated.delete(product.id); 
            setWishlistItems(updated);
        } else {
            // Add to database
          await api.post('/wishlist', { product_id: product.id });
            
            // Update local state for the heart color
            const updated = new Set(wishlistItems); 
            updated.add(product.id); 
            setWishlistItems(updated);
        }

        // --- THE CRITICAL FIX FOR THE SIGN ---
        // This line tells the Navbar to refresh its count from the database
        if (fetchWishlist) {
            await fetchWishlist();
        }
        // -------------------------------------

    } catch (err) { 
        alert("Wishlist update failed"); 
        console.error(err);
    }
};

  const isInWishlist = (id) => wishlistItems.has(id);

  const renderStars = (rating, count) => (
    <div style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={14} fill={star <= Math.round(rating) ? '#FBBF24' : 'none'} color={star <= Math.round(rating) ? '#FBBF24' : '#D1D5DB'} />
      ))}
      <span style={styles.starCount}>({count || 0})</span>
    </div>
  );

  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#fff" }}>
      
      {/* HERO SECTION */}
      <div style={styles.heroWrapper}>

        {/* CATEGORY SIDEBAR */}
        <div style={styles.sidebar}>
          {categories.length > 0 ? categories.map((cat) => (
            <motion.div
              whileHover={{ x: 5, color: BrandColors.primary }}
              key={cat.id}
              style={styles.sidebarItem}
              onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.slug)}`)}
            >
              <span>{cat.name}</span>
              <ChevronRight size={16} />
            </motion.div>
          )) : <p style={styles.noDataText}>No categories available</p>}
        </div>

        {/* HERO BANNER WITH ANIMATION */}
        <div style={styles.bannerContainer}>
          <AnimatePresence mode="wait">
            {banners.length > 0 ? (
              <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={styles.heroBanner}
              >
                <div style={{ flex: 1.2 }}>
                  <h1 style={styles.heroH1}>{banners[currentSlide].title}</h1>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={styles.shopNowBtn}
                    onClick={() => navigate(banners[currentSlide].link_url || "/shop")}
                  >
                    Shop Now <ChevronRight size={18} />
                  </motion.button>
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <img src={banners[currentSlide].image_url} alt="banner" style={styles.heroImg} />
                </div>

                <div style={styles.dotContainer}>
                  {banners.map((_, index) => (
                    <div key={index} onClick={() => setCurrentSlide(index)}
                      style={{ ...styles.dotStyle, backgroundColor: currentSlide === index ? BrandColors.primary : "#ffffff44" }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <div style={styles.heroBanner}>
                <div style={{ flex: 1 }}>
                  <div style={styles.appleHeader}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Apple-logo.png" alt="apple" style={styles.appleLogo} />
                    <span>iPhone 15 Pro Series</span>
                  </div>
                  <h1 style={styles.heroH1}>New Arrival <br /> EthMarket Deals</h1>
                  <p style={styles.shopNowBtn} onClick={() => navigate("/shop")}>Shop Now →</p>
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <img src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500" alt="iphone" style={styles.heroImg} />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* FLASH SALES */}
      <div style={styles.sectionContainer}>
        <div style={styles.sectionLabel}>
          <div style={styles.redBox}></div>
          <span style={{ color: BrandColors.primary, fontWeight: "bold" }}>Today's Flash Sales</span>
        </div>

      <div style={styles.flexHeader}>
  
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <Clock size={28} color={BrandColors.danger} /> 
    <h2 style={styles.sectionTitle}>Flash Sales</h2>
  </div>

  <div style={styles.timerContainer}>
    <TimerBox label="Days" value={timeLeft.days} />
    <div style={styles.timeColon}>:</div>
    <TimerBox label="Hours" value={timeLeft.hours} />
    <div style={styles.timeColon}>:</div>
    <TimerBox label="Mins" value={timeLeft.mins} />
    <div style={styles.timeColon}>:</div>
    <TimerBox label="Secs" value={timeLeft.secs} />
  </div>
</div>

        {loading ? (
          <div style={styles.loadingText}><p>Loading products...</p></div>
        ) : (
          <div style={styles.productGrid}>
            {flashProducts.length === 0 ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>No flash products available</p>
            ) : (
              flashProducts.slice(0, 4).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  badge={`-${product.discount_percent || 25}%`}
                  isInWishlist={isInWishlist(product.id)}
                  handleWishlist={handleWishlist}
                  addToCart={addToCart}
                  navigate={navigate}
                  renderStars={renderStars}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* NEW ARRIVALS */}
      <Section title="New Arrivals" products={newArrivals} {...{isInWishlist, handleWishlist, addToCart, navigate, renderStars}} />

      {/* BEST SELLERS */}
      <Section title="Best Sellers" products={bestSellers} {...{isInWishlist, handleWishlist, addToCart, navigate, renderStars}} />
      
      {/* FEATURED PRODUCTS */}
      <div style={styles.sectionContainer}>
        <div style={styles.sectionLabel}>
          <div style={styles.redBox}></div>
          <span style={{ color: BrandColors.accent, fontWeight: "bold" }}>Featured Products</span>
        </div>
        <h2 style={styles.sectionTitle}>Recommended For You</h2>
        <div style={styles.productGrid}>
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              vendor={product.business_name}
              isInWishlist={isInWishlist(product.id)}
              handleWishlist={handleWishlist}
              addToCart={addToCart}
              navigate={navigate}
              renderStars={renderStars}
            />
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div style={styles.serviceSection}>
        <ServiceItem Icon={Truck} title="FREE AND FAST DELIVERY" desc="Free delivery for all orders over ETB 2000" />
        <ServiceItem Icon={Headset} title="24/7 CUSTOMER SERVICE" desc="Friendly 24/7 customer support" />
        <ServiceItem Icon={ShieldCheck} title="MONEY BACK GUARANTEE" desc="We return money within 30 days" />
      </div>

      <div style={{ textAlign: "center", margin: "60px 0" }}>
        <Link to="/shop">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={styles.viewAllBtn}>
            View All Products
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS TO KEEP CODE CLEAN ---
const TimerBox = ({ label, value }) => (
  <div style={styles.timeBox}>
    <span style={{ fontSize: '10px', color: BrandColors.textMuted }}>{label}</span>
    <h4 style={{ margin: 0, fontSize: '18px' }}>{value}</h4>
  </div>
);

const ProductCard = ({ product, badge, vendor, isInWishlist, handleWishlist, addToCart, navigate, renderStars }) => (
  <motion.div 
    whileHover={{ y: -5 }} 
    style={styles.productCard}
  >
    <div style={styles.imageContainer}>
      {badge && <span style={styles.badge}>{badge}</span>}
      
      <div style={styles.floatingActions}>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            handleWishlist(product); 
          }} 
          style={{ 
            ...styles.actionBtn, 
            // The color of the button border/container
            color: isInWishlist ? BrandColors.danger : BrandColors.textMuted 
          }}
        >
          <Heart 
            size={18} 
            // Logic fixed: Fill is danger red ONLY if in wishlist, otherwise none (empty)
            fill={isInWishlist ? BrandColors.danger : "none"} 
            stroke={isInWishlist ? BrandColors.danger : "currentColor"}
          />
        </button>
        <button onClick={() => navigate(`/product/${product.id}`)} style={styles.actionBtn}>
          <Eye size={18} />
        </button>
      </div>

      <img 
        src={product.images?.[0] || "https://placehold.jp/200x200.png"} 
        alt={product.name} 
        style={styles.productImg} 
        onClick={() => navigate(`/product/${product.id}`)} 
      />
      
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          addToCart(product); 
        }} 
        style={styles.addBtn}
      >
        <ShoppingCart size={16} /> Add To Cart
      </button>
    </div>

    <h4 style={styles.productName}>{product.name}</h4>
    {renderStars(product.avg_rating, product.review_count)}
    
    <div style={styles.priceRow}>
      <div>
        <span style={styles.currentPrice}>ETB {Number(product.price || 0).toLocaleString()}</span>
      </div>
      {vendor && <span style={styles.vendorTag}>{vendor}</span>}
    </div>
  </motion.div>
);

const Section = ({ title, products, ...props }) => (
  <div style={styles.sectionContainer}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    <div style={styles.productGrid}>
      {products.slice(0, 4).map((p) => (
        <ProductCard 
          key={p.id} 
          product={p} 
          {...props} 
          isInWishlist={props.isInWishlist(p.id)} 
        />
      ))}
    </div>
  </div>
);
const ServiceItem = ({ Icon, title, desc }) => (
  <div style={styles.serviceItem}>
    <div style={styles.iconCircle}><Icon size={28} color={BrandColors.primary} /></div>
    <h4 style={styles.serviceH}>{title}</h4>
    <p style={styles.serviceP}>{desc}</p>
  </div>
);

// --- UPDATED BRAND STYLES ---
const styles = {
  heroWrapper: { display: "flex", gap: "25px",flexWrap: "wrap", padding: "20px 6%" },
  sidebar: { width: "240px", background: BrandColors.bgLight, borderRadius: "16px", padding: "15px", border: "1px solid #eef2f6" },
  sidebarItem: { padding: "12px", display: "flex", justifyContent: "space-between", cursor: "pointer", fontSize: "14px", fontWeight: "500", borderRadius: "8px", transition: "0.2s" },
  bannerContainer: { flex: 1, position: 'relative', overflow: 'hidden', borderRadius: "20px" },
  heroBanner: { height: "100%", display: "flex", alignItems: "center", background: BrandColors.secondary, color: "white", padding: "50px", position: 'relative' },
  heroH1: { fontSize: "42px", fontWeight: "800", margin: "20px 0", lineHeight: "1.2" },
  shopNowBtn: { background: BrandColors.primary, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' },
  heroImg: { maxWidth: "350px", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" },
  sectionContainer: { padding: "40px 6%" },
  sectionLabel: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" },
  redBox: { width: "12px", height: "25px", background: BrandColors.primary, borderRadius: "4px" },
  sectionTitle: { fontSize: "32px", fontWeight: "800", color: BrandColors.secondary },
  flexHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "25px",width: "100%" },
  
  productCard: { border: "1px solid #f1f5f9", borderRadius: "16px", padding: "15px", transition: "0.3s", background: '#fff',display: "flex",flexDirection: "column",justifyContent: "space-between" },
  imageContainer: { position: "relative", background: "#f8fafc", borderRadius: "12px", padding: "10px", overflow: "hidden" },
  badge: { position: "absolute", top: "10px", left: "10px", background: BrandColors.danger, color: "white", padding: "4px 10px", fontSize: "12px", fontWeight: "700", borderRadius: "8px", zIndex: 2 },
  floatingActions: { position: "absolute", right: "10px", top: "10px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 2 },
  actionBtn: { border: "none", background: "white", padding: "8px", borderRadius: "50%", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
  productImg: { width: "100%", height: "200px", objectFit: "contain" },
  addBtn: { width: "100%", marginTop: "12px", padding: "12px", background: BrandColors.secondary, color: "white", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  productName: { marginTop: "15px", fontSize: "16px", fontWeight: "600", color: BrandColors.secondary },
  starRow: { display: 'flex', alignItems: 'center', gap: '4px', margin: '8px 0' },
  starCount: { fontSize: '12px', color: BrandColors.textMuted, marginLeft: '5px' },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" },
  currentPrice: { fontWeight: "800", fontSize: "18px", color: BrandColors.primary },
  originalPrice: { textDecoration: 'line-through', color: BrandColors.textMuted, marginLeft: '10px', fontSize: '14px' },
  vendorTag: { fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: BrandColors.textMuted },
  serviceSection: { display: "flex", justifyContent: "space-around", padding: "60px 6%", background: BrandColors.bgLight, margin: "40px 0" },
  serviceItem: { textAlign: "center", maxWidth: "250px" },
  iconCircle: { background: "white", width: "70px", height: "70px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" },
  serviceH: { fontSize: "16px", fontWeight: "700", marginBottom: "8px" },
  serviceP: { fontSize: "13px", color: BrandColors.textMuted, lineHeight: "1.5" },
  viewAllBtn: { padding: "16px 40px", background: BrandColors.primary, color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "16px" },
  timerContainer: { display: 'flex', alignItems: 'center', gap: '15px' },
  timeBox: { textAlign: 'center', minWidth: '55px', background: 'white', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  timeColon: { color: BrandColors.danger, fontSize: '24px', fontWeight: 'bold' },
  dotContainer: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' },
  dotStyle: { width: '12px', height: '6px', borderRadius: '10px', cursor: 'pointer', transition: '0.3s' }
};

export default Home;
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Heart, Search, LogOut, User, 
  ChevronDown, Settings, Package, LayoutDashboard, ShieldCheck, Bell
} from 'lucide-react'; 
import { useAuth } from '../context/AuthContext'; 
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

// Core Brand Colors - Use these throughout your app for consistency
const BrandColors = {
  primary: '#10b981', // Emerald 500
  primaryDark: '#059669',
  secondary: '#0f172a', // Slate 900
  textLight: '#64748b',
  bgLight: '#f8fafc',
  danger: '#ef4444',
  white: '#ffffff'
};

const Navbar = () => {
  const { user, logout } = useAuth(); 
  const { cart, wishlist } = useCart(); 
  const { notifications } = useNotifications(); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowDropdown(false);
  }, [location]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchTerm)}`);
    }
  };

  const getProfileImage = () => {
    if (!user?.profile_pic) return null;
    const pic = user.profile_pic;
    if (pic.startsWith('http') || pic.startsWith('data:image')) return pic;
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return pic.startsWith('/') ? `${backendUrl}${pic}` : `${backendUrl}/${pic}`;
  };

  return (
    <nav style={styles.navContainer}>
      {/* Brand Logo */}
      <Link to="/" style={styles.logoStyle}>
        <motion.span 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          style={{ color: BrandColors.primary }}
        >Eth</motion.span>market
      </Link>
      
      {/* Navigation Links */}
      <ul style={styles.navLinksList}>
        {['/', '/shop', '/contact', '/about'].map((path) => (
          <li key={path}>
            <Link 
              to={path} 
              style={location.pathname === path ? styles.activeLink : styles.linkStyle}
            >
              {path === '/' ? 'Home' : path.substring(1).charAt(0).toUpperCase() + path.slice(2)}
              {location.pathname === path && (
                <motion.div layoutId="nav-underline" style={styles.activeUnderline} />
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div style={styles.actionsGroup}>
        <div style={styles.searchWrapper}>
          <input 
            type="text" 
            placeholder="Search products..." 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
          <Search
            size={18}
            style={styles.searchIcon}
            onClick={() => searchTerm.trim() && navigate(`/shop?keyword=${encodeURIComponent(searchTerm)}`)}
          />
        </div>

        {/* Dynamic Icons with Badges */}
        <NavIcon to="/notifications" icon={<Bell size={22} />} count={unreadCount} active={location.pathname === '/notifications'} badgeColor="#f59e0b" />
        <NavIcon to="/wishlist" icon={<Heart size={22} />} count={wishlist?.length} active={location.pathname === '/wishlist'} />
        <NavIcon to="/cart" icon={<ShoppingCart size={22} />} count={cart?.length} active={location.pathname === '/cart'} />

        {/* User Menu */}
        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={styles.profileTrigger} 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div style={styles.avatarStyle}>
                {user.profile_pic ? (
                  <img src={getProfileImage()} alt="profile" style={styles.avatarImg} />
                ) : (
                  <User size={16} />
                )}
              </div>
              <span style={styles.userNameText}>{user.name ? user.name.split(' ')[0] : 'Account'}</span>
              <ChevronDown size={14} style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: '0.3s ease' }} />
            </motion.div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={styles.dropdownMenu}
                >
                  <div style={styles.dropdownHeader}>
                    <p style={styles.headerName}>{user.name || 'User'}</p>
                    <p style={styles.headerEmail}>{user.email}</p>
                    <span style={styles.roleBadge}>{user.role?.toUpperCase()}</span>
                  </div>
                  
                  <div style={styles.divider} />
                  
                  {user.role === 'admin' && (
                    <>
                      <DropdownLink to="/admin" icon={<ShieldCheck size={16} color={BrandColors.primary} />} label="Admin Dashboard" />
                      <DropdownLink to="/admin/products" icon={<Package size={16} />} label="Manage Products" />
                    </>
                  )}
                  
                  {user.role === 'seller' && (
                    <>
                      <DropdownLink to="/seller" icon={<LayoutDashboard size={16} color={BrandColors.primary} />} label="Seller Dashboard" />
                      <DropdownLink to="/seller/products" icon={<Package size={16} />} label="My Products" />
                    </>
                  )}
                  
                  <DropdownLink to="/profile" icon={<Settings size={16} />} label="Settings" />
                  <DropdownLink to="/orders" icon={<Package size={16} />} label="My Orders" />
                  
                  <div style={styles.divider} />
                  
                  <button onClick={() => { logout(); navigate('/'); }} style={styles.logoutBtn}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div style={styles.authButtons}>
            <Link to="/login" style={styles.loginLink}>Log In</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/register" style={styles.signupBtn}>Get Started</Link>
            </motion.div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Reusable Components for Cleanliness
const NavIcon = ({ to, icon, count, active, badgeColor = '#ef4444' }) => (
  <Link to={to} style={styles.iconLink}>
    <motion.div whileHover={{ y: -2 }} style={{ color: active ? BrandColors.primary : BrandColors.secondary }}>
      {icon}
    </motion.div>
    {count > 0 && (
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ ...styles.badgeStyle, background: badgeColor }}>
        {count}
      </motion.span>
    )}
  </Link>
);

const DropdownLink = ({ to, icon, label }) => (
  <Link to={to} style={styles.dropdownLink}>
    {icon} {label}
  </Link>
);

const styles = {
  navContainer: { 
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
    padding: '12px 6%', borderBottom: '1px solid #f1f5f9', background: '#ffffff', 
    position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' 
  },
  logoStyle: { textDecoration: 'none', color: BrandColors.secondary, fontWeight: '800', fontSize: '24px', letterSpacing: '-1px' },
  navLinksList: { display: 'flex', listStyle: 'none', gap: '30px', margin: 0, padding: 0 },
  linkStyle: { textDecoration: 'none', color: BrandColors.textLight, fontSize: '14px', fontWeight: '500', transition: '0.2s', position: 'relative' },
  activeLink: { textDecoration: 'none', color: BrandColors.primary, fontSize: '14px', fontWeight: '700', position: 'relative' },
  activeUnderline: { position: 'absolute', bottom: '-22px', left: 0, right: 0, height: '3px', background: BrandColors.primary, borderRadius: '10px 10px 0 0' },
  actionsGroup: { display: 'flex', alignItems: 'center', gap: '22px' },
  searchWrapper: { position: 'relative', background: '#f1f5f9', borderRadius: '12px', padding: '2px 12px', transition: '0.3s' },
  searchInput: { border: 'none', background: 'transparent', padding: '10px 25px 10px 5px', fontSize: '13px', outline: 'none', width: '180px' },
  searchIcon: { position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: '#94a3b8' },
  iconLink: { position: 'relative', display: 'flex', alignItems: 'center' },
  badgeStyle: { position: 'absolute', top: '-10px', right: '-10px', color: 'white', borderRadius: '50%', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', border: '2px solid white' },
  profileTrigger: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', padding: '5px 12px', borderRadius: '50px', border: '1px solid #e2e8f0' },
  avatarStyle: { background: BrandColors.primary, color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  userNameText: { fontSize: '13px', fontWeight: '600', color: BrandColors.secondary },
  dropdownMenu: { position: 'absolute', top: '55px', right: 0, background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '16px', width: '240px', padding: '10px', border: '1px solid #f1f5f9' },
  dropdownHeader: { padding: '12px' },
  headerName: { margin: 0, fontWeight: '700', fontSize: '15px' },
  headerEmail: { margin: 0, fontSize: '12px', color: BrandColors.textLight },
  roleBadge: { fontSize: '10px', background: '#ecfdf5', color: BrandColors.primaryDark, padding: '2px 8px', borderRadius: '6px', marginTop: '8px', display: 'inline-block', fontWeight: 'bold' },
  dropdownLink: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', textDecoration: 'none', color: '#475569', fontSize: '13px', borderRadius: '10px', transition: '0.2s' },
  divider: { height: '1px', background: '#f1f5f9', margin: '8px 0' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: '#fff1f2', color: BrandColors.danger, border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '10px', fontSize: '13px', fontWeight: '600' },
  authButtons: { display: 'flex', alignItems: 'center', gap: '15px' },
  loginLink: { textDecoration: 'none', color: BrandColors.textLight, fontWeight: '600', fontSize: '14px' },
  signupBtn: { textDecoration: 'none', background: BrandColors.primary, color: 'white', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }
};

export default Navbar;
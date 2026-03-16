import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';

// Consistent Brand Palette
const BrandColors = {
  primary: '#10b981',
  secondary: '#0f172a',
  slate800: '#1e293b',
  textGray: '#94a3b8',
  white: '#ffffff'
};

const Footer = () => {
  return (
    <footer style={styles.footerStyle}>
      <div style={styles.gridContainer}>
        {/* Column 1: Brand & Subscription */}
        <div style={styles.columnStyle}>
          <h2 style={styles.headerStyle}>
            <span style={{ color: BrandColors.primary }}>Eth</span>market
          </h2>
          <p style={styles.subHeaderStyle}>Join our Newsletter</p>
          <p style={styles.textStyle}>Get 10% off your first order and stay updated.</p>
          <div style={styles.inputWrapper}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              style={styles.inputStyle} 
            />
            <motion.div 
              whileHover={{ scale: 1.1, color: BrandColors.primary }}
              style={styles.sendIconWrapper}
            >
              <Send size={18} />
            </motion.div>
          </div>
        </div>

        {/* Column 2: Support */}
        <div style={styles.columnStyle}>
          <h3 style={styles.headerStyleSmall}>Support</h3>
          <p style={styles.textStyle}>123 Bole Road, Addis Ababa</p>
          <p style={styles.textStyle}>support@ethmarket.com</p>
          <p style={styles.textStyle}>+251 911 000 000</p>
        </div>

        {/* Column 3: Quick Links */}
        <div style={styles.columnStyle}>
          <h3 style={styles.headerStyleSmall}>Account</h3>
          <FooterLink to="/login">Login / Register</FooterLink>
          <FooterLink to="/cart">My Cart</FooterLink>
          <FooterLink to="/wishlist">Wishlist</FooterLink>
          <FooterLink to="/shop">Browse Shop</FooterLink>
        </div>
      </div>

      <div style={styles.middleBar}>
        <div style={styles.socialWrapper}>
          <SocialIcon Icon={Facebook} />
          <SocialIcon Icon={Twitter} />
          <SocialIcon Icon={Instagram} />
          <SocialIcon Icon={Linkedin} />
        </div>

        {/* Secured Payments Section */}
        <div style={styles.paymentContainer}>
          <span style={styles.paymentLabel}>Secure Payments via Chapa:</span>
          <div style={styles.logoFlex}>
            <PaymentBadge color="#005CB9" text="telebirr" />
            <PaymentBadge color="#6c5ce7" text="CHAPA" />
            <PaymentBadge color="#4b2c83" text="CBE" />
          </div>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <p style={styles.copyrightText}>
          © {new Date().getFullYear()} Ethmarket. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// --- Helper Components ---
const FooterLink = ({ to, children }) => (
  <motion.div whileHover={{ x: 5 }}>
    <Link to={to} style={styles.linkStyle}>{children}</Link>
  </motion.div>
);

const SocialIcon = ({ Icon }) => (
  <motion.div 
    whileHover={{ y: -5, color: BrandColors.primary }} 
    style={styles.socialIcon}
  >
    <Icon size={20} />
  </motion.div>
);

const PaymentBadge = ({ color, text }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    style={{ ...styles.badge, background: color }}
  >
    <span style={styles.badgeText}>{text}</span>
  </motion.div>
);

const styles = {
  footerStyle: { 
    background: BrandColors.secondary, 
    color: BrandColors.white, 
    padding: '80px 8% 30px 8%', 
    marginTop: '100px',
    borderTop: `4px solid ${BrandColors.primary}` // Top accent bar
  },
  gridContainer: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '50px', 
    marginBottom: '60px' 
  },
  columnStyle: { display: 'flex', flexDirection: 'column', gap: '16px' },
  headerStyle: { fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-1px' },
  headerStyleSmall: { fontSize: '18px', fontWeight: '700', margin: 0, color: BrandColors.white },
  subHeaderStyle: { fontSize: '16px', fontWeight: '600', marginTop: '5px', color: BrandColors.primary },
  textStyle: { fontSize: '14px', color: BrandColors.textGray, margin: 0, lineHeight: '1.6' },
  linkStyle: { fontSize: '14px', color: BrandColors.textGray, textDecoration: 'none', transition: '0.2s' },
  
  inputWrapper: { position: 'relative', marginTop: '10px', width: '100%', maxWidth: '280px' },
  inputStyle: { 
    background: BrandColors.slate800, 
    border: '1px solid #334155', 
    borderRadius: '12px', 
    padding: '12px 45px 12px 15px', 
    color: 'white', 
    width: '100%', 
    outline: 'none',
    fontSize: '14px'
  },
  sendIconWrapper: { position: 'absolute', right: '15px', top: '12px', cursor: 'pointer', color: BrandColors.textGray },
  
  middleBar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: '30px', 
    padding: '40px 0', 
    borderTop: '1px solid #1e293b' 
  },
  socialWrapper: { display: 'flex', gap: '25px', alignItems: 'center' },
  socialIcon: { cursor: 'pointer', color: BrandColors.textGray, transition: '0.3s' },
  
  paymentContainer: { display: 'flex', alignItems: 'center', gap: '20px' },
  paymentLabel: { fontSize: '13px', color: BrandColors.textGray, fontWeight: '500' },
  logoFlex: { display: 'flex', gap: '12px', alignItems: 'center' },
  
  badge: {
    padding: '6px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '85px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
  },
  badgeText: {
    color: 'white',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },

  bottomBar: { borderTop: '1px solid #1e293b', paddingTop: '30px', textAlign: 'center' },
  copyrightText: { color: '#475569', fontSize: '13px', fontWeight: '400' }
};

export default Footer;
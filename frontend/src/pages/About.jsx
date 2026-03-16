import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Zap, Globe, Heart } from 'lucide-react';

// Official Brand Colors from your Navbar
const BrandColors = {
  primary: '#10b981', // Emerald 500
  secondary: '#0f172a', // Slate 900
  textLight: '#64748b',
  bgLight: '#f8fafc',
  white: '#ffffff'
};

const About = () => {
  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.contentWrapper}
      >
        {/* HEADER SECTION - Brand styling applied to "Ethmarket" */}
        <div style={styles.headerSection}>
          <h1 style={styles.title}>
            About <span style={{ color: BrandColors.primary }}>Eth</span><span style={{ color: BrandColors.secondary }}>market</span>
          </h1>
          <div style={styles.underline} />
        </div>

        {/* MAIN CONTENT ROW */}
        <div style={styles.mainRow}>
          <div style={styles.textColumn}>
            <p style={styles.paragraph}>
              Welcome to <strong style={{ color: BrandColors.secondary }}>
                <span style={{ color: BrandColors.primary }}>Eth</span>market
              </strong>, Ethiopia's premier multi-vendor e-commerce platform. 
              Our mission is to connect local businesses with customers across the nation through 
              a seamless, secure, and modern shopping experience.
            </p>
            <p style={{ ...styles.paragraph, marginTop: '20px' }}>
              Whether you are a seller looking to expand your reach or a shopper searching for 
              the latest electronics and fashion, we provide the tools and security (powered by Chapa) 
              to make every transaction effortless.
            </p>

            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <ShieldCheck color={BrandColors.primary} size={24} />
                <span style={styles.statText}>Secure Payments</span>
              </div>
              <div style={styles.statItem}>
                <Users color={BrandColors.primary} size={24} />
                <span style={styles.statText}>Verified Sellers</span>
              </div>
            </div>
          </div>

          <div style={styles.imageColumn}>
            <motion.div whileHover={{ scale: 1.02 }} style={styles.imageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" 
                alt="Our Team" 
                style={styles.image} 
              />
            </motion.div>
          </div>
        </div>

        {/* CORE VALUES SECTION (New Add-on) */}
        <div style={styles.valuesSection}>
          <h2 style={styles.sectionTitle}>Our Core Values</h2>
          <div style={styles.valuesGrid}>
            <ValueCard 
              icon={<Zap size={28} />} 
              title="Innovation" 
              desc="Bringing the latest tech to the Ethiopian marketplace." 
            />
            <ValueCard 
              icon={<Globe size={28} />} 
              title="Community" 
              desc="Empowering local vendors to grow their business." 
            />
            <ValueCard 
              icon={<Heart size={28} />} 
              title="Integrity" 
              desc="Ensuring 100% authentic reviews and secure deals." 
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Reusable Value Card for consistency
const ValueCard = ({ icon, title, desc }) => (
  <motion.div whileHover={{ y: -10 }} style={styles.valueCard}>
    <div style={styles.valueIcon}>{icon}</div>
    <h3 style={styles.valueTitle}>{title}</h3>
    <p style={styles.valueDesc}>{desc}</p>
  </motion.div>
);

// --- STYLES ---
const styles = {
  container: { 
    padding: '80px 8%', 
    background: BrandColors.bgLight, 
    minHeight: '80vh',
    fontFamily: "'Inter', sans-serif" 
  },
  contentWrapper: { maxWidth: '1200px', margin: '0 auto' },
  headerSection: { marginBottom: '50px' },
  title: { 
    fontSize: '42px', 
    fontWeight: '800', 
    margin: 0,
    letterSpacing: '-1.5px'
  },
  underline: {
    width: '60px',
    height: '5px',
    background: BrandColors.primary,
    borderRadius: '10px',
    marginTop: '10px'
  },
  mainRow: { display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' },
  textColumn: { flex: 1, minWidth: '350px' },
  paragraph: { fontSize: '18px', lineHeight: '1.8', color: BrandColors.textLight },
  imageColumn: { flex: 1, minWidth: '350px' },
  imageWrapper: {
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    border: `8px solid ${BrandColors.white}`
  },
  image: { width: '100%', display: 'block' },
  statsGrid: { display: 'flex', gap: '20px', marginTop: '40px' },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: BrandColors.white,
    padding: '12px 20px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
  },
  statText: { fontSize: '14px', fontWeight: '700', color: BrandColors.secondary },
  
  // Values Section Styles
  valuesSection: { marginTop: '100px', textAlign: 'center' },
  sectionTitle: { fontSize: '30px', fontWeight: '800', color: BrandColors.secondary, marginBottom: '40px' },
  valuesGrid: { display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' },
  valueCard: {
    flex: '1',
    minWidth: '280px',
    background: BrandColors.white,
    padding: '40px 30px',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    border: '1px solid #f1f5f9',
    textAlign: 'center'
  },
  valueIcon: {
    color: BrandColors.primary,
    marginBottom: '20px',
    display: 'inline-block',
    padding: '15px',
    background: '#ecfdf5',
    borderRadius: '16px'
  },
  valueTitle: { fontSize: '20px', fontWeight: '700', color: BrandColors.secondary, marginBottom: '12px' },
  valueDesc: { fontSize: '15px', color: BrandColors.textLight, lineHeight: '1.6' }
};

export default About;
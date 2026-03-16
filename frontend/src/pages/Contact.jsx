import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from 'lucide-react';

// Using your official BrandColors for 100% consistency
const BrandColors = {
  primary: '#10b981', // Emerald 500
  primaryDark: '#059669',
  secondary: '#0f172a', // Slate 900
  textLight: '#64748b',
  bgLight: '#f8fafc',
  danger: '#ef4444',
  white: '#ffffff'
};

const Contact = () => {
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call for your exam demo
    setTimeout(() => {
      setLoading(false);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus(null), 5000);
    }, 1500);
  };

  return (
    <div style={styles.containerStyle}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.contentWrapper}
      >
        
        {/* LEFT COLUMN: CONTACT INFO */}
        <div style={styles.infoSidebar}>
          <div style={styles.infoCard}>
            <div style={styles.iconHeader}>
              <div style={styles.iconCircle}><Phone size={18} /></div>
              <span>Call To Us</span>
            </div>
            <p style={styles.infoText}>We are available 24/7, 7 days a week.</p>
            <p style={styles.infoHighlight}>+251 911 22 33 44</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.infoCard}>
            <div style={styles.iconHeader}>
              <div style={styles.iconCircle}><Mail size={18} /></div>
              <span>Write To Us</span>
            </div>
            <p style={styles.infoText}>Fill out our form and we will contact you within 24 hours.</p>
            <p style={styles.infoHighlight}>support@ethmarket.com</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.infoCard}>
            <div style={styles.iconHeader}>
              <div style={styles.iconCircle}><MapPin size={18} /></div>
              <span>Our Office</span>
            </div>
            <p style={styles.infoText}>Ethmarket Plaza, Bole Road</p>
            <p style={styles.infoHighlight}>Addis Ababa, Ethiopia</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.infoCard}>
            <div style={styles.iconHeader}>
              <div style={styles.iconCircle}><Clock size={18} /></div>
              <span>Business Hours</span>
            </div>
            <p style={styles.infoText}>Mon - Fri: 8:00 AM - 6:00 PM</p>
            <p style={styles.infoText}>Sat: 9:00 AM - 1:00 PM</p>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACT FORM */}
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Get in Touch</h2>
          <p style={styles.formSubtitle}>
            Have questions about selling or shopping on Ethmarket? We're here to help.
          </p>

          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              style={styles.successBanner}
            >
              <CheckCircle size={18} /> Thank you! Your message has been sent successfully.
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputRow}>
              <div style={styles.fieldGroup}>
                <input 
                  name="name" 
                  placeholder="Your Name *" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.inputStyle} 
                />
              </div>
              <div style={styles.fieldGroup}>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Your Email *" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.inputStyle} 
                />
              </div>
              <div style={styles.fieldGroup}>
                <input 
                  name="phone" 
                  placeholder="Your Phone *" 
                  required 
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.inputStyle} 
                />
              </div>
            </div>

            <textarea 
              name="message" 
              placeholder="How can we help you?" 
              required 
              value={formData.message}
              onChange={handleChange}
              style={styles.textareaStyle}
            />

            <div style={{ textAlign: 'right' }}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading} 
                style={styles.submitBtnStyle(loading)}
              >
                {loading ? "Sending..." : "Send Message"}
                {!loading && <Send size={18} style={{ marginLeft: '10px' }} />}
              </motion.button>
            </div>
          </form>
        </div>

        {/* MAP SECTION */}
        <div style={styles.mapContainer}>
          <iframe 
            title="Ethmarket Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126115.1152554746!2d38.7095627!3d8.9806034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24c49!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1710000000000!5m2!1sen!2set" 
            style={styles.mapIframe}
            allowFullScreen="" 
            loading="lazy" 
          ></iframe>
        </div>

      </motion.div>
    </div>
  );
};

// --- STYLES OBJECT (Matching Navbar Design Language) ---
const styles = {
  containerStyle: {
    background: BrandColors.bgLight,
    padding: '60px 6%',
    minHeight: '80vh',
    fontFamily: "'Inter', sans-serif"
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap'
  },
  infoSidebar: {
    flex: '1',
    minWidth: '300px',
    background: BrandColors.white,
    padding: '40px 30px',
    borderRadius: '20px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
    border: '1px solid #f1f5f9'
  },
  formCard: {
    flex: '2.5',
    minWidth: '350px',
    background: BrandColors.white,
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
    border: '1px solid #f1f5f9'
  },
  iconHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    fontWeight: '700',
    color: BrandColors.secondary,
    marginBottom: '15px'
  },
  iconCircle: {
    width: '36px',
    height: '36px',
    background: '#ecfdf5',
    color: BrandColors.primary,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  divider: { height: '1px', background: '#f1f5f9', margin: '25px 0' },
  infoText: { fontSize: '14px', color: BrandColors.textLight, marginBottom: '8px', lineHeight: '1.5' },
  infoHighlight: { fontSize: '14px', color: BrandColors.secondary, fontWeight: '700' },
  infoCard: { marginBottom: '10px' },
  formTitle: { fontSize: '24px', fontWeight: '800', color: BrandColors.secondary, marginBottom: '8px', letterSpacing: '-0.5px' },
  formSubtitle: { color: BrandColors.textLight, marginBottom: '30px', fontSize: '14px', fontWeight: '500' },
  inputRow: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
  fieldGroup: { flex: 1, minWidth: '150px' },
  inputStyle: {
    width: '100%',
    padding: '12px 16px',
    background: '#f1f5f9',
    border: '1px solid transparent',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    outline: 'none',
    transition: '0.2s',
    boxSizing: 'border-box'
  },
  textareaStyle: {
    width: '100%',
    height: '160px',
    padding: '16px',
    background: '#f1f5f9',
    border: '1px solid transparent',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    outline: 'none',
    resize: 'none',
    marginBottom: '20px',
    boxSizing: 'border-box'
  },
  submitBtnStyle: (loading) => ({
    padding: '14px 35px',
    background: BrandColors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: '0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    opacity: loading ? 0.7 : 1
  }),
  successBanner: {
    background: '#ecfdf5',
    color: BrandColors.primaryDark,
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '25px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #d1fae5'
  },
  mapContainer: {
    width: '100%',
    height: '400px',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid #f1f5f9',
    marginTop: '20px'
  },
  mapIframe: { width: '100%', height: '100%', border: 'none' }
};

export default Contact;
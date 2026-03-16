import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api'
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Mail, Lock, ArrowLeft } from 'lucide-react'; // Removed unused CheckSquare

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  // Use environment variable for API URL
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login',{ 
        email, 
        password, 
        rememberMe 
      });
      
      const { token, refreshToken, user } = res.data;

      // Check if suspended
      if (user.status === 'suspended') {
        setError("Your account has been suspended. Please contact administration.");
        setLoading(false);
        return;
      }

      // Check seller approval
      if (user.role === 'seller' && !user.is_approved) {
        setError("Seller account awaiting admin approval.");
        setLoading(false);
        return;
      }

      // Set global header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Store refresh token (Remember Me)
      if (rememberMe && refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Login via context
      login(token, user, rememberMe);

      // Navigation
      if (location.state?.from) {
        navigate(from, { replace: true });
      } else {
        const userRole = user.role;
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'seller') navigate('/seller');
        else navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage("Success! Check console for reset link (production: email sent).");
      setTimeout(() => {
        setIsForgotMode(false);
        setMessage('');
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Account not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={glassCard}>
        {/* BRANDING */}
        <div style={logoSection}>
           <div style={logoIcon}><ShoppingBag size={24} color="white" /></div>
           <h2 style={brandName}>ETHMARKET</h2>
        </div>

        <h3 style={headerStyle}>
         {isForgotMode ? "Reset Password" : "Welcome Back"}
        </h3>
        
        <p style={subHeaderStyle}>
         {isForgotMode 
           ? "Enter your email to receive a recovery link." 
           : "Sign in to access your Ethmarket account."}
        </p>

        {error && <div style={errorBanner}>{error}</div>}
        {message && <div style={successBanner}>{message}</div>}

        <form onSubmit={isForgotMode ? handleForgotPassword : handleLogin}>
          <div style={inputGroup}>
            <label style={labelStyle}>Email Address</label>
            <div style={inputWrapper}>
               <Mail size={18} style={iconStyle} />
               <input 
                 type="email" 
                 required 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)} 
                 style={inputStyle}
                 placeholder="name@ethmarket.com"
               />
            </div>
          </div>
          
          {!isForgotMode && (
            <>
              <div style={inputGroup}>
                <label style={labelStyle}>Password</label>
                <div style={inputWrapper}>
                   <Lock size={18} style={iconStyle} />
                   <input 
                     type="password" 
                     required 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)} 
                     style={inputStyle}
                     placeholder="••••••••"
                   />
                </div>
              </div>
              
              <div style={rowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={checkboxStyle}
                  />
                  <label htmlFor="remember" style={{fontSize:'14px', color:'#64748b', cursor:'pointer'}}>
                    Remember me (30 days)
                  </label>
                </div>
                <span 
                  onClick={() => { setIsForgotMode(true); setError(''); setMessage(''); }} 
                  style={forgotLinkStyle}
                >
                  Forgot Password?
                </span>
              </div>
            </>
          )}

          <div style={{ marginTop: '30px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={submitBtnStyle(loading)}
            >
              {loading ? "Verifying..." : (isForgotMode ? "Send Reset Link" : "Login to Account")}
            </button>
            
            {isForgotMode && (
              <button 
                type="button" 
                onClick={() => setIsForgotMode(false)}
                style={backBtnStyle}
              >
                <ArrowLeft size={14} /> Back to Login
              </button>
            )}
          </div>
        </form>

        {!isForgotMode && (
         <p style={footerTextStyle}>
           New to our marketplace? <Link to="/register" style={signupLinkStyle}>Join Ethmarket</Link>
         </p>
        )}
      </div>
    </div>
  );
};

// ======================================
// YOUR ORIGINAL STYLES (UNCHANGED)
// ======================================
const containerStyle = {
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f1f5f9',
  fontFamily: "'Inter', sans-serif"
};

const glassCard = {
  width: '100%',
  maxWidth: '420px',
  padding: '40px',
  background: 'white',
  borderRadius: '24px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  border: '1px solid #e2e8f0'
};

const logoSection = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  marginBottom: '30px', 
  justifyContent: 'center' 
};

const logoIcon = { 
  background: '#3b82f6', 
  padding: '8px', 
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const brandName = { 
  fontSize: '22px', 
  fontWeight: '800', 
  margin: 0, 
  letterSpacing: '-0.5px',
  color: '#0f172a' 
};

const headerStyle = { 
  fontSize: '24px', 
  fontWeight: '700', 
  marginBottom: '8px', 
  textAlign: 'center',
  color: '#0f172a'
};

const subHeaderStyle = { 
  color: '#64748b', 
  fontSize: '14px', 
  marginBottom: '30px', 
  textAlign: 'center' 
};

const inputGroup = { marginBottom: '20px' };

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '700',
  color: '#475569',
  marginBottom: '8px'
};

const inputWrapper = { position: 'relative' };

const iconStyle = { 
  position: 'absolute', 
  left: '15px', 
  top: '13px', 
  color: '#94a3b8' 
};

const inputStyle = {
  width: '100%',
  padding: '12px 15px 12px 45px',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  outline: 'none',
  fontSize: '14px',
  background: '#f8fafc',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease'
};

const errorBanner = {
  color: '#e11d48',
  background: '#fff1f2',
  padding: '12px',
  borderRadius: '10px',
  fontSize: '13px',
  marginBottom: '20px',
  textAlign: 'center',
  fontWeight: '600',
  border: '1px solid #fecdd3'
};

const successBanner = {
  color: '#166534',
  background: '#dcfce7',
  padding: '12px',
  borderRadius: '10px',
  fontSize: '13px',
  marginBottom: '20px',
  textAlign: 'center',
  fontWeight: '600',
  border: '1px solid #bbf7d0'
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '15px'
};

const checkboxStyle = { accentColor: '#3b82f6', cursor: 'pointer' };
const forgotLinkStyle = { color: '#3b82f6', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };

const submitBtnStyle = (loading) => ({
  width: '100%',
  padding: '16px',
  background: '#0f172a', 
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: '700',
  opacity: loading ? 0.7 : 1,
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease'
});

const backBtnStyle = {
  width: '100%',
  marginTop: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  background: 'transparent',
  color: '#64748b',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
};

const footerTextStyle = { marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#64748b' };
const signupLinkStyle = { color: '#3b82f6', fontWeight: '700', marginLeft: '5px', textDecoration: 'none' };

export default Login;
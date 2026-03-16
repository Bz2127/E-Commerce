import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, Lock, Building2, FileCheck, ArrowRight, ShoppingBag, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Register = ({ isSellerRegistration = false }) => {
  const [isSeller, setIsSeller] = useState(isSellerRegistration);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Success
  const [otp, setOtp] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', 
    password: '',
    businessName: '',
    licenseNumber: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    setIsSeller(isSellerRegistration);
  }, [isSellerRegistration]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  // ✅ FIXED: Correct endpoints + proper seller data
  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("FORM SUBMITTED");
  setLoading(true);
  setStatusMessage('');

  try {

    const endpoint = isSeller ? "register-seller" : "register";

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password
    };

 if (isSeller) {
  payload.business_name = formData.businessName.trim();
  payload.business_license = formData.licenseNumber.trim();

  // We check the payload keys we just created
  if (!payload.business_name || !payload.business_license) {
    setStatusMessage("Business name and license number are required.");
    setLoading(false);
    return;
  }
}

    const res = await axios.post(`/auth/${endpoint}`, payload, {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    setUserEmail(formData.email);
    setStep(2);
    setStatusMessage(res.data.message || "OTP sent successfully");

  } catch (err) {

    console.error("REGISTER ERROR:", err.response?.data);

    setStatusMessage(
      err.response?.data?.error ||
      "Registration failed. Check backend console."
    );

  } finally {
    setLoading(false);
  }
};

  // ✅ FIXED: Proper OTP verification + seller/customer flow
  const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Verify OTP (Using relative path to match your axios config)
    await axios.post('http://localhost:5000/api/auth/verify-otp', {
      email: userEmail,
      otp: otp.trim()
    });

    setStatusMessage("Verified successfully! ✅");
    
    if (isSeller) {
      setStep(3); // Show "Awaiting Approval"
    } else {
      // 2. Auto-login customer (Fixed Port to 5000)
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
        email: userEmail,
        password: formData.password
      });
      
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));
      
      // Navigate to Home
      navigate('/');
    }
    
  } catch (err) {
    console.error("VERIFY ERROR:", err.response?.data);
    setStatusMessage(err.response?.data?.error || "Invalid OTP. Check console.");
  } finally {
    setLoading(false);
  }
};

 
const handleResendOtp = async () => {
  setLoading(true);
  setStatusMessage("");

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/resend-otp",
      { email: userEmail },
      { headers: { "Content-Type": "application/json" } }
    );

    setStatusMessage(res.data?.message || "✅ New OTP sent!");
  } catch (err) {
    setStatusMessage(err.response?.data?.error || "❌ Failed to resend OTP");
  } finally {
    setLoading(false);
  }
};


  // ======================================
  // JSX + STYLES (UNCHANGED - PERFECT)
  // ======================================
  return (
    <div style={containerStyle}>
      <div style={glassCard}>
        {/* BRAND LOGO */}
        <div style={logoSection}>
          <div style={logoIcon}><ShoppingBag size={24} color="white" /></div>
          <h2 style={brandName}>ETHMARKET</h2>
        </div>

        <h3 style={headerStyle}>
          {isSeller ? "Merchant Account" : "Create Profile"}
        </h3>
        <p style={subHeaderStyle}>
          {isSeller ? "Register your business on Ethmarket" : "Join the Ethmarket shopping community"}
        </p>

        {/* Role Selection Tabs */}
        <div style={tabContainer}>
          <button 
            type="button"
            onClick={() => setIsSeller(false)}
            style={roleTabStyle(!isSeller)}
          >
            Shopper
          </button>
          <button 
            type="button"
            onClick={() => setIsSeller(true)}
            style={roleTabStyle(isSeller)}
          >
            Seller
          </button>
        </div>

        {/* STEP 1: REGISTRATION FORM */}
        {step === 1 && (
          <form onSubmit={handleSubmit}>
            <div style={inputRow}>
              <div style={inputGroup}>
                <label style={labelStyle}>Full Name</label>
                <div style={inputWrapper}>
                  <User size={18} style={iconStyle} />
                  <input name="name" type="text" placeholder="John Doe" required value={formData.name} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Phone Number</label>
                <div style={inputWrapper}>
                  <Phone size={18} style={iconStyle} />
                  <input name="phone" type="text" placeholder="+251..." required value={formData.phone} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Email Address</label>
              <div style={inputWrapper}>
                <Mail size={18} style={iconStyle} />
                <input name="email" type="email" placeholder="name@ethmarket.com" required value={formData.email} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Password</label>
              <div style={inputWrapper}>
                <Lock size={18} style={iconStyle} />
                <input name="password" type="password" placeholder="••••••••" required value={formData.password} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            {/* Business Info - Only for Sellers */}
            {isSeller && (
              <div style={businessSection}>
                <div style={inputGroup}>
                  <label style={labelStyle}>Business Name</label>
                  <div style={inputWrapper}>
                     <Building2 size={18} style={iconStyle} />
                     <input name="businessName" type="text" placeholder="Ethmarket Store" required value={formData.businessName} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>License Number</label>
                  <div style={inputWrapper}>
                     <FileCheck size={18} style={iconStyle} />
                     <input name="licenseNumber" type="text" placeholder="TIN-00123" required value={formData.licenseNumber} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} style={submitBtnStyle(loading)}>
              {loading ? "Registering..." : isSeller ? "Open My Shop" : "Start Shopping"}
              {!loading && <ArrowRight size={18} style={{ marginLeft: '10px' }} />}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <div style={otpContainer}>
            <div style={otpHeader}>
              <CheckCircle size={48} color="#10b981" />
              <h3 style={otpTitle}>Verify Email</h3>
              <p style={otpSubtitle}>Enter 6-digit code sent to <strong>{userEmail}</strong></p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div style={otpInputGroup}>
                <label style={labelStyle}>Verification Code</label>
                <div style={otpWrapper}>
                  <input 
                    type="text" 
                    maxLength="6"
                    placeholder="123456"
                    value={otp}
                    onChange={handleOtpChange}
                    style={otpInputStyle}
                    required
                  />
                </div>
              </div>

              {statusMessage && (
                <div style={statusStyle(statusMessage.includes('OTP') || statusMessage.includes('✅') || statusMessage.includes('sent'))}>
                  {statusMessage}
                </div>
              )}

              <div style={otpActions}>
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={secondaryBtnStyle}
                >
                  Resend OTP
                </button>
                <button 
                  type="submit" 
                  disabled={loading || otp.length !== 6}
                  style={submitBtnStyle(loading || otp.length !== 6)}
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>
              </div>
            </form>

            <button 
              type="button"
              onClick={() => { setStep(1); setOtp(''); }}
              style={backBtnStyle}
            >
              ← Edit Details
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS (SELLER PENDING APPROVAL) */}
        {step === 3 && (
          <div style={successContainer}>
            <Clock size={64} color="#f59e0b" />
            <h3 style={successTitle}>Account Created!</h3>
            <p style={successMessage}>
              Your seller account has been registered successfully. 
              <br/>Admin approval typically takes 24-48 hours.
            </p>
            <div style={statusCard}>
              <AlertCircle size={20} color="#f59e0b" />
              <span>You can login but shop features are pending approval</span>
            </div>
            <button 
              type="button"
              onClick={() => navigate('/login')}
              style={successBtnStyle}
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Footer */}
        <p style={footerTextStyle}>
          Already part of Ethmarket? <Link to="/login" style={loginLinkStyle}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

// ======================================
// ALL STYLES (UNCHANGED - PERFECT)
// ======================================
const containerStyle = {
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f1f5f9',
  padding: '40px 20px',
  fontFamily: "'Inter', sans-serif"
};

const glassCard = {
  width: '100%',
  maxWidth: '550px',
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
  marginBottom: '20px', 
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

const headerStyle = { fontSize: '26px', fontWeight: '800', textAlign: 'center', color: '#0f172a', marginBottom: '8px' };
const subHeaderStyle = { color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '30px' };

const tabContainer = {
  display: 'flex',
  background: '#f1f5f9',
  padding: '5px',
  borderRadius: '12px',
  marginBottom: '30px'
};

const roleTabStyle = (active) => ({
  flex: 1,
  padding: '10px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  background: active ? 'white' : 'transparent',
  color: active ? '#3b82f6' : '#64748b',
  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
});

const inputRow = { display: 'flex', gap: '15px' };
const inputGroup = { marginBottom: '20px', flex: 1 };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' };
const inputWrapper = { position: 'relative' };
const iconStyle = { position: 'absolute', left: '15px', top: '13px', color: '#94a3b8' };

const inputStyle = {
  width: '100%',
  padding: '12px 15px 12px 45px',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  outline: 'none',
  fontSize: '14px',
  background: '#f8fafc',
  boxSizing: 'border-box'
};

const businessSection = {
  marginTop: '10px',
  padding: '20px',
  background: '#f0f7ff',
  borderRadius: '16px',
  border: '1px solid #dbeafe',
  marginBottom: '20px'
};

const submitBtnStyle = (disabled) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  background: disabled ? '#94a3b8' : '#0f172a',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '700',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: '0.2s ease',
  opacity: disabled ? 0.7 : 1
});

const footerTextStyle = { marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#64748b' };
const loginLinkStyle = { color: '#3b82f6', fontWeight: '700', textDecoration: 'none' };

// OTP Styles
const otpContainer = { textAlign: 'center', padding: '20px 0' };
const otpHeader = { marginBottom: '30px' };
const otpTitle = { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '16px 0 8px 0' };
const otpSubtitle = { color: '#64748b', fontSize: '14px' };
const otpInputGroup = { marginBottom: '20px', textAlign: 'left' };
const otpWrapper = { position: 'relative', maxWidth: '200px', margin: '0 auto' };
const otpInputStyle = {
  ...inputStyle,
  padding: '16px 20px',
  fontSize: '18px',
  fontWeight: '600',
  letterSpacing: '4px',
  textAlign: 'center',
  border: '2px solid #e2e8f0'
};
const otpActions = { display: 'flex', gap: '12px', marginTop: '20px' };
const secondaryBtnStyle = {
  flex: 1,
  padding: '14px',
  background: 'transparent',
  color: '#3b82f6',
  border: '2px solid #dbeafe',
  borderRadius: '12px',
  fontWeight: '600'
};
const backBtnStyle = {
  width: '100%',
  padding: '12px',
  background: '#f1f5f9',
  color: '#475569',
  border: 'none',
  borderRadius: '12px',
  marginTop: '20px',
  cursor: 'pointer'
};

// Success styles
const successContainer = { textAlign: 'center' };
const successTitle = { fontSize: '24px', color: '#059669', margin: '20px 0' };
const successMessage = { color: '#64748b', lineHeight: '1.6' };
const statusCard = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  background: '#fef3c7', 
  padding: '16px', 
  borderRadius: '12px', 
  margin: '24px 0' 
};
const successBtnStyle = {
  width: '100%',
  padding: '16px',
  background: '#059669',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer'
};

// Status message
const statusStyle = (isSuccess) => ({
  padding: '12px 16px',
  borderRadius: '8px',
  marginBottom: '20px',
  fontSize: '14px',
  fontWeight: '500',
  background: isSuccess ? '#d1fae5' : '#fee2e2',
  color: isSuccess ? '#065f46' : '#991b1b',
  borderLeft: `4px solid ${isSuccess ? '#10b981' : '#ef4444'}`
});

export default Register;

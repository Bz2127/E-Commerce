import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import api from '../utils/api';
import { Mail, Package, MapPin, Camera, ChevronRight, Phone, Lock, Bell, User } from 'lucide-react'; 

const Profile = () => {
  const { user, login, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); 
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifSettings, setNotifSettings] = useState({
    orders: true,
    promos: true,
    sms: false
  });
  const [isSavingNotif, setIsSavingNotif] = useState(false);

  // Sync formData when user context loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);
  
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    if (isEditing) fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
   
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    
    if (selectedFile) {
      data.append('profileImage', selectedFile);
    }

    try {
      
      const response = await api.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Update context with merged user data
        login(token, response.data.user); 
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update profile.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if(passwordData.newPassword !== passwordData.confirmPassword) {
      return alert("New passwords do not match");
    }

    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        alert("Password changed successfully!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error changing password");
    }
  };

  const getProfileImage = () => {
    if (previewImage) return previewImage;
    if (user?.profile_pic) {
      // If it's a full URL (like Google login), use it; otherwise, prefix with backend URL
      return user.profile_pic.startsWith('http') 
        ? user.profile_pic 
        : `http://localhost:5000/${user.profile_pic}`;
    }
    return null;
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotif(true);
    // Demonstration delay
    setTimeout(() => {
      setIsSavingNotif(false);
      alert("Notification preferences saved!");
    }, 800); 
  };

  const profileImgSrc = getProfileImage();

  return (
    <div style={container}>
      <div style={headerSection}>
        <h1 style={title}><span style={{color: '#10b981'}}>Eth</span>market Account</h1>
        <p style={subtitle}>Manage your profile, security, and notifications.</p>
      </div>

      <div style={layoutGrid}>
        {/* Sidebar Nav */}
        <div style={sidebar}>
            <button onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? activeTabBtn : tabBtn}>
                <User size={18} /> Profile Overview
            </button>
            <button onClick={() => setActiveTab('security')} style={activeTab === 'security' ? activeTabBtn : tabBtn}>
                <Lock size={18} /> Security
            </button>
            <button onClick={() => setActiveTab('notifications')} style={activeTab === 'notifications' ? activeTabBtn : tabBtn}>
                <Bell size={18} /> Notifications
            </button>
        </div>

        {/* Content Card */}
        <div style={card}>
          {activeTab === 'overview' && (
            <>
              <div style={cardHeader}>
                <div style={{...avatarWrapper, cursor: isEditing ? 'pointer' : 'default'}} onClick={handleImageClick}>
                  {profileImgSrc ? (
                    <img src={profileImgSrc} alt="Profile" style={profileImg} />
                  ) : (
                    <div style={placeholderAvatar}>{user?.name?.charAt(0)}</div>
                  )}
                  {isEditing && <div style={cameraIcon}><Camera size={14} /></div>}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                </div>
                <div style={{ marginLeft: '20px' }}>
                  {isEditing ? (
                    <input style={inputStyle} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  ) : (
                    <h2 style={userName}>{user?.name}</h2>
                  )}
                  <span style={roleBadge}>{user?.role?.toUpperCase()}</span>
                </div>
              </div>

              <div style={infoList}>
                <div style={infoItem}>
                  <Mail size={18} color="#94a3b8" />
                  <div>
                    <label style={label}>Email Address</label>
                    <p style={valueText}>{user?.email}</p>
                  </div>
                </div>

                <div style={infoItem}>
                  <Phone size={18} color="#94a3b8" />
                  <div>
                    <label style={label}>Phone Number</label>
                    {isEditing ? (
                      <input style={inputStyle} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    ) : (
                      <p style={valueText}>{user?.phone || 'No phone added'}</p>
                    )}
                  </div>
                </div>

                <div style={infoItem}>
                  <MapPin size={18} color="#94a3b8" />
                  <div>
                    <label style={label}>Location</label>
                    {isEditing ? (
                      <input style={inputStyle} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                    ) : (
                      <p style={valueText}>{user?.address || 'Addis Ababa, Ethiopia'}</p>
                    )}
                  </div>
                </div>
              </div>

              <button style={{...editBtn, background: isEditing ? '#0f172a' : '#10b981'}} onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange}>
               <h3 style={linkTitle}>Change Password</h3>
               <p style={linkSubtitle}>Update your password to keep your account secure.</p>
               <div style={{marginTop: '20px'}}>
                  <label style={label}>Current Password</label>
                  <input type="password" style={inputStyle} value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                  <label style={label}>New Password</label>
                  <input type="password" style={inputStyle} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                  <label style={label}>Confirm New Password</label>
                  <input type="password" style={inputStyle} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
               </div>
               <button type="submit" style={editBtn}>Update Password</button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div>
               <h3 style={linkTitle}>Notification Settings</h3>
               <p style={linkSubtitle}>Choose how we stay in touch with you.</p>
               <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
                  <label style={checkboxLabel}>
                      <input type="checkbox" checked={notifSettings.orders} onChange={(e) => setNotifSettings({...notifSettings, orders: e.target.checked})} style={checkbox} /> 
                      Order Status Alerts
                  </label>
                  <label style={checkboxLabel}>
                      <input type="checkbox" checked={notifSettings.promos} onChange={(e) => setNotifSettings({...notifSettings, promos: e.target.checked})} style={checkbox} /> 
                      Promotions & Sales
                  </label>
                  <label style={checkboxLabel}>
                      <input type="checkbox" checked={notifSettings.sms} onChange={(e) => setNotifSettings({...notifSettings, sms: e.target.checked})} style={checkbox} /> 
                      SMS Alerts
                  </label>
               </div>
               <button style={editBtn} onClick={handleSaveNotifications} disabled={isSavingNotif}>
                  {isSavingNotif ? "Saving..." : "Save Preferences"}
               </button>
            </div>
          )}
        </div>

        {/* Right Info Sidebar */}
        <div style={rightColumn}>
          <Link to="/orders" style={linkCard}>
            <div style={linkContent}>
              <div style={iconCircleLink}><Package color="#10b981" /></div>
              <div>
                <h3 style={linkTitle}>My Orders</h3>
                <p style={linkSubtitle}>View purchase history</p>
              </div>
            </div>
            <ChevronRight color="#cbd5e1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const container = { padding: '60px 5%', background: '#f8fafc', minHeight: '90vh', fontFamily: 'Inter, sans-serif' };
const headerSection = { marginBottom: '40px' };
const title = { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-1px' };
const subtitle = { color: '#64748b', marginTop: '8px' };
const layoutGrid = { display: 'grid', gridTemplateColumns: '220px 1.2fr 0.8fr', gap: '30px' };
const sidebar = { display: 'flex', flexDirection: 'column', gap: '8px' };
const tabBtn = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: 'transparent', border: 'none', borderRadius: '14px', cursor: 'pointer', textAlign: 'left', color: '#64748b', fontWeight: '700', fontSize: '14px', transition: '0.2s' };
const activeTabBtn = { ...tabBtn, background: 'white', color: '#10b981', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const card = { background: 'white', padding: '35px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const cardHeader = { display: 'flex', alignItems: 'center', marginBottom: '30px', paddingBottom: '25px', borderBottom: '1px solid #f1f5f9' };
const avatarWrapper = { position: 'relative' };
const profileImg = { width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10b981' };
const placeholderAvatar = { width: '90px', height: '90px', borderRadius: '50%', background: '#10b981', color: 'white', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' };
const cameraIcon = { position: 'absolute', bottom: '0', right: '0', background: '#0f172a', color: 'white', padding: '8px', borderRadius: '50%', border: '2px solid white' };
const userName = { fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 5px 0' };
const roleBadge = { fontSize: '10px', fontWeight: '800', background: '#f1f5f9', color: '#475569', padding: '5px 12px', borderRadius: '100px', letterSpacing: '0.05em' };
const infoList = { display: 'flex', flexDirection: 'column', gap: '22px' };
const infoItem = { display: 'flex', alignItems: 'center', gap: '18px' };
const label = { fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', display: 'block', letterSpacing: '0.02em' };
const valueText = { margin: 0, fontSize: '15px', fontWeight: '600', color: '#334155' };
const inputStyle = { padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', width: '100%', outline: 'none', background: '#f8fafc' };
const editBtn = { width: '100%', marginTop: '30px', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', background: '#10b981', transition: '0.2s' };
const rightColumn = { display: 'flex', flexDirection: 'column', gap: '20px' };
const linkCard = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '25px', borderRadius: '20px', textDecoration: 'none', border: '1px solid #f1f5f9', transition: '0.2s' };
const linkContent = { display: 'flex', alignItems: 'center', gap: '18px' };
const iconCircleLink = { background: '#ecfdf5', padding: '12px', borderRadius: '16px' };
const linkTitle = { margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' };
const linkSubtitle = { margin: 0, fontSize: '13px', color: '#94a3b8' };
const checkboxLabel = { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#475569' };
const checkbox = { width: '20px', height: '20px', accentColor: '#10b981' };

export default Profile;
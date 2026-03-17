import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, ArrowLeft } from 'lucide-react';

import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchReviews = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.get('/reviews/my-reviews');
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Reviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return <div style={loadingStyle}>Loading your reviews...</div>;
  }

  return (
    <div style={container}>
      <div style={header}>
        <button onClick={() => navigate(-1)} style={backBtn}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1 style={title}>Your <span style={{color: '#10b981'}}>Eth</span>market Reviews</h1>
      </div>

      {reviews.length === 0 ? (
        <div style={emptyState}>
          <MessageSquare size={48} color="#64748b" />
          <h3 style={{ marginTop: '20px' }}>No reviews yet</h3>
          <p style={{ color: '#64748b' }}>Write reviews for your purchased products to help others!</p>
          <button 
            onClick={() => navigate('/shop')} 
            style={{ ...backBtn, background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '8px', marginTop: '20px' }}
          >
            Go Shopping
          </button>
        </div>
      ) : (
        <div style={reviewsGrid}>
          {reviews.map(review => (
            <div key={review.id} style={reviewCard}>
              <div style={reviewHeader}>
                <div style={starsContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      fill={i < review.rating ? '#fbbf24' : 'none'} 
                      color="#fbbf24"
                    />
                  ))}
                </div>
                <span style={dateText}>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h4 style={productName}>{review.product_name}</h4>
              
              {review.comment && (
                <p style={commentText}>{review.comment}</p>
              )}
              
              {review.image_url && (
                <img 
                  src={review.image_url} 
                  alt="Product" 
                  style={productImage} 
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const container = { padding: '60px 8%', minHeight: '80vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" };
const header = { marginBottom: '40px' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontSize: '16px', fontWeight: '700', color: '#10b981', cursor: 'pointer', padding: '8px 0', transition: '0.2s' };
const title = { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '15px 0 0 0', letterSpacing: '-1px' };
const emptyState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const reviewsGrid = { display: 'grid', gap: '20px', maxWidth: '850px' };
const reviewCard = { background: 'white', padding: '28px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', transition: '0.3s' };
const reviewHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' };
const starsContainer = { display: 'flex', gap: '4px' };
const dateText = { color: '#94a3b8', fontSize: '13px', fontWeight: '600' };
const productName = { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' };
const commentText = { color: '#475569', lineHeight: '1.7', marginBottom: '16px', fontSize: '15px' };
const productImage = { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginTop: '10px', border: '1px solid #f1f5f9' };
const loadingStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#10b981', fontSize: '20px', fontWeight: '700' };

export default CustomerReviews;
import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, ArrowLeft } from 'lucide-react'; // ✅ REMOVED: Flag
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ REMOVED: useParams

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
      const response = await axios.get('http://localhost:5000/api/reviews/my-reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
          <ArrowLeft size={20} /> My Reviews
        </button>
        <h1 style={title}>Your Reviews</h1>
      </div>

      {reviews.length === 0 ? (
        <div style={emptyState}>
          <MessageSquare size={48} color="#64748b" />
          <h3>No reviews yet</h3>
          <p>Write reviews for your purchased products to help others!</p>
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
                <img src={review.image_url} alt="Product" style={productImage} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// COMPLETE STYLES (all included)
const container = { padding: '60px 8%', minHeight: '80vh', background: '#f8fafc' };
const header = { marginBottom: '40px' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontSize: '18px', fontWeight: '600', color: '#3b82f6', cursor: 'pointer', padding: '8px 0' };
const title = { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '20px 0 0 0' };
const emptyState = { textAlign: 'center', padding: '100px 40px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const reviewsGrid = { display: 'grid', gap: '24px', maxWidth: '800px' };
const reviewCard = { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const reviewHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' };
const starsContainer = { display: 'flex', gap: '2px' };
const dateText = { color: '#64748b', fontSize: '14px' };
const productName = { fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' };
const commentText = { color: '#475569', lineHeight: '1.6', marginBottom: '16px' };
const productImage = { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px' };
const loadingStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748b' };

export default CustomerReviews;

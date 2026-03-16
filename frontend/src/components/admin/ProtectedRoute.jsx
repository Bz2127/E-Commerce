import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading security check...</div>;

  // If not logged in, send to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If logged in but role doesn't match (Customer → Admin)
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isLoggedIn, user, token } = useAuth();
  
  console.log('ProtectedRoute - isLoggedIn:', isLoggedIn, 'user:', user, 'requiredRole:', requiredRole);
  
  // If no token, redirect to login
  if (!isLoggedIn || !token) {
    console.log('No token or not logged in, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If role-based access is required and user doesn't have the required role
  if (requiredRole && user?.role !== requiredRole) {
    console.log('Role mismatch - user role:', user?.role, 'required:', requiredRole);
    // If user is not an admin trying to access admin route, redirect to home
    if (requiredRole === 'ADMIN') {
      return <Navigate to="/" replace />;
    }
  }

  // If token exists and role requirements are met, render the component
  console.log('Access granted to protected route');
  return children;
};

export default ProtectedRoute;
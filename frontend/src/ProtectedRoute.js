import React from 'react';
import { useAuth } from './context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/login" />;
  }

  // Show the main app
  return <Outlet />;
}
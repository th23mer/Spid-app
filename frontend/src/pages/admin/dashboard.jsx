import React from 'react';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { Navigate } from 'react-router-dom';

// Helper to check JWT validity
function isJwtValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const Dashboard = () => {
  const jwt = localStorage.getItem('adminJwt');
  
  // If not authenticated, redirect to admin login
  if (!jwt || !isJwtValid(jwt)) {
    return <Navigate to="/admin" replace />;
  }
  
  return <AdminDashboard onLogout={() => {
    localStorage.removeItem('adminJwt');
    window.location.href = '/admin';
  }} />;
};

export default Dashboard;

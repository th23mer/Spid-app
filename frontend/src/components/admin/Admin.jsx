import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

// Helper to check JWT validity (expiration)
function isJwtValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if there's a stored JWT token on component mount
    const jwt = localStorage.getItem('adminJwt');
    if (jwt && isJwtValid(jwt)) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('adminJwt');
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminJwt');
  };

  return isAuthenticated ? 
    <AdminDashboard onLogout={handleLogout} /> : 
    <AdminLogin onLogin={handleLogin} />;
};

export default Admin;

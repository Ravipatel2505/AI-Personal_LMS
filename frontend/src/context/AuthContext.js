import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// --- NEW CODE ---
// Get the token from local storage at the very start
const initialToken = localStorage.getItem('token');
// Set the axios default header *immediately* if the token exists on load
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}
// --- END NEW CODE ---

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(initialToken); // Use the variable
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken); // Use the variable

  useEffect(() => {
    // This effect now just handles *changes* to the token (login/logout)
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  }, [token]);

  const register = async (email, password) => {
    const res = await axios.post('/api/auth/register', { email, password });
    setToken(res.data.token);
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setToken(res.data.token);
  };

  const logout = () => {
    setToken(null);
  };

  const value = {
    token,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token by fetching user
          const response = await authApi.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Invalid token
            authApi.logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          authApi.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success) {
        const { user, token } = response.data;
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return { success: true, user };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    // Helper to check roles
    hasRole: (roles) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    isDoctor: () => user?.role === 'DOCTOR',
    isNurse: () => user?.role === 'NURSE',
    isAdmin: () => user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN',
    isMidwife: () => user?.role === 'MIDWIFE',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
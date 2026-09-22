// src/services/authService.js

import request, { setAccessToken } from './api';

export const login = async (identifier, password) => {
  try {
    console.log('🔐 Login attempt:', identifier);
    
    // Send identifier as both username and email so backend can match by either
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: identifier, email: identifier, password }),
    });
    
    console.log('✅ Login response data:', data);
    
    // Handle different response formats
    // If backend returns token, set it
    if (data.token) {
      setAccessToken(data.token);
    } else if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    
    // Store refresh token if available
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    // Store user data
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userType', data.user.user_type || data.user.role || '');
    }
    
    // Return the data in a consistent format
    return {
      user: data.user || data,
      token: data.token || data.accessToken,
      clinic: data.clinic || (data.user?.clinic_id ? { id: data.user.clinic_id } : null)
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

export const register = async (userData) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const getCurrentSession = async () => {
  try {
    const data = await request('/auth/me');
    console.log('📡 Session data:', data);
    return data;
  } catch (error) {
    console.error('❌ Session error:', error);
    throw error;
  }
};

export const updateProfile = async (profileData) =>
  request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });

export const changePassword = async ({ currentPassword, newPassword }) =>
  request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const logout = () => {
  setAccessToken(null);
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('currentClinic');
  localStorage.removeItem('userType');
};
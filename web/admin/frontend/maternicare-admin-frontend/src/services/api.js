// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAccessToken = () => localStorage.getItem('token');

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const request = async (path, options = {}) => {
  const token = getAccessToken();
  
  console.log(`📡 API Request: ${API_BASE_URL}${path}`);
  console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'Not present');
  console.log('📝 Method:', options.method || 'GET');
  
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });

    console.log(`📊 Response Status: ${response.status}`);

    if (response.status === 204) {
      return null;
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = isJson ? await response.json() : null;

    console.log('📦 Response data:', payload);

    if (!response.ok) {
      throw new Error(payload?.message || 'Request failed');
    }

    return payload?.data ?? payload;
  } catch (error) {
    console.error('❌ API Request Error:', error.message);
    throw error;
  }
};

export default request;

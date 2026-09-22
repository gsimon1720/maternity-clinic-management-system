// src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUser, FaLock, FaBaby, FaHeartbeat, FaHospital, FaShieldAlt } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'NURSE') {
        navigate('/nurse/dashboard');
      } else if (user.role === 'MIDWIFE') {
        navigate('/midwife/dashboard');
      } else if (user.role === 'SUPER_ADMIN' || user.role === 'CLINIC_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Navigation will happen in useEffect
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* ========================================== */}
        {/* LEFT SIDE - Illustration / Image            */}
        {/* ========================================== */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-pink-400 to-pink-600 p-8 flex-col items-center justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white/10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5"></div>
          </div>
          
          {/* Illustration Content */}
          <div className="relative z-10 text-center">
            {/* 3D Logo */}
            <div className="relative mx-auto w-32 h-32 mb-8 perspective-500">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200/30 to-white/20 backdrop-blur-sm shadow-2xl animate-float">
                <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <FaBaby className="text-white text-4xl absolute -top-4 -left-4 drop-shadow-glow" />
                    <FaHeartbeat className="text-white text-3xl absolute -bottom-4 -right-4 drop-shadow-glow" />
                    <span className="text-white text-7xl font-bold drop-shadow-glow">+</span>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 rounded-full bg-pink-300/20 blur-2xl animate-pulse-slow"></div>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold text-white mb-4">
              Maternity <br />Clinic
            </h1>
            <p className="text-pink-100 text-lg mb-6">
              Maternal & Child Health <br />Management System
            </p>

            {/* Features */}
            <div className="space-y-3 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaHospital className="text-white text-sm" />
                </div>
                <span className="text-sm">Comprehensive Maternity Care</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaShieldAlt className="text-white text-sm" />
                </div>
                <span className="text-sm">Secure & Confidential</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaHeartbeat className="text-white text-sm" />
                </div>
                <span className="text-sm">24/7 Patient Support</span>
              </div>
            </div>

            {/* Footer Text */}
            <p className="mt-8 text-pink-200 text-sm">
              <span className="opacity-60">© 2024 Maternity Clinic. All rights reserved.</span>
            </p>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT SIDE - Login Form                    */}
        {/* ========================================== */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">🏥</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Maternity Clinic</h2>
            <p className="text-sm text-gray-500">Maternal & Child Health Management</p>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Back! 
            </h2>
            <p className="text-gray-500 mt-2">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

           

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-300/50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

           
           
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
// src/pages/auth/Unauthorized.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
          <FaLock className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">
          You don't have permission to access this page.
          Please contact your administrator.
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
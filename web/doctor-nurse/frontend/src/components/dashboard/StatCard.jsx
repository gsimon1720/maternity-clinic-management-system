// src/components/dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => {
  //  Pink Theme Colors
  const colors = {
    primary: 'bg-pink-50 text-pink-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  const borderColors = {
    primary: 'border-l-4 border-pink-400',
    green: 'border-l-4 border-green-500',
    blue: 'border-l-4 border-blue-500',
    purple: 'border-l-4 border-purple-500',
    red: 'border-l-4 border-red-500',
    yellow: 'border-l-4 border-yellow-500',
  };

  //  Icon Background Colors
  const iconBgColors = {
    primary: 'bg-pink-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${borderColors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-full ${iconBgColors[color]} flex items-center justify-center text-xl text-${color}-600`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
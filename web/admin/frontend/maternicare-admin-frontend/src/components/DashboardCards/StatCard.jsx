import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-icon ${color}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`stat-trend ${trend}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </div>
        )}
      </div>
      <div className="stat-card-body">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
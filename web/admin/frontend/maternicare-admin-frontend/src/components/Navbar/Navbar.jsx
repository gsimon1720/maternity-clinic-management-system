import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const ROLE_INFO = {
    sphm: { profilePath: '/sphm/profile', label: 'Supervising Public Health Midwife' },
    ad_officer: { profilePath: '/ado/profile', label: 'Administrative Division Officer' },
  };
  const { profilePath, label: roleLabel } = ROLE_INFO[userType] || { profilePath: '/profile', label: 'Administrator' };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="page-title">
          <h2>Welcome back, {user?.name || 'Admin'}!</h2>
          <p>Manage your clinic efficiently</p>
        </div>
      </div>

      <div className="navbar-right">
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-menu">
          <button 
            className="user-dropdown-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Admin User'}</span>
              <span className="user-role">{roleLabel}</span>
            </div>
            <ChevronDown size={16} />
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => navigate(profilePath)} className="dropdown-item">
                <User size={16} />
                <span>Profile</span>
              </button>
              <button onClick={() => navigate('/settings')} className="dropdown-item">
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <hr className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-item text-danger">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// src/components/layout/NurseLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaSearch, 
  FaSignOutAlt, 
  FaBars,
  FaBaby,
  FaHeartbeat 
} from 'react-icons/fa';

const NurseLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/nurse/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/nurse/patients', label: 'Search Patients', icon: <FaSearch /> },
    { path: '/nurse/postnatal', label: 'Postnatal Clinic Care', icon: <FaBaby /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 
        w-64 min-w-[256px] max-w-[256px]
        text-white 
        transform transition-transform duration-300 ease-in-out 
        flex flex-col h-screen overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{
        backgroundImage: 'radial-gradient(circle, #e0218e, #e34ba5, #e468b9, #e682cc, #e799dc, #e5a1e0, #e3a9e3, #e2b0e5, #dcabde, #d6a7d7, #d0a2d0, #ca9ec9)'
      }}>
        {/* Logo */}
        <div className="p-4 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm shadow-lg flex items-center justify-center">
                <div className="relative">
                  <FaBaby className="text-white text-sm absolute -top-1 -left-1 drop-shadow-glow" />
                  <FaHeartbeat className="text-white text-xs absolute -bottom-1 -right-1 drop-shadow-glow" />
                  <span className="text-white text-2xl font-bold ml-1 drop-shadow-glow">+</span>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">Maternity Care</h1>
              <p className="text-xs text-white/70 truncate">Nurse Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap
                ${isActive(item.path) 
                  ? 'bg-white/20 backdrop-blur-sm text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {user?.fullName?.charAt(0) || 'N'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName || 'Nurse'}</p>
              <p className="text-xs text-white/70 truncate">{user?.email}</p>
              <p className="text-xs text-white/80">
                <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full inline-block">
                  {user?.role}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <FaBars className="text-gray-600 text-xl" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
          <div className="w-8" />
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default NurseLayout;
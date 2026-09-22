import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  LogOut,
  Heart,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shield,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { path: '/super-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/super-admin/clinics', icon: Building2, label: 'Clinic Management' },
    { path: '/super-admin/users', icon: Users, label: 'User Management' },
    { path: '/super-admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/super-admin/permissions', icon: ShieldCheck, label: 'Access Permissions' },
    { path: '/super-admin/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        background: '#fce7f3',
        color: '#831843',
        transition: 'all 0.3s',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        zIndex: 1000,
        borderRight: '1px solid #fbcfe8'
      }}>
        <div style={{ padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fbcfe8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fdf2f8', padding: '8px', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
              <Shield size={24} color="#db2777" />
            </div>
            {sidebarOpen && <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#831843' }}>Super Admin</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: '1px solid #fbcfe8', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: '#db2777' }}>
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                color: isActive ? '#db2777' : '#9d174d',
                textDecoration: 'none',
                transition: 'all 0.3s',
                margin: '0 8px',
                borderRadius: '12px',
                fontWeight: isActive ? '600' : '500',
                border: isActive ? '1px solid #fbcfe8' : '1px solid transparent',
                background: isActive ? '#fdf2f8' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(219, 39, 119, 0.1)' : 'none'
              })}
            >
              <item.icon size={20} color={window.location.pathname === item.path ? '#db2777' : '#9d174d'} />
              {sidebarOpen && <span style={{ fontSize: '14px' }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #fbcfe8', position: 'absolute', bottom: 0, width: '100%' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              borderRadius: '12px',
              color: '#ef4444',
              cursor: 'pointer',
              width: '100%',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '80px',
        transition: 'margin-left 0.3s'
      }}>
        {/* Top Navbar */}
        <nav style={{
          background: 'white',
          padding: '16px 24px',
          borderBottom: '1px solid #fbcfe8',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#831843' }}>{user?.fullName || 'Super Admin'}</p>
              <p style={{ fontSize: '11px', color: '#9d174d' }}>Super Administrator</p>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #fbcfe8, #db2777)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {user?.fullName?.charAt(0) || 'S'}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main style={{ padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
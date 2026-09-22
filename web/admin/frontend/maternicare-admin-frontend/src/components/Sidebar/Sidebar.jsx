import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  Database,
  UserCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  Map,
  ShieldCheck,
  Baby
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { hasPermission, userType } = useAuth();

  const sphmMenuItems = [
    { path: '/sphm/midwives', icon: Baby,       label: 'Midwife Management' },
    { path: '/sphm/profile',  icon: UserCircle, label: 'Profile' },
  ];

  const adoMenuItems = [
    { path: '/ado/areas',   icon: Map,       label: 'Area & Zone Management' },
    { path: '/ado/profile', icon: UserCircle, label: 'Profile' },
  ];

  // Each item can have an optional `permission` key.
  // If set, the item is hidden when hasPermission returns false.
  const clinicAdminMenuItems = [
    { path: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users',               icon: Users,           label: 'User Management', permission: 'VIEW_STAFF' },
    { path: '/reports',             icon: FileText,        label: 'Reports',          permission: 'VIEW_REPORTS' },
    { path: '/clinic',              icon: Building2,       label: 'Clinic Info',      permission: 'VIEW_CLINIC_INFO' },
    { path: '/backup',              icon: Database,        label: 'Backup' },
    { path: '/permissions',         icon: ShieldCheck,     label: 'Access Permissions' },
    { path: '/profile',             icon: UserCircle,      label: 'Profile' },
  ];

  const menuItems = userType === 'sphm' ? sphmMenuItems
    : userType === 'ad_officer' ? adoMenuItems
    : clinicAdminMenuItems;

  // Filter out items the current user doesn't have permission to see
  const visibleItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Heart className="heart-icon" />
          </div>
          {isOpen && <span className="logo-text">MaterniCare</span>}
        </div>
        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronLeft className="toggle-icon" /> : <ChevronRight className="toggle-icon" />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" />
            {isOpen && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="clinic-version">
          {isOpen && (
            <>
              <p className="version-text">v2.0.0</p>
              <p className="clinic-name">MaterniCare Clinic</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
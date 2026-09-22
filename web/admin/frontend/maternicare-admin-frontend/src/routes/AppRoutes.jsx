import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Auth Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

// Super Admin Pages
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import SuperAdminDashboard from '../pages/SuperAdmin/SuperAdminDashboard';
import ClinicManagement from '../pages/SuperAdmin/ClinicManagement';
import AddClinic from '../pages/SuperAdmin/AddClinic';
import EditClinic from '../pages/SuperAdmin/EditClinic';
import ViewClinic from '../pages/SuperAdmin/ViewClinic';
import SuperAdminUserManagement from '../pages/SuperAdmin/UserManagement/UserManagement';
import SuperAdminAddUser from '../pages/SuperAdmin/UserManagement/AddUser';
import SuperAdminEditUser from '../pages/SuperAdmin/UserManagement/EditUser';
import SuperAdminViewUser from '../pages/SuperAdmin/UserManagement/ViewUser';
import SuperAdminReports from '../pages/SuperAdmin/Reports';
import SuperAdminProfile from '../pages/SuperAdmin/Profile';
import SuperAdminPermissions from '../pages/SuperAdmin/Permissions';

// Clinic Admin Pages
import ClinicAdminLayout from '../layouts/ClinicAdminLayout';
import ClinicAdminDashboard from '../pages/ClinicAdmin/Dashboard';
import UserManagement from '../pages/ClinicAdmin/UserManagement/UserManagement';
import AddUser from '../pages/ClinicAdmin/UserManagement/AddUser';
import EditUser from '../pages/ClinicAdmin/UserManagement/EditUser';
import ViewUser from '../pages/ClinicAdmin/UserManagement/ViewUser';
import Reports from '../pages/ClinicAdmin/Reports';
import ClinicInformation from '../pages/ClinicAdmin/ClinicInformation';
import Backup from '../pages/ClinicAdmin/Backup';
import Profile from '../pages/ClinicAdmin/Profile';
import ClinicAdminPermissions from '../pages/ClinicAdmin/Permissions';

// SPHM Pages (reuses ClinicAdminLayout + Profile — same clinic-scoped pattern)
import MidwifeManagement from '../pages/SPHM/MidwifeManagement/MidwifeManagement';
import AddMidwife from '../pages/SPHM/MidwifeManagement/AddMidwife';
import ViewMidwife from '../pages/SPHM/MidwifeManagement/ViewMidwife';

// ADO Pages (global role, reuses ClinicAdminLayout + Profile)
import AreaZoneManagement from '../pages/ADO/AreaZoneManagement';



const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const { isAuthenticated, userType, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #F48FB1',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          background: '#F9FAFB'
        }}>
          <div style={{ textAlign: 'center', background: 'white', padding: '48px', borderRadius: '24px' }}>
            <h1 style={{ fontSize: '28px', color: '#ef4444', marginBottom: '16px' }}>Unauthorized Access</h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>You don't have permission to access this page.</p>
            <a href="/login" style={{ color: '#F48FB1', textDecoration: 'none' }}>Go back to Login</a>
          </div>
        </div>
      } />

      {/* Super Admin Routes */}
      <Route element={
        <ProtectedRoute allowedUserTypes={['super_admin']}>
          <SuperAdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/clinics" element={<ClinicManagement />} />
        <Route path="/super-admin/clinics/add" element={<AddClinic />} />
        <Route path="/super-admin/clinics/edit/:id" element={<EditClinic />} />
        <Route path="/super-admin/clinics/view/:id" element={<ViewClinic />} />
        <Route path="/super-admin/users" element={<SuperAdminUserManagement />} />
        <Route path="/super-admin/users/add" element={<SuperAdminAddUser />} />
        <Route path="/super-admin/users/edit/:id" element={<SuperAdminEditUser />} />
        <Route path="/super-admin/users/view/:id" element={<SuperAdminViewUser />} />
        <Route path="/super-admin/reports" element={<SuperAdminReports />} />
        <Route path="/super-admin/permissions" element={<SuperAdminPermissions />} />
        <Route path="/super-admin/profile" element={<SuperAdminProfile />} />
      </Route>

      {/* Clinic Admin Routes */}
      <Route element={
        <ProtectedRoute allowedUserTypes={['clinic_admin']}>
          <ClinicAdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ClinicAdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/edit/:id" element={<EditUser />} />
        <Route path="/users/view/:id" element={<ViewUser />} />
        
        {/* Reports Routes */}
        <Route path="/reports" element={<Reports />} />
        
        {/* Other Pages */}
        <Route path="/clinic" element={<ClinicInformation />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/permissions" element={<ClinicAdminPermissions />} />
      </Route>

      {/* SPHM Routes — clinic-scoped, mirrors Clinic Admin's layout/pattern */}
      <Route element={
        <ProtectedRoute allowedUserTypes={['sphm']}>
          <ClinicAdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/sphm" element={<Navigate to="/sphm/midwives" />} />
        <Route path="/sphm/midwives" element={<MidwifeManagement />} />
        <Route path="/sphm/midwives/add" element={<AddMidwife />} />
        <Route path="/sphm/midwives/view/:id" element={<ViewMidwife />} />
        <Route path="/sphm/profile" element={<Profile />} />
      </Route>

      {/* ADO Routes — global role, mirrors Clinic Admin's layout/pattern */}
      <Route element={
        <ProtectedRoute allowedUserTypes={['ad_officer']}>
          <ClinicAdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/ado" element={<Navigate to="/ado/areas" />} />
        <Route path="/ado/areas" element={<AreaZoneManagement />} />
        <Route path="/ado/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
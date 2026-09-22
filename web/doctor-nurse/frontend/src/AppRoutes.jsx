// src/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Unauthorized from './pages/auth/Unauthorized';

// Layouts
import DoctorLayout from './components/layout/DoctorLayout';
import NurseLayout from './components/layout/NurseLayout';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorSearchPatients from './pages/doctor/DoctorSearchPatients';
import DoctorPatientRecord from './pages/doctor/DoctorPatientRecord';
import DoctorPostnatalList from './pages/doctor/DoctorPostnatalList';
import DoctorPostnatalCreate from './pages/doctor/DoctorPostnatalCreate';
import DoctorPostnatalEdit from './pages/doctor/DoctorPostnatalEdit';
import DoctorPostnatalView from './pages/doctor/DoctorPostnatalView';  
import DoctorClinicVisits from './pages/doctor/DoctorClinicVisits';

// Nurse Pages
import NurseDashboard from './pages/nurse/NurseDashboard';
import NurseSearchPatients from './pages/nurse/NurseSearchPatients';
import NursePatientRecord from './pages/nurse/NursePatientRecord';
import NursePostnatalList from './pages/nurse/NursePostnatalList';
import NursePostnatalView from './pages/nurse/NursePostnatalView';
import NursePostnatalEdit from './pages/nurse/NursePostnatalEdit';
import NurseClinicVisits from './pages/nurse/NurseClinicVisits';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ============ PUBLIC ROUTES ============ */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ============ DOCTOR ROUTES ============ */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'SUPER_ADMIN', 'CLINIC_ADMIN']} />
        }
      >
        <Route path="/doctor" element={<DoctorLayout />}>
          {/* Dashboard */}
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Patients */}
          <Route path="patients" element={<DoctorSearchPatients />} />
          <Route path="patient/:patientId" element={<DoctorPatientRecord />} />
          
          {/* Postnatal */}
          <Route path="postnatal" element={<DoctorPostnatalList />} />
          <Route path="postnatal/create" element={<DoctorPostnatalCreate />} />
          <Route path="postnatal/view/:id" element={<DoctorPostnatalView />} />  
          <Route path="postnatal/edit/:id" element={<DoctorPostnatalEdit />} />
          <Route path="clinic-visits" element={<DoctorClinicVisits />} />
        </Route>
      </Route>

      {/* ============ NURSE ROUTES ============ */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']} />
        }
      >
        <Route path="/nurse" element={<NurseLayout />}>
          {/* Dashboard */}
          <Route path="dashboard" element={<NurseDashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Patients */}
          <Route path="patients" element={<NurseSearchPatients />} />
          <Route path="patient/:patientId" element={<NursePatientRecord />} />
          
          {/* Postnatal - Nurse can View & Edit only (No Create) */}
          <Route path="postnatal" element={<NursePostnatalList />} />
          <Route path="postnatal/view/:id" element={<NursePostnatalView />} />  
          <Route path="postnatal/edit/:id" element={<NursePostnatalEdit />} />
          <Route path="clinic-visits" element={<NurseClinicVisits />} />
          
        </Route>
      </Route>

      {/* ============ DEFAULT REDIRECTS ============ */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
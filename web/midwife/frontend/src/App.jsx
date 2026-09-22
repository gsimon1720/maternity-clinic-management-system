import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import PendingPatients from './pages/PendingPatients';
import SearchPatients from './pages/SearchPatients';
import Dashboard from './pages/Dashboard';
import PregnancyList from './components/PregnancyList';
import PregnancyLayout from './components/PregnancyLayout';
import PatientAdmissionForm from './pages/PatientAdmissionForm';
import MidwifeTerritoryView from './pages/MidwifeTerritoryView';
import PatientLayout from './components/PatientLayout';
import MedicalHistory from './pages/MedicalHistory';
import ClinicCare from './pages/ClinicCare';
import PastObstetricHistory from './pages/PastObstetricHistory';
import RoutineLabs from './pages/RoutineLabs';
import BirthPlan from './pages/BirthPlan';
import DeliveryPNC from './pages/DeliveryPNC';
import FamilyHistory from './pages/FamilyHistory';
import MidwifePendingPatients from './pages/MidwifePendingPatients';
import MidwifePatientReview from './pages/MidwifePatientReview';
import AddPregnancy from './pages/AddPregnancy';
import MidwifePregnancyRequests from './pages/MidwifePregnancyRequests';
import MidwifePregnancyRequestReview from './pages/MidwifePregnancyRequestReview';
import DeliveryDetails from './pages/DeliveryDetails';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup />} />

        {isAuthenticated ? (
          <Route element={<DashboardLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pending" element={<PendingPatients />} />
            <Route path="/midwife/pending" element={<MidwifePendingPatients />} />
            <Route
path="/midwife/register/:patientId"
element={<MidwifePatientReview/>}
/>

            <Route path="/midwife/pregnancy-requests" element={<MidwifePregnancyRequests />} />

            <Route 
              path="/midwife/pregnancy-request/:id" 
              element={<MidwifePregnancyRequestReview />} 
            />
            <Route path="/search" element={<SearchPatients />} />

            <Route path="/admit/:id" element={<PatientAdmissionForm />} />
            <Route path="/territory" element={<MidwifeTerritoryView />} />

            <Route path="/patient/:id" element={<PatientLayout />}>
              <Route path="pregnancies" element={<PregnancyList />} />
              <Route 
    path="add-pregnancy" 
    element={<AddPregnancy />} 
  />
              <Route path="medical-history" element={<MedicalHistory />} />
              <Route path="family-history" element={<FamilyHistory />} />
            </Route>

            <Route path="/pregnancy/:pregnancyId" element={<PregnancyLayout />}>
            <Route 
path="delivery-details" 
element={<DeliveryDetails />} 
/>
              <Route path="medical-history" element={<MedicalHistory />} />
              <Route path="past-obstetric-history" element={<PastObstetricHistory />} />
              <Route path="clinic-care" element={<ClinicCare />} />
              <Route path="labs" element={<RoutineLabs />} />
              <Route path="birth-plan" element={<BirthPlan />} />
              <Route path="delivery-pnc" element={<DeliveryPNC />} />
            </Route>

          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
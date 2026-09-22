// src/pages/doctor/DoctorPatientRecord.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patientApi';
import PatientHeader from '../../components/patient/PatientHeader';
import PatientRecordSidebar from '../../components/patient/PatientRecordSidebar';
import CurrentPregnancyView from '../../components/patient/CurrentPregnancyView';
import MedicalHistoryView from '../../components/patient/MedicalHistoryView';
import FamilyHistoryView from '../../components/patient/FamilyHistoryView';
import ClinicVisitsView from '../../components/patient/ClinicVisitsView';
import InvestigationsView from '../../components/patient/InvestigationsView';
import BirthPlanView from '../../components/patient/BirthPlanView';


import PreviousPregnanciesView from '../../components/patient/PreviousPregnanciesView';

import PNCVisitsView from '../../components/patient/PNCVisitsView';
import toast from 'react-hot-toast';

const DoctorPatientRecord = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState('current-pregnancy');

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await patientApi.getPatientWithAllData(patientId);
      if (response.success) {
        setPatientData(response.data);
      } else {
        toast.error('Failed to load patient data');
        navigate('/doctor/patients');
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Error loading patient record');
      navigate('/doctor/patients');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!patientData) return null;

    switch (activeTab) {
      case 'current-pregnancy':
        return (
          <CurrentPregnancyView
            patientId={patientId}
            pregnancy={patientData.currentPregnancy}
            onUpdate={fetchPatientData}
          />
        );
      case 'previous-pregnancies':
        return (
          <PreviousPregnanciesView 
            pregnancies={patientData.previousPregnancies}
            pastHistory={patientData.pastObstetricHistory}
          />
        );
      case 'medical-history':
        return (
          <MedicalHistoryView
            patientId={patientId}
            medicalHistory={patientData.medicalHistory}
            onUpdate={fetchPatientData}
          />
        );
      case 'family-history':
        return (
          <FamilyHistoryView
            patientId={patientId}
            familyHistory={patientData.familyHistory}
            onUpdate={fetchPatientData}
          />
        );
      case 'clinic-visits':
        return (
          <ClinicVisitsView 
            visits={patientData.clinicVisits} 
          />
        );
      case 'investigations':
        return (
          <InvestigationsView 
            investigations={patientData.investigations} 
          />
        );
      case 'birth-plan':
        return (
          <BirthPlanView 
            birthPlan={patientData.birthPlan} 
          />
        );
      
      

        
case 'pnc-visits':
  return (
    <PNCVisitsView 
      visits={patientData.pncVisits} 
    />
  );

        
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">Coming Soon</h2>
            <p className="text-gray-500 mt-2">This section is under development.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient record...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Patient not found</p>
        <button
          onClick={() => navigate('/doctor/patients')}
          className="mt-4 text-primary-600 hover:text-primary-800"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <PatientHeader patient={patientData.patient} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <PatientRecordSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientRecord;
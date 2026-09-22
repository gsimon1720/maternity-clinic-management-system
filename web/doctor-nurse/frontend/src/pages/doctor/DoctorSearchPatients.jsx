// src/pages/doctor/DoctorSearchPatients.jsx
import React from 'react';
import PatientSearch from '../../components/patient/PatientSearch';

const DoctorSearchPatients = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Patients</h1>
        <p className="text-gray-600 mt-1">Search and manage patient records</p>
      </div>
      <PatientSearch role="doctor" />
    </div>
  );
};

export default DoctorSearchPatients;
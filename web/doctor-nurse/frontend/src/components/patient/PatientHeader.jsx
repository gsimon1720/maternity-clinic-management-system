// src/components/patient/PatientHeader.jsx
import React from 'react';
import { FaUser, FaCalendar, FaTint, FaInfoCircle } from 'react-icons/fa';

const PatientHeader = ({ patient }) => {
  if (!patient) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">
              {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <FaUser className="text-gray-400" />
                Patient ID: #{patient.patient_id}
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <FaCalendar className="text-gray-400" />
                Age: {patient.age || calculateAge(patient.dob)}
              </span>
              {patient.blood_group && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <FaTint className="text-gray-400" />
                  Blood: {patient.blood_group}
                </span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                {patient.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 md:mt-0 text-sm text-gray-500">
          <p>NIC: {patient.nic || 'N/A'}</p>
          <p>Registered: {patient.registration_date ? new Date(patient.registration_date).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;
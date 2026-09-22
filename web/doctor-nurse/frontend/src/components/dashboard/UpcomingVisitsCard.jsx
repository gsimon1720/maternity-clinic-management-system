// src/components/dashboard/UpcomingVisitsCard.jsx
// Update the handleViewAll function to check role

import React, { useState } from 'react';
import { FaCalendar, FaUser, FaHospital, FaChevronDown, FaChevronUp, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UpcomingVisitsCard = ({ visits, title = "Upcoming Clinic Visits" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  
  // Determine role-based navigation
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN';
  const isNurse = user?.role === 'NURSE';
  
  // Group visits by patient
  const groupedVisits = visits.reduce((acc, visit) => {
    const key = visit.patient_name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(visit);
    return acc;
  }, {});

  // Get first patient's visits
  const patientNames = Object.keys(groupedVisits);
  const firstPatient = patientNames.length > 0 ? patientNames[0] : null;
  const firstPatientVisits = firstPatient ? groupedVisits[firstPatient] : [];

  const displayVisits = expanded ? firstPatientVisits : firstPatientVisits.slice(0, 3);
  const hasMore = firstPatientVisits.length > 3;

  const getPatientClinic = () => {
    if (firstPatientVisits.length === 0) return 'No Clinic';
    return firstPatientVisits[0]?.clinic || 'No Clinic';
  };

  const getPatientName = () => {
    return firstPatient || 'No Patient';
  };

  const getTotalVisits = () => {
    return firstPatientVisits.length;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Updated: Navigate based on role
  const handleViewAll = () => {
    if (isDoctor) {
      navigate('/doctor/clinic-visits');
    } else if (isNurse) {
      navigate('/nurse/clinic-visits');
    } else {
      navigate('/clinic-visits');
    }
  };

  if (!visits || visits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No upcoming clinic visits found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {visits.length} visits
        </span>
      </div>

      {/* Patient Card */}
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        {/* Patient Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">
                {getPatientName().charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{getPatientName()}</h4>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaHospital className="text-gray-400 text-xs" />
                {getPatientClinic()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-blue-600 font-medium">
              {getTotalVisits()} upcoming visits
            </span>
          </div>
        </div>

        {/* Visits List */}
        <div className="mt-3 space-y-2">
          {displayVisits.map((visit, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <FaCalendar className="text-gray-400 text-sm" />
                <span className="text-sm text-gray-700">{formatDate(visit.date)}</span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  POA: {visit.poa || 'N/A'}
                </span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                {visit.status || 'Upcoming'}
              </span>
            </div>
          ))}
        </div>

        {/* Show More / Show Less */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
          >
            {expanded ? (
              <>Show Less <FaChevronUp className="text-xs" /></>
            ) : (
              <>Show {firstPatientVisits.length - 3} More <FaChevronDown className="text-xs" /></>
            )}
          </button>
        )}

        {/* View All Button */}
        <button
          onClick={handleViewAll}
          className="mt-3 w-full py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <FaEye className="text-sm" />
          View All Records ({visits.length})
        </button>
      </div>

      {/* Other patients summary */}
      {patientNames.length > 1 && (
        <div className="mt-4 text-sm text-gray-500">
          <p className="font-medium text-gray-700">Other patients with upcoming visits:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {patientNames.slice(1, 4).map((name, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                {name} ({groupedVisits[name].length})
              </span>
            ))}
            {patientNames.length > 4 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                +{patientNames.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingVisitsCard;
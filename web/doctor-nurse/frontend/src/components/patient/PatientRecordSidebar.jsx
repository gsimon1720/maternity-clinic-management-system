// src/components/patient/PatientRecordSidebar.jsx
import React from 'react';
import { 
  FaBaby, 
  FaHistory, 
  FaStethoscope, 
  FaUsers, 
  FaClipboardList,
  FaFlask,
  FaBirthdayCake,
  FaCalendarCheck,
  FaHeartbeat,
  FaChild,
  FaFileMedical
} from 'react-icons/fa';

const PatientRecordSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'current-pregnancy', label: 'Current Pregnancy', icon: <FaBaby /> },
    { id: 'previous-pregnancies', label: 'Previous Pregnancies', icon: <FaHistory /> },
    { id: 'medical-history', label: 'Medical History', icon: <FaStethoscope /> },
    { id: 'family-history', label: 'Family History', icon: <FaUsers /> },
    { id: 'clinic-visits', label: 'Clinic Visits', icon: <FaClipboardList /> },
    { id: 'investigations', label: 'Investigations', icon: <FaFlask /> },
    { id: 'birth-plan', label: 'Birth Plan', icon: <FaBirthdayCake /> },
   
   
    { id: 'pnc-visits', label: 'PNC Visits', icon: <FaChild /> }, 
    
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
        Patient Records
      </h3>
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm
              ${activeTab === tab.id 
                ? 'bg-pink-50 text-pink-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <span className={`text-lg ${activeTab === tab.id ? 'text-pink-500' : 'text-gray-400'}`}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PatientRecordSidebar;
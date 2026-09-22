// src/components/dashboard/VisitsTable.jsx
import React from 'react';
import { FaCalendarCheck, FaCalendarDay, FaCalendarTimes } from 'react-icons/fa';

const VisitsTable = ({ visits, title, type = 'upcoming' }) => {
  //  If no visits, show empty state
  if (!visits || visits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No {type === 'upcoming' ? 'upcoming' : 'today\'s'} clinic visits found.</p>
        </div>
      </div>
    );
  }

// Update getStatusColor function:

const getStatusColor = (status) => {
  if (status === 'Upcoming' || status === 'upcoming') 
    return 'bg-pink-100 text-pink-800';
  if (status === 'Today' || status === 'today') 
    return 'bg-green-100 text-green-800';
  if (status === 'Completed' || status === 'completed') 
    return 'bg-gray-100 text-gray-800';
  return 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
  if (status === 'Upcoming' || status === 'upcoming') 
    return <FaCalendarCheck className="text-pink-400" />;
  if (status === 'Today' || status === 'today') 
    return <FaCalendarDay className="text-green-500" />;
  return <FaCalendarTimes className="text-gray-500" />;
};

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Patient Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">POA</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Clinic</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.patient_name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{formatDate(item.date)}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{item.poa || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{item.clinic || '-'}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <span>{item.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitsTable;
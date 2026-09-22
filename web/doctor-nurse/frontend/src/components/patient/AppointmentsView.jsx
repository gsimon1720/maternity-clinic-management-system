// src/components/patient/AppointmentsView.jsx
import React from 'react';
import { FaCalendarCheck } from 'react-icons/fa';

const AppointmentsView = ({ appointments }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointments</h2>
        <div className="text-center py-8 text-gray-500">
          <FaCalendarCheck className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4">No appointments recorded.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointments</h2>
      <div className="space-y-3">
        {appointments.map((appt) => (
          <div key={appt.appointment_id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">
                {new Date(appt.appointment_date).toLocaleDateString()} - {appt.appointment_time?.substring(0, 5)}
              </p>
              <p className="text-sm text-gray-600">{appt.appointment_type || 'Regular'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.status)}`}>
              {appt.status || 'Upcoming'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsView;
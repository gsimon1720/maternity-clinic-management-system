// src/components/patient/ClinicVisitsView.jsx
import React from 'react';
import { FaClipboardList } from 'react-icons/fa';

const ClinicVisitsView = ({ visits }) => {
  if (!visits || visits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinic Visits</h2>
        <div className="text-center py-8 text-gray-500">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4">No clinic visits recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinic Visits</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Pregnancy</th>
              <th className="px-4 py-2 text-left">POA</th>
              <th className="px-4 py-2 text-left">Weight (kg)</th>
              <th className="px-4 py-2 text-left">BP</th>
              <th className="px-4 py-2 text-left">FHS</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.clinic_care_id} className="border-t border-gray-100">
                <td className="px-4 py-2">{new Date(visit.visit_date).toLocaleDateString()}</td>
                <td className="px-4 py-2">#{visit.pregnancy_no}</td>
                <td className="px-4 py-2">{visit.poa || '-'}</td>
                <td className="px-4 py-2">{visit.weight || '-'}</td>
                <td className="px-4 py-2">{visit.bp_systolic}/{visit.bp_diastolic}</td>
                <td className="px-4 py-2">{visit.fhs || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClinicVisitsView;
// src/components/patient/InvestigationsView.jsx
import React from 'react';
import { FaFlask } from 'react-icons/fa';

const InvestigationsView = ({ investigations }) => {
  if (!investigations || investigations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Investigations</h2>
        <div className="text-center py-8 text-gray-500">
          <FaFlask className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4">No investigations recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Investigations</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Pregnancy</th>
              <th className="px-4 py-2 text-left">HB</th>
              <th className="px-4 py-2 text-left">Blood Sugar</th>
              <th className="px-4 py-2 text-left">Syphilis</th>
              <th className="px-4 py-2 text-left">Malaria</th>
            </tr>
          </thead>
          <tbody>
            {investigations.map((inv) => (
              <tr key={inv.investigation_id} className="border-t border-gray-100">
                <td className="px-4 py-2">#{inv.pregnancy_no}</td>
                <td className="px-4 py-2">{inv.hb_1_result || '-'}</td>
                <td className="px-4 py-2">{inv.bs_1_result || '-'}</td>
                <td className="px-4 py-2">{inv.syphilis_result || '-'}</td>
                <td className="px-4 py-2">{inv.malaria_result || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvestigationsView;
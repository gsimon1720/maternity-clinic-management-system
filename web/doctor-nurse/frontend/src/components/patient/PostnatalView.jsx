// src/components/patient/PostnatalView.jsx
import React from 'react';
import { FaHeartbeat } from 'react-icons/fa';

const PostnatalView = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Postnatal Care</h2>
        <div className="text-center py-8 text-gray-500">
          <FaHeartbeat className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4">No postnatal records found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Postnatal Care Records</h2>
      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">
                  Visit Date: {new Date(record.visit_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Pregnancy #{record.pregnancy_no}</p>
              </div>
              <span className="text-sm text-gray-500">Examined by: {record.examined_by || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm">
              {record.breast_problems && <div><span className="text-gray-500">Breast:</span> {record.breast_problems}</div>}
              {record.pallor && <div><span className="text-gray-500">Pallor:</span> {record.pallor}</div>}
              {record.oedema && <div><span className="text-gray-500">Oedema:</span> {record.oedema}</div>}
              {record.blood_pressure_systolic && (
                <div>
                  <span className="text-gray-500">BP:</span> {record.blood_pressure_systolic}/{record.blood_pressure_diastolic}
                </div>
              )}
            </div>
            {record.problems_identified && (
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Problems:</span> {record.problems_identified}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostnatalView;
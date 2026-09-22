// src/components/patient/BirthPlanView.jsx
import React from 'react';
import { FaBirthdayCake } from 'react-icons/fa';

const BirthPlanView = ({ birthPlan }) => {
  if (!birthPlan) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Birth Plan</h2>
        <div className="text-center py-8 text-gray-500">
          <FaBirthdayCake className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4">No birth plan recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Birth Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Plan Date</p>
          <p className="font-medium">{new Date(birthPlan.plan_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Delivery Facility</p>
          <p className="font-medium">{birthPlan.intended_delivery_facility || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Birth Companion</p>
          <p className="font-medium">{birthPlan.birth_companion_name || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Emergency Transport</p>
          <p className="font-medium">{birthPlan.emergency_transport_mode || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Blood Donor</p>
          <p className="font-medium">{birthPlan.blood_donor_name || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Emergency Funds</p>
          <p className="font-medium">{birthPlan.emergency_funds_arranged || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
};

export default BirthPlanView;
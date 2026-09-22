// src/components/patient/PNCVisitsView.jsx
import React, { useState } from 'react';
import { FaHeartbeat, FaChevronDown, FaChevronUp, FaBaby, FaUserMd } from 'react-icons/fa';

const PNCVisitsView = ({ visits }) => {
  const [expanded, setExpanded] = useState(false);

  if (!visits || visits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">PNC Visits</h2>
        <div className="text-center py-8 text-gray-500">
          <FaHeartbeat className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4">No PNC visits recorded.</p>
        </div>
      </div>
    );
  }

  const displayVisits = expanded ? visits : visits.slice(0, 3);
  const hasMore = visits.length > 3;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getVisitTypeColor = (type) => {
    if (type === 'Postnatal' || type === 'PNC') return 'bg-purple-100 text-purple-800';
    if (type === 'Follow-up') return 'bg-blue-100 text-blue-800';
    if (type === 'Emergency') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">PNC Visits</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {visits.length} visits
        </span>
      </div>

      <div className="space-y-4">
        {displayVisits.map((visit) => (
          <div key={visit.pnc_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {formatDate(visit.visit_date)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getVisitTypeColor(visit.visit_type)}`}>
                    {visit.visit_type || 'PNC Visit'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Pregnancy #{visit.pregnancy_no}</p>
              </div>
              {visit.next_clinic_date && (
                <span className="text-xs text-blue-600">
                  Next: {formatDate(visit.next_clinic_date)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Mother Examination */}
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Mother Examination</p>
                <div className="space-y-0.5 text-sm">
                  {visit.mother_temp && <p><span className="text-gray-500">Temp:</span> {visit.mother_temp}°C</p>}
                  {visit.mother_anemia && <p><span className="text-gray-500">Anemia:</span> {visit.mother_anemia}</p>}
                  {visit.mother_breasts && <p><span className="text-gray-500">Breasts:</span> {visit.mother_breasts}</p>}
                  {visit.uterine_involution && <p><span className="text-gray-500">Uterus:</span> {visit.uterine_involution}</p>}
                  {visit.lochia_type && <p><span className="text-gray-500">Lochia:</span> {visit.lochia_type}</p>}
                </div>
              </div>

              {/* Mental Health */}
              {(visit.epds_status || visit.mood_changes) && (
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Mental Health</p>
                  <div className="space-y-0.5 text-sm">
                    {visit.epds_status && <p><span className="text-gray-500">EPDS:</span> {visit.epds_status}</p>}
                    {visit.mood_changes && <p><span className="text-gray-500">Mood:</span> {visit.mood_changes}</p>}
                  </div>
                </div>
              )}

              {/* Child / Newborn */}
              {(visit.child_distress_signs || visit.child_fever || visit.umbilical_cord_status) && (
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Newborn</p>
                  <div className="space-y-0.5 text-sm">
                    {visit.child_distress_signs && <p><span className="text-gray-500">Distress:</span> {visit.child_distress_signs}</p>}
                    {visit.child_fever && <p><span className="text-gray-500">Fever:</span> {visit.child_fever}</p>}
                    {visit.umbilical_cord_status && <p><span className="text-gray-500">Cord:</span> {visit.umbilical_cord_status}</p>}
                    {visit.bcg_vaccination && <p><span className="text-gray-500">BCG:</span> {visit.bcg_vaccination}</p>}
                  </div>
                </div>
              )}

              {/* Family Planning */}
              {visit.family_planning_importance && (
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Family Planning</p>
                  <div className="space-y-0.5 text-sm">
                    {visit.family_planning_importance && <p><span className="text-gray-500">Importance:</span> {visit.family_planning_importance}</p>}
                    {visit.family_planning_methods && <p><span className="text-gray-500">Methods:</span> {visit.family_planning_methods}</p>}
                  </div>
                </div>
              )}

              {/* Education */}
              {visit.infant_care_edu && (
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Education Provided</p>
                  <div className="space-y-0.5 text-sm">
                    {visit.infant_care_edu && <p><span className="text-gray-500">Infant Care:</span> {visit.infant_care_edu}</p>}
                    {visit.exclusive_breastfeeding_edu && <p><span className="text-gray-500">Breastfeeding:</span> {visit.exclusive_breastfeeding_edu}</p>}
                    {visit.pnc_danger_signs_edu && <p><span className="text-gray-500">Danger Signs:</span> {visit.pnc_danger_signs_edu}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Other Remarks */}
            {visit.other_remarks && (
              <div className="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
                <span className="text-gray-500">Remarks:</span> {visit.other_remarks}
              </div>
            )}

            {visit.cause_of_death && (
              <div className="mt-1 text-sm text-red-600">
                <span className="font-medium">Cause of Death:</span> {visit.cause_of_death}
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
        >
          {expanded ? (
            <>Show Less <FaChevronUp className="text-xs" /></>
          ) : (
            <>Show {visits.length - 3} More Visits <FaChevronDown className="text-xs" /></>
          )}
        </button>
      )}

      
    </div>
  );
};

export default PNCVisitsView;
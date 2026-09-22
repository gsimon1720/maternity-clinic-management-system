// src/components/patient/PreviousPregnanciesView.jsx
import React, { useState } from 'react';
import { FaHistory, FaChevronDown, FaChevronUp, FaBaby, FaCalendar, FaUserMd, FaHeartbeat } from 'react-icons/fa';

const PreviousPregnanciesView = ({ pregnancies, pastHistory }) => {
  const [expandedPregnancy, setExpandedPregnancy] = useState(null);

  if (!pregnancies || pregnancies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Pregnancies</h2>
        <div className="text-center py-8 text-gray-500">
          <FaHistory className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4">No previous pregnancies recorded.</p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const toggleExpand = (pregnancyId) => {
    if (expandedPregnancy === pregnancyId) {
      setExpandedPregnancy(null);
    } else {
      setExpandedPregnancy(pregnancyId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'MISCARRIAGE': return 'bg-red-100 text-red-800';
      case 'TERMINATED': return 'bg-gray-100 text-gray-800';
      case 'REFERRED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get past obstetric history for a specific pregnancy
  const getPastHistories = (pregnancyId) => {
    if (!pastHistory) return [];
    return pastHistory.filter(h => h.pregnancy_id === pregnancyId);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Previous Pregnancies ({pregnancies.length})
        </h2>
      </div>
      
      <div className="space-y-4">
        {pregnancies.map((pregnancy, index) => {
          const isExpanded = expandedPregnancy === pregnancy.pregnancy_id;
          const pastHistories = getPastHistories(pregnancy.pregnancy_id);

          return (
            <div key={pregnancy.pregnancy_id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header - Click to expand */}
              <div 
                className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                onClick={() => toggleExpand(pregnancy.pregnancy_id)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-semibold text-gray-900">Pregnancy #{pregnancy.pregnancy_no}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pregnancy.pregnancy_status)}`}>
                    {pregnancy.pregnancy_status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {pregnancy.lmp ? `LMP: ${formatDate(pregnancy.lmp)}` : 'No LMP'}
                  </span>
                  {pastHistories.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {pastHistories.length} delivery records
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-200">
                  {/* Pregnancy Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="text-gray-500">Registration #:</span> {pregnancy.registration_number || 'N/A'}</p>
                        
                        <p className="text-sm"><span className="text-gray-500">Midwife:</span> {pregnancy.midwife_name || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Obstetric History */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Obstetric History</h4>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="text-gray-500">Gravida:</span> {pregnancy.gravida || 'N/A'}</p>
                        <p className="text-sm"><span className="text-gray-500">Parity:</span> {pregnancy.parity || 'N/A'}</p>
                        <p className="text-sm"><span className="text-gray-500">Living Children:</span> {pregnancy.living_children || '0'}</p>
                        <p className="text-sm"><span className="text-gray-500">Youngest Child Age:</span> {pregnancy.youngest_child_age || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Important Dates</h4>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="text-gray-500">LMP:</span> {formatDate(pregnancy.lmp)}</p>
                        <p className="text-sm"><span className="text-gray-500">EDD:</span> {formatDate(pregnancy.edd)}</p>
                        
                      </div>
                    </div>

                   

                    {/* Delivery Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Information</h4>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="text-gray-500">Outcome:</span> {pregnancy.pregnancy_outcome || 'N/A'}</p>
                        <p className="text-sm"><span className="text-gray-500">Delivery Date:</span> {formatDate(pregnancy.delivery_date)}</p>
                        <p className="text-sm"><span className="text-gray-500">Delivery Method:</span> {pregnancy.delivery_method || 'N/A'}</p>
                        <p className="text-sm"><span className="text-gray-500">Mother Condition:</span> {pregnancy.mother_condition || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Family Planning */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Family Planning</h4>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="text-gray-500">Planning Before:</span> {pregnancy.family_planning_before_pregnancy || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* ========================================== */}
                  {/*  PAST OBSTETRIC HISTORY - INSIDE PREGNANCY */}
                  {/* ========================================== */}
                  {pastHistories.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaBaby className="text-pink-400" />
                        Delivery History ({pastHistories.length})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-pink-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700">#</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700">Year</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700">GA (Weeks)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700">Outcome</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700">Sex</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700">Birth Weight</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700">Mode</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700">Place</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pastHistories.map((history, idx) => (
                              <tr key={history.history_id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                                <td className="px-3 py-2 text-gray-700">{history.year_of_delivery || 'N/A'}</td>
                                <td className="px-3 py-2 text-gray-700">{history.gestational_age_weeks || 'N/A'}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    history.outcome === 'Live Birth' ? 'bg-green-100 text-green-800' : 
                                    history.outcome === 'Stillbirth' ? 'bg-red-100 text-red-800' : 
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {history.outcome || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-gray-700">{history.sex || 'N/A'}</td>
                                <td className="px-3 py-2 text-gray-700">{history.birth_weight_kg || 'N/A'} kg</td>
                                <td className="px-3 py-2 text-gray-700">{history.mode_of_delivery || 'N/A'}</td>
                                <td className="px-3 py-2 text-gray-700 max-w-xs truncate" title={history.place_of_delivery}>
                                  {history.place_of_delivery || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Additional Details for Past Obstetric */}
                      {pastHistories.some(h => h.antenatal_complications || h.postnatal_complications || h.remarks) && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {pastHistories.map((history, idx) => (
                            <div key={`details-${idx}`} className="bg-gray-50 rounded-lg p-2 text-sm">
                              <p className="font-medium text-gray-700">Delivery #{idx + 1}</p>
                              {history.antenatal_complications && (
                                <p><span className="text-gray-500">Antenatal:</span> {history.antenatal_complications}</p>
                              )}
                              {history.postnatal_complications && (
                                <p><span className="text-gray-500">Postnatal:</span> {history.postnatal_complications}</p>
                              )}
                              {history.remarks && (
                                <p><span className="text-gray-500">Remarks:</span> {history.remarks}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Past Obstetric History */}
                  {pastHistories.length === 0 && (
                    <div className="mt-4 text-sm text-gray-400 bg-gray-50 rounded-lg p-3 text-center">
                      <p>No delivery history records for this pregnancy.</p>
                    </div>
                  )}

                  
                </div>
              )}
            </div>
          );
        })}
      </div>

      
    </div>
  );
};

export default PreviousPregnanciesView;
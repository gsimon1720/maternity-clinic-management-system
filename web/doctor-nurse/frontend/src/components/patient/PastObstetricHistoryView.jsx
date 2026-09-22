// src/components/patient/PastObstetricHistoryView.jsx
import React, { useState } from 'react';
import { FaHistory, FaChevronDown, FaChevronUp, FaBaby, FaCalendar } from 'react-icons/fa';

const PastObstetricHistoryView = ({ histories }) => {
  const [expanded, setExpanded] = useState(false);

  if (!histories || histories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Obstetric History</h2>
        <div className="text-center py-8 text-gray-500">
          <FaHistory className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4">No past obstetric history recorded.</p>
        </div>
      </div>
    );
  }

  const displayHistories = expanded ? histories : histories.slice(0, 3);
  const hasMore = histories.length > 3;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Past Obstetric History</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {histories.length} records
        </span>
      </div>

      <div className="space-y-3">
        {displayHistories.map((history, index) => (
          <div key={history.history_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-gray-500">Pregnancy #</p>
                <p className="font-medium text-gray-900">{history.pregnancy_no}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Year of Delivery</p>
                <p className="font-medium text-gray-900">{history.year_of_delivery || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gestational Age</p>
                <p className="font-medium text-gray-900">{history.gestational_age_weeks || 'N/A'} weeks</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Outcome</p>
                <p className={`font-medium ${history.outcome === 'Live Birth' ? 'text-green-600' : history.outcome === 'Stillbirth' ? 'text-red-600' : 'text-gray-600'}`}>
                  {history.outcome || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sex</p>
                <p className="font-medium text-gray-900">{history.sex || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Birth Weight</p>
                <p className="font-medium text-gray-900">{history.birth_weight_kg || 'N/A'} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mode of Delivery</p>
                <p className="font-medium text-gray-900">{history.mode_of_delivery || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Place</p>
                <p className="font-medium text-gray-900 truncate" title={history.place_of_delivery}>
                  {history.place_of_delivery || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Additional details */}
            {(history.antenatal_complications || history.postnatal_complications || history.remarks) && (
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                {history.antenatal_complications && (
                  <div>
                    <p className="text-xs text-gray-500">Antenatal Complications</p>
                    <p className="text-sm text-gray-700">{history.antenatal_complications}</p>
                  </div>
                )}
                {history.postnatal_complications && (
                  <div>
                    <p className="text-xs text-gray-500">Postnatal Complications</p>
                    <p className="text-sm text-gray-700">{history.postnatal_complications}</p>
                  </div>
                )}
                {history.remarks && (
                  <div>
                    <p className="text-xs text-gray-500">Remarks</p>
                    <p className="text-sm text-gray-700">{history.remarks}</p>
                  </div>
                )}
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
            <>Show {histories.length - 3} More Records <FaChevronDown className="text-xs" /></>
          )}
        </button>
      )}

      
    </div>
  );
};

export default PastObstetricHistoryView;
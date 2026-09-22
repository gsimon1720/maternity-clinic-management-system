// src/pages/doctor/DoctorClinicVisits.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaUser, FaHospital, FaSearch } from 'react-icons/fa';
import { clinicCareApi } from '../../api/clinicCareApi';
import toast from 'react-hot-toast';

const DoctorClinicVisits = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchVisits();
  }, [filter, pagination.page]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await clinicCareApi.getAll({
        type: filter,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        setVisits(response.data.visits);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast.error('Failed to load clinic visits');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    if (status === 'Upcoming') return 'bg-blue-100 text-blue-800';
    if (status === 'Today') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1 mb-2"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">All Clinic Visits</h1>
          <p className="text-gray-600 mt-1">View all clinic visit records</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {pagination.total} visits
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'upcoming' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'today' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'completed' 
              ? 'bg-gray-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading visits...</p>
            </div>
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendar className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No clinic visits found</h3>
            <p className="mt-2 text-gray-500">No visits match your current filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">POA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visits.map((visit, index) => (
                    <tr key={visit.clinic_care_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {visit.patient_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(visit.visit_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visit.poa || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visit.weight || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visit.bp_systolic}/{visit.bp_diastolic || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visit.clinic_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                          {visit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorClinicVisits;
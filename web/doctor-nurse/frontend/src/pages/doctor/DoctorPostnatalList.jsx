// src/pages/doctor/DoctorPostnatalList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash, FaBaby } from 'react-icons/fa';
import { postnatalApi } from '../../api/postnatalApi';
import toast from 'react-hot-toast';

const DoctorPostnatalList = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchRecords();
  }, [pagination.page]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await postnatalApi.getAll({
        page: pagination.page,
        limit: pagination.limit
      });
      
      console.log('📊 Postnatal Records Response:', response); // Debug log
      
      if (response.success) {
        // ✅ Check if data exists and is an array
        const recordsData = response.data?.data || response.data || [];
        setRecords(Array.isArray(recordsData) ? recordsData : []);
        
        setPagination({
          page: response.data?.page || 1,
          limit: response.data?.limit || 10,
          total: response.data?.total || 0,
          totalPages: response.data?.totalPages || 0
        });
      } else {
        toast.error('Failed to load postnatal records');
      }
    } catch (error) {
      console.error('Error fetching postnatal records:', error);
      toast.error('Failed to load postnatal records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const response = await postnatalApi.delete(id);
      if (response.success) {
        toast.success('Record deleted successfully');
        fetchRecords();
      }
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Postnatal Clinic Care</h1>
          <p className="text-gray-600 mt-1">Manage postnatal clinic care records</p>
        </div>
        <Link
          to="/doctor/postnatal/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
        >
          <FaPlus /> New Record
        </Link>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading records...</p>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <FaBaby className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No postnatal records</h3>
            <p className="mt-2 text-gray-500">Click "New Record" to create a postnatal care record.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pregnancy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Examined By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record, index) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.visit_date ? new Date(record.visit_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.first_name} {record.last_name || ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        #{record.pregnancy_no || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.examined_by || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.blood_pressure_systolic}/{record.blood_pressure_diastolic || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/doctor/postnatal/view/${record.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Record"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => navigate(`/doctor/postnatal/edit/${record.id}`)}
                            className="text-primary-600 hover:text-primary-800"
                            title="Edit Record"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Record"
                          >
                            <FaTrash />
                          </button>
                        </div>
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
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
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

export default DoctorPostnatalList;
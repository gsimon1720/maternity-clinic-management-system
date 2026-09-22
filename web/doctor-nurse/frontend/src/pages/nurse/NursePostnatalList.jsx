// src/pages/nurse/NursePostnatalList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaBaby } from 'react-icons/fa';
import { postnatalApi } from '../../api/postnatalApi';
import toast from 'react-hot-toast';

const NursePostnatalList = () => {
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
      if (response.success) {
        setRecords(response.data.data);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
      }
    } catch (error) {
      console.error('Error fetching postnatal records:', error);
      toast.error('Failed to load postnatal records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Postnatal Clinic Care</h1>
          <p className="text-gray-600 mt-1">View and manage postnatal clinic care records</p>
        </div>
        <div className="text-sm text-gray-500">
          <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
            👩‍⚕️ Nurse - View & Edit Only
          </span>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading records...</p>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <FaBaby className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No postnatal records</h3>
            <p className="mt-2 text-gray-500">No postnatal care records available.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Examined By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(record.visit_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.first_name} {record.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.examined_by || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.blood_pressure_systolic}/{record.blood_pressure_diastolic}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/nurse/postnatal/view/${record.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Record"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => navigate(`/nurse/postnatal/edit/${record.id}`)}
                            className="text-teal-600 hover:text-teal-800"
                            title="Edit Record"
                          >
                            <FaEdit />
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
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Permission Note */}
      <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
        <p className="text-sm text-teal-800">
          📌 <span className="font-medium">Nurse Permissions:</span> View and Edit only. 
          Cannot create or delete records. Contact Doctor for create/delete operations.
        </p>
      </div>
    </div>
  );
};

export default NursePostnatalList;
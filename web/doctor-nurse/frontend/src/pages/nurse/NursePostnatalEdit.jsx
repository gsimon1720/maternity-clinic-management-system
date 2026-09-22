// src/pages/nurse/NursePostnatalEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostnatalForm from '../../components/postnatal/PostnatalForm';
import { postnatalApi } from '../../api/postnatalApi';
import toast from 'react-hot-toast';

const NursePostnatalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const response = await postnatalApi.getById(id);
      if (response.success) {
        setRecord(response.data);
      } else {
        toast.error('Record not found');
        navigate('/nurse/postnatal');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      toast.error('Failed to load record');
      navigate('/nurse/postnatal');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate('/nurse/postnatal');
  };

  const handleCancel = () => {
    navigate('/nurse/postnatal');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading record...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Postnatal Record</h1>
            <p className="text-gray-600 mt-1">
              Editing postnatal record from {record?.visit_date ? new Date(record.visit_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          
        </div>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          You can edit this record. Create and Delete are not available for Nurse.
        </div>
      </div>

      <PostnatalForm
        mode="edit"
        initialData={record}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default NursePostnatalEdit;
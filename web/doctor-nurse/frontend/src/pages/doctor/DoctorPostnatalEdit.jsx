// src/pages/doctor/DoctorPostnatalEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostnatalForm from '../../components/postnatal/PostnatalForm';
import { postnatalApi } from '../../api/postnatalApi';
import toast from 'react-hot-toast';

const DoctorPostnatalEdit = () => {
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
        navigate('/doctor/postnatal');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      toast.error('Failed to load record');
      navigate('/doctor/postnatal');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate('/doctor/postnatal');
  };

  const handleCancel = () => {
    navigate('/doctor/postnatal');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading record...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Postnatal Record</h1>
        <p className="text-gray-600 mt-1">
          Editing postnatal record from {record?.visit_date ? new Date(record.visit_date).toLocaleDateString() : 'N/A'}
        </p>
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

export default DoctorPostnatalEdit;
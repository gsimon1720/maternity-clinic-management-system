// src/pages/doctor/DoctorPostnatalView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostnatalForm from '../../components/postnatal/PostnatalForm';
import { postnatalApi } from '../../api/postnatalApi';
import toast from 'react-hot-toast';

const DoctorPostnatalView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    if (id) {
      fetchRecord();
    } else {
      toast.error('Invalid record ID');
      navigate('/doctor/postnatal');
    }
  }, [id]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching record with ID:', id); // Debug log
      
      const response = await postnatalApi.getById(id);
      console.log('📊 Response:', response); // Debug log
      
      if (response.success) {
        setRecord(response.data);
      } else {
        toast.error(response.message || 'Record not found');
        navigate('/doctor/postnatal');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      console.error('Error response:', error.response); // Debug log
      
      if (error.response?.status === 404) {
        toast.error('Record not found');
      } else {
        toast.error('Failed to load record');
      }
      navigate('/doctor/postnatal');
    } finally {
      setLoading(false);
    }
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

  if (!record) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Record not found</p>
        <button
          onClick={() => navigate('/doctor/postnatal')}
          className="mt-4 text-primary-600 hover:text-primary-800"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">View Postnatal Record</h1>
            <p className="text-gray-600 mt-1">
              Viewing postnatal record from {record?.visit_date ? new Date(record.visit_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <button
            onClick={() => navigate(`/doctor/postnatal/edit/${record.id}`)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
          >
            ✏️ Edit Record
          </button>
        </div>
      </div>

      <PostnatalForm
        mode="view"
        initialData={record}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default DoctorPostnatalView;
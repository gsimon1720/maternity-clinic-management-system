// src/components/patient/FamilyHistoryView.jsx
import React, { useState } from 'react';
import { FaEdit, FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { patientApi } from '../../api/patientApi';

const FamilyHistoryView = ({ patientId, familyHistory, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    diabetes: familyHistory?.diabetes || false,
    hypertension: familyHistory?.hypertension || false,
    twin_pregnancies: familyHistory?.twin_pregnancies || false,
    congenital_disorders: familyHistory?.congenital_disorders || false,
    thalassemia: familyHistory?.thalassemia || false,
    sickle_cell_disease: familyHistory?.sickle_cell_disease || false,
    genetic_disorders: familyHistory?.genetic_disorders || false,
    psychiatric_illness: familyHistory?.psychiatric_illness || false,
    other_conditions: familyHistory?.other_conditions || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await patientApi.updateFamilyHistory(patientId, formData);
      if (response.success) {
        toast.success('Family history updated successfully');
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to update family history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      diabetes: familyHistory?.diabetes || false,
      hypertension: familyHistory?.hypertension || false,
      twin_pregnancies: familyHistory?.twin_pregnancies || false,
      congenital_disorders: familyHistory?.congenital_disorders || false,
      thalassemia: familyHistory?.thalassemia || false,
      sickle_cell_disease: familyHistory?.sickle_cell_disease || false,
      genetic_disorders: familyHistory?.genetic_disorders || false,
      psychiatric_illness: familyHistory?.psychiatric_illness || false,
      other_conditions: familyHistory?.other_conditions || '',
    });
  };

  const ConditionItem = ({ label, name, checked }) => (
    <div className="flex items-center space-x-2">
      <span className="w-5 h-5 flex items-center justify-center">
        {checked ? <FaCheckCircle className="text-green-500" /> : <span className="text-gray-300">○</span>}
      </span>
      <span className={`text-sm ${checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );

  if (!isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Family History</h2>
          
        </div>

        {familyHistory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ConditionItem label="Diabetes" checked={familyHistory.diabetes} />
            <ConditionItem label="Hypertension" checked={familyHistory.hypertension} />
            <ConditionItem label="Twin Pregnancies" checked={familyHistory.twin_pregnancies} />
            <ConditionItem label="Congenital Disorders" checked={familyHistory.congenital_disorders} />
            <ConditionItem label="Thalassemia" checked={familyHistory.thalassemia} />
            <ConditionItem label="Sickle Cell Disease" checked={familyHistory.sickle_cell_disease} />
            <ConditionItem label="Genetic Disorders" checked={familyHistory.genetic_disorders} />
            <ConditionItem label="Psychiatric Illness" checked={familyHistory.psychiatric_illness} />
            {familyHistory.other_conditions && (
              <div className="col-span-2 mt-2">
                <p className="text-sm font-medium text-gray-700">Other Conditions</p>
                <p className="text-gray-600">{familyHistory.other_conditions}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No family history recorded yet.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Family History</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="diabetes" checked={formData.diabetes} onChange={handleChange} className="w-4 h-4" />
            <span>Diabetes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="hypertension" checked={formData.hypertension} onChange={handleChange} className="w-4 h-4" />
            <span>Hypertension</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="twin_pregnancies" checked={formData.twin_pregnancies} onChange={handleChange} className="w-4 h-4" />
            <span>Twin Pregnancies</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="congenital_disorders" checked={formData.congenital_disorders} onChange={handleChange} className="w-4 h-4" />
            <span>Congenital Disorders</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="thalassemia" checked={formData.thalassemia} onChange={handleChange} className="w-4 h-4" />
            <span>Thalassemia</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="sickle_cell_disease" checked={formData.sickle_cell_disease} onChange={handleChange} className="w-4 h-4" />
            <span>Sickle Cell Disease</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="genetic_disorders" checked={formData.genetic_disorders} onChange={handleChange} className="w-4 h-4" />
            <span>Genetic Disorders</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="psychiatric_illness" checked={formData.psychiatric_illness} onChange={handleChange} className="w-4 h-4" />
            <span>Psychiatric Illness</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Other Conditions</label>
          <input
            type="text"
            name="other_conditions"
            value={formData.other_conditions}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2">
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2">
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyHistoryView;
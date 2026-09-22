// src/components/patient/MedicalHistoryView.jsx
import React, { useState } from 'react';
import { FaEdit, FaSave, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { patientApi } from '../../api/patientApi';

const MedicalHistoryView = ({ patientId, medicalHistory, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    diabetes: medicalHistory?.diabetes || false,
    hypertension: medicalHistory?.hypertension || false,
    cardiac_disease: medicalHistory?.cardiac_disease || false,
    renal_disease: medicalHistory?.renal_disease || false,
    thyroid_disease: medicalHistory?.thyroid_disease || false,
    bronchial_asthma: medicalHistory?.bronchial_asthma || false,
    epilepsy: medicalHistory?.epilepsy || false,
    psychiatric_illness: medicalHistory?.psychiatric_illness || false,
    tuberculosis: medicalHistory?.tuberculosis || false,
    malignancy: medicalHistory?.malignancy || false,
    previous_dvt: medicalHistory?.previous_dvt || false,
    blood_transfusion_history: medicalHistory?.blood_transfusion_history || false,
    drug_allergies: medicalHistory?.drug_allergies || '',
    other_conditions: medicalHistory?.other_conditions || '',
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
      const response = await patientApi.updateMedicalHistory(patientId, formData);
      if (response.success) {
        toast.success('Medical history updated successfully');
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to update medical history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      diabetes: medicalHistory?.diabetes || false,
      hypertension: medicalHistory?.hypertension || false,
      cardiac_disease: medicalHistory?.cardiac_disease || false,
      renal_disease: medicalHistory?.renal_disease || false,
      thyroid_disease: medicalHistory?.thyroid_disease || false,
      bronchial_asthma: medicalHistory?.bronchial_asthma || false,
      epilepsy: medicalHistory?.epilepsy || false,
      psychiatric_illness: medicalHistory?.psychiatric_illness || false,
      tuberculosis: medicalHistory?.tuberculosis || false,
      malignancy: medicalHistory?.malignancy || false,
      previous_dvt: medicalHistory?.previous_dvt || false,
      blood_transfusion_history: medicalHistory?.blood_transfusion_history || false,
      drug_allergies: medicalHistory?.drug_allergies || '',
      other_conditions: medicalHistory?.other_conditions || '',
    });
  };

  const ConditionItem = ({ label, name, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={!isEditing}
        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
      />
      <span className={`text-sm ${checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
        {label}
      </span>
      {checked && <FaCheckCircle className="text-green-500 text-xs" />}
    </label>
  );

  if (!isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Medical History</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium"
          >
            <FaEdit /> Edit
          </button>
        </div>

        {medicalHistory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Diabetes</p>
              <p className="text-gray-600">{medicalHistory.diabetes ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Hypertension</p>
              <p className="text-gray-600">{medicalHistory.hypertension ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Cardiac Disease</p>
              <p className="text-gray-600">{medicalHistory.cardiac_disease ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Drug Allergies</p>
              <p className="text-gray-600">{medicalHistory.drug_allergies || 'None'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-700">Other Conditions</p>
              <p className="text-gray-600">{medicalHistory.other_conditions || 'None'}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No medical history recorded yet.</p>
            <p className="text-sm mt-1">Click Edit to add medical history.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Edit Medical History</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ConditionItem 
            label="Diabetes" 
            name="diabetes" 
            checked={formData.diabetes} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Hypertension" 
            name="hypertension" 
            checked={formData.hypertension} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Cardiac Disease" 
            name="cardiac_disease" 
            checked={formData.cardiac_disease} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Renal Disease" 
            name="renal_disease" 
            checked={formData.renal_disease} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Thyroid Disease" 
            name="thyroid_disease" 
            checked={formData.thyroid_disease} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Bronchial Asthma" 
            name="bronchial_asthma" 
            checked={formData.bronchial_asthma} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Epilepsy" 
            name="epilepsy" 
            checked={formData.epilepsy} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Psychiatric Illness" 
            name="psychiatric_illness" 
            checked={formData.psychiatric_illness} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Tuberculosis" 
            name="tuberculosis" 
            checked={formData.tuberculosis} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Malignancy" 
            name="malignancy" 
            checked={formData.malignancy} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Previous DVT" 
            name="previous_dvt" 
            checked={formData.previous_dvt} 
            onChange={handleChange} 
          />
          <ConditionItem 
            label="Blood Transfusion" 
            name="blood_transfusion_history" 
            checked={formData.blood_transfusion_history} 
            onChange={handleChange} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Drug Allergies</label>
          <input
            type="text"
            name="drug_allergies"
            value={formData.drug_allergies}
            onChange={handleChange}
            placeholder="e.g. Penicillin, Sulfa"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Other Conditions</label>
          <textarea
            name="other_conditions"
            value={formData.other_conditions}
            onChange={handleChange}
            rows="3"
            placeholder="Any other medical conditions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2"
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalHistoryView;
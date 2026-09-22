// src/components/patient/CurrentPregnancyView.jsx
import React, { useState } from 'react';
import { FaEdit, FaSave, FaTimes, FaBaby, FaCalendar, FaUserMd, FaHeartbeat } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { patientApi } from '../../api/patientApi';


const CurrentPregnancyView = ({ patientId, pregnancy, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: pregnancy?.registration_number || '',
    registration_date: pregnancy?.registration_date || '',
    pregnant_mother_register_number: pregnancy?.pregnant_mother_register_number || '',
    pregnant_mother_register_date: pregnancy?.pregnant_mother_register_date || '',
    gravida: pregnancy?.gravida || '',
    parity: pregnancy?.parity || '',
    living_children: pregnancy?.living_children || '',
    youngest_child_age: pregnancy?.youngest_child_age || '',
    lmp: pregnancy?.lmp || '',
    edd: pregnancy?.edd || '',
    us_corrected_edd: pregnancy?.us_corrected_edd || '',
    expected_delivery_date: pregnancy?.expected_delivery_date || '',
    completion_40_weeks: pregnancy?.completion_40_weeks || '',
    quickening_date: pregnancy?.quickening_date || '',
    poa_at_registration: pregnancy?.poa_at_registration || '',
    poa_at_dating_scan: pregnancy?.poa_at_dating_scan || '',
    antenatal_risk_conditions: pregnancy?.antenatal_risk_conditions || '',
    family_planning_before_pregnancy: pregnancy?.family_planning_before_pregnancy || '',
    pregnancy_outcome: pregnancy?.pregnancy_outcome || '',
    delivery_date: pregnancy?.delivery_date || '',
    delivery_method: pregnancy?.delivery_method || '',
    mother_condition: pregnancy?.mother_condition || '',
  });

  if (!pregnancy) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-8">
          <FaBaby className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Current Pregnancy</h3>
          <p className="mt-2 text-gray-500">This patient does not have an active pregnancy.</p>
          <p className="text-sm text-gray-400">Only Midwife can create pregnancy records.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await patientApi.updateCurrentPregnancy(
        patientId,
        pregnancy.pregnancy_id,
        formData
      );
      if (response.success) {
        toast.success('Pregnancy updated successfully');
        setIsEditing(false);
        onUpdate?.();
      }
    } catch (error) {
      toast.error('Failed to update pregnancy');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      registration_number: pregnancy?.registration_number || '',
      registration_date: pregnancy?.registration_date || '',
      pregnant_mother_register_number: pregnancy?.pregnant_mother_register_number || '',
      pregnant_mother_register_date: pregnancy?.pregnant_mother_register_date || '',
      gravida: pregnancy?.gravida || '',
      parity: pregnancy?.parity || '',
      living_children: pregnancy?.living_children || '',
      youngest_child_age: pregnancy?.youngest_child_age || '',
      lmp: pregnancy?.lmp || '',
      edd: pregnancy?.edd || '',
      us_corrected_edd: pregnancy?.us_corrected_edd || '',
      expected_delivery_date: pregnancy?.expected_delivery_date || '',
      completion_40_weeks: pregnancy?.completion_40_weeks || '',
      quickening_date: pregnancy?.quickening_date || '',
      poa_at_registration: pregnancy?.poa_at_registration || '',
      poa_at_dating_scan: pregnancy?.poa_at_dating_scan || '',
      antenatal_risk_conditions: pregnancy?.antenatal_risk_conditions || '',
      family_planning_before_pregnancy: pregnancy?.family_planning_before_pregnancy || '',
      pregnancy_outcome: pregnancy?.pregnancy_outcome || '',
      delivery_date: pregnancy?.delivery_date || '',
      delivery_method: pregnancy?.delivery_method || '',
      mother_condition: pregnancy?.mother_condition || '',
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const InfoRow = ({ label, value }) => (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
  );

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Current Pregnancy</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Date</label>
              <input type="date" name="registration_date" value={formData.registration_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gravida</label>
              <input type="number" name="gravida" value={formData.gravida} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parity</label>
              <input type="number" name="parity" value={formData.parity} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Living Children</label>
              <input type="number" name="living_children" value={formData.living_children} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Youngest Child Age</label>
              <input type="number" name="youngest_child_age" value={formData.youngest_child_age} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LMP</label>
              <input type="date" name="lmp" value={formData.lmp} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">EDD</label>
              <input type="date" name="lmp" value={formData.edd} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400" />
            </div>
            
          </div>
          
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-lg font-medium flex items-center gap-2">
              <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium flex items-center gap-2">
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Current Pregnancy</h2>
        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-pink-400 hover:text-pink-600 font-medium">
          <FaEdit /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
          <InfoRow label="Pregnancy #" value={pregnancy.pregnancy_no} />
          
          <InfoRow label="Status" value={
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              pregnancy.pregnancy_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {pregnancy.pregnancy_status}
            </span>
          } />
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Obstetric History</h4>
          <InfoRow label="Gravida" value={pregnancy.gravida} />
          <InfoRow label="Parity" value={pregnancy.parity} />
          <InfoRow label="Living Children" value={pregnancy.living_children} />
          <InfoRow label="Youngest Child Age" value={pregnancy.youngest_child_age} />
          <InfoRow label="Midwife" value={pregnancy.midwife_name || 'N/A'} />
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Important Dates</h4>
          <InfoRow label="LMP" value={formatDate(pregnancy.lmp)} />
          <InfoRow label="EDD" value={formatDate(pregnancy.edd)} />
          
        </div>

       

        {pregnancy.pregnancy_status !== 'ACTIVE' && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Information</h4>
            <InfoRow label="Outcome" value={pregnancy.pregnancy_outcome} />
            <InfoRow label="Delivery Date" value={formatDate(pregnancy.delivery_date)} />
            <InfoRow label="Delivery Method" value={pregnancy.delivery_method} />
            <InfoRow label="Mother Condition" value={pregnancy.mother_condition} />
          </div>
        )}
      </div>

     
    </div>
  );
};

export default CurrentPregnancyView;
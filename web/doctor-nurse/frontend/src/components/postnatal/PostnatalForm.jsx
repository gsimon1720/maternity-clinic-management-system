// src/components/postnatal/PostnatalForm.jsx
import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { postnatalApi } from '../../api/postnatalApi';
import { useAuth } from '../../context/AuthContext';

const PostnatalForm = ({ 
  mode = 'create',
  initialData = null,
  patientId = null,
  pregnancyId = null,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  
  // ✅ Role Permissions
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN';
  const isNurse = user?.role === 'NURSE';
  
  // ✅ Nurse can Edit (but not Create or Delete)
  const canEdit = isDoctor || isNurse;
  const canDelete = isDoctor;  // Nurse cannot delete
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    visit_date: '',
    examined_by: '',
    breast_problems: '',
    abnormal_vaginal_discharge: '',
    excessive_vaginal_bleeding: '',
    pallor: '',
    icterus: '',
    oedema: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    cardiovascular_system: '',
    respiratory_system: '',
    abdominal_examination: '',
    vaginal_examination: '',
    mental_status_epds: '',
    other_mental_status: '',
    problems_identified: '',
    family_planning_method: '',
    reason_for_choice: '',
    clinic_place: '',
    clinic_date: '',
    clinic_time: '',
    special_notes: '',
    officer_signature: '',
    designation: '',
  });

  useEffect(() => {
    if (initialData && mode !== 'create') {
      setFormData({
        visit_date: initialData.visit_date || '',
        examined_by: initialData.examined_by || '',
        breast_problems: initialData.breast_problems || '',
        abnormal_vaginal_discharge: initialData.abnormal_vaginal_discharge || '',
        excessive_vaginal_bleeding: initialData.excessive_vaginal_bleeding || '',
        pallor: initialData.pallor || '',
        icterus: initialData.icterus || '',
        oedema: initialData.oedema || '',
        blood_pressure_systolic: initialData.blood_pressure_systolic || '',
        blood_pressure_diastolic: initialData.blood_pressure_diastolic || '',
        cardiovascular_system: initialData.cardiovascular_system || '',
        respiratory_system: initialData.respiratory_system || '',
        abdominal_examination: initialData.abdominal_examination || '',
        vaginal_examination: initialData.vaginal_examination || '',
        mental_status_epds: initialData.mental_status_epds || '',
        other_mental_status: initialData.other_mental_status || '',
        problems_identified: initialData.problems_identified || '',
        family_planning_method: initialData.family_planning_method || '',
        reason_for_choice: initialData.reason_for_choice || '',
        clinic_place: initialData.clinic_place || '',
        clinic_date: initialData.clinic_date || '',
        clinic_time: initialData.clinic_time || '',
        special_notes: initialData.special_notes || '',
        officer_signature: initialData.officer_signature || '',
        designation: initialData.designation || '',
      });
    }
  }, [initialData, mode]);

  useEffect(() => {
    if (mode === 'create') {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        visit_date: today,
        examined_by: user?.fullName || '',
        designation: user?.role || '',
      }));
    }
  }, [mode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.visit_date) {
        toast.error('Visit date is required');
        setLoading(false);
        return;
      }

      if (mode === 'create' && !patientId) {
        toast.error('Please select a patient first');
        setLoading(false);
        return;
      }

      // ✅ Send pregnancy_id as null if not available
      const submitData = {
        ...formData,
        blood_pressure_systolic: formData.blood_pressure_systolic || null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic || null,
      };

      let response;
      if (mode === 'create') {
        const createData = {
          ...submitData,
          patient_id: parseInt(patientId),
          pregnancy_id: pregnancyId ? parseInt(pregnancyId) : null,
          clinic_id: user?.clinicId ? parseInt(user.clinicId) : null,
        };
        
        console.log('📤 Sending data:', JSON.stringify(createData, null, 2));
        response = await postnatalApi.create(createData);
      } else {
        response = await postnatalApi.update(initialData.id, submitData);
      }

      if (response.success) {
        toast.success(mode === 'create' ? 'Postnatal record created successfully' : 'Postnatal record updated successfully');
        onSuccess?.();
      } else {
        toast.error(response.message || 'Failed to save record');
      }
    } catch (error) {
      console.error('Error saving postnatal record:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errors.forEach(err => toast.error(err.message));
      } else {
        toast.error(error.response?.data?.message || 'Failed to save postnatal record');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this postnatal record?')) return;
    
    setLoading(true);
    try {
      const response = await postnatalApi.delete(initialData.id);
      if (response.success) {
        toast.success('Postnatal record deleted successfully');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error deleting postnatal record:', error);
      toast.error('Failed to delete postnatal record');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';

  if (mode === 'create' && !patientId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ No Patient Selected</h3>
        <p className="text-yellow-700">Please select a patient first before creating a postnatal record.</p>
        <button onClick={onCancel} className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'create' && patientId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            ✅ Creating record for patient ID: <span className="font-bold">#{patientId}</span>
            {pregnancyId && <span className="ml-2">| Pregnancy ID: #{pregnancyId}</span>}
          </p>
        </div>
      )}

      {/* ============ BASIC INFORMATION ============ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
            <input
              type="date"
              name="visit_date"
              value={formData.visit_date}
              onChange={handleChange}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examined By</label>
            <input
              type="text"
              name="examined_by"
              value={formData.examined_by}
              onChange={handleChange}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* ============ MOTHER CLINICAL EXAMINATION ============ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🩺 Mother Clinical Examination</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Breast Problems</label>
            <select name="breast_problems" value={formData.breast_problems} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Select</option>
              <option value="Normal">Normal</option>
              <option value="Engorgement">Engorgement</option>
              <option value="Mastitis">Mastitis</option>
              <option value="Cracked Nipples">Cracked Nipples</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Abnormal Vaginal Discharge</label>
            <select name="abnormal_vaginal_discharge" value={formData.abnormal_vaginal_discharge} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Select</option>
              <option value="Normal">Normal</option>
              <option value="Abnormal">Abnormal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excessive Vaginal Bleeding</label>
            <select name="excessive_vaginal_bleeding" value={formData.excessive_vaginal_bleeding} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Select</option>
              <option value="Normal">Normal</option>
              <option value="Heavy">Heavy</option>
              <option value="Excessive">Excessive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pallor</label>
            <select name="pallor" value={formData.pallor} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Select</option>
              <option value="Normal">Normal</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icterus</label>
            <select name="icterus" value={formData.icterus} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Select</option>
              <option value="No">No</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Oedema</label>
            <select name="oedema" value={formData.oedema} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Select</option>
              <option value="No">No</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure Systolic</label>
            <input type="number" name="blood_pressure_systolic" value={formData.blood_pressure_systolic} onChange={handleChange} disabled={isViewMode} placeholder="e.g. 120" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure Diastolic</label>
            <input type="number" name="blood_pressure_diastolic" value={formData.blood_pressure_diastolic} onChange={handleChange} disabled={isViewMode} placeholder="e.g. 80" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cardiovascular System</label>
            <textarea name="cardiovascular_system" value={formData.cardiovascular_system} onChange={handleChange} disabled={isViewMode} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Respiratory System</label>
            <textarea name="respiratory_system" value={formData.respiratory_system} onChange={handleChange} disabled={isViewMode} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Abdominal Examination</label>
            <textarea name="abdominal_examination" value={formData.abdominal_examination} onChange={handleChange} disabled={isViewMode} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vaginal Examination</label>
            <textarea name="vaginal_examination" value={formData.vaginal_examination} onChange={handleChange} disabled={isViewMode} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
        </div>
      </div>

      {/* ============ MENTAL HEALTH ============ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 Mental Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mental Status (EPDS)</label>
            <select name="mental_status_epds" value={formData.mental_status_epds} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Select</option>
              <option value="Normal">Normal</option>
              <option value="Mild Depression">Mild Depression</option>
              <option value="Moderate Depression">Moderate Depression</option>
              <option value="Severe Depression">Severe Depression</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Mental Status</label>
            <textarea name="other_mental_status" value={formData.other_mental_status} onChange={handleChange} disabled={isViewMode} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
        </div>
      </div>

      {/* ============ PROBLEMS IDENTIFIED ============ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Problems Identified</h3>
        <div>
          <textarea name="problems_identified" value={formData.problems_identified} onChange={handleChange} disabled={isViewMode} rows="3" placeholder="Describe any problems identified during the postnatal visit..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
        </div>
      </div>

      {/* ============ FAMILY PLANNING ============ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👨‍👩‍👦 Family Planning</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family Planning Method</label>
            <select name="family_planning_method" value={formData.family_planning_method} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Select</option>
              <option value="Condom">Condom</option>
              <option value="Oral Pills">Oral Pills</option>
              <option value="IUD">IUD</option>
              <option value="Injectable">Injectable</option>
              <option value="Implants">Implants</option>
              <option value="Sterilization">Sterilization</option>
              <option value="Lactational Amenorrhea">Lactational Amenorrhea</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Choice</label>
            <textarea name="reason_for_choice" value={formData.reason_for_choice} onChange={handleChange} disabled={isViewMode} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
        </div>
      </div>

      {/* ============ FAMILY PLANNING CLINIC ============ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏥 Family Planning Clinic</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Place</label>
            <input type="text" name="clinic_place" value={formData.clinic_place} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Date</label>
            <input type="date" name="clinic_date" value={formData.clinic_date} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Time</label>
            <input type="time" name="clinic_time" value={formData.clinic_time} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
          <textarea name="special_notes" value={formData.special_notes} onChange={handleChange} disabled={isViewMode} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
        </div>
      </div>

      {/* ============ OFFICER DETAILS ============ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">✍️ Officer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Officer Signature</label>
            <input type="text" name="officer_signature" value={formData.officer_signature} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>
        </div>
      </div>

      {/* ============ ACTION BUTTONS ============ */}
      <div className="flex flex-wrap gap-3">
        {/* ✅ Show update button for both Doctor and Nurse (if not view mode) */}
        {!isViewMode && canEdit && (
          <button 
            type="submit" 
            disabled={loading} 
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {loading ? 'Saving...' : (mode === 'create' ? 'Create Record' : 'Update Record')}
          </button>
        )}

        {/* ✅ Show delete button only for Doctor */}
        {canDelete && mode !== 'create' && (
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={loading} 
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <FaTrash /> Delete Record
          </button>
        )}

        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2"
        >
          <FaTimes /> {isViewMode ? 'Close' : 'Cancel'}
        </button>
      </div>

      {/* ============ PERMISSION NOTES ============ */}
      <div className="text-sm text-gray-500 border-t border-gray-200 pt-4 space-y-1">
        {mode === 'create' && !isDoctor && (
          <p className="text-red-600">⚠️ Only Doctors can create postnatal records.</p>
        )}
        {mode === 'create' && isDoctor && (
          <p className="text-green-600">✅ You have permission to create postnatal records.</p>
        )}
        {mode === 'edit' && isNurse && (
          <p className="text-teal-600">✅ Nurse: You can edit this record. (Delete not available)</p>
        )}
        {mode === 'edit' && isDoctor && (
          <p className="text-green-600">✅ Doctor: You can edit and delete this record.</p>
        )}
        {mode === 'view' && (
          <p className="text-gray-600">📌 This record is view-only.</p>
        )}
        {canDelete && mode !== 'create' && (
          <p className="text-gray-600">🗑️ Delete will soft-delete the record (can be restored).</p>
        )}
      </div>
    </form>
  );
};

export default PostnatalForm;
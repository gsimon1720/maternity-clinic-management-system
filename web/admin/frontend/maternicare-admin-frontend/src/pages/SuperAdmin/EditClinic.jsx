import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClinicById, updateClinic } from '../../services/clinicService';

const EditClinic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingClinic, setLoadingClinic] = useState(true);
  const [formData, setFormData] = useState({
    clinic_name: '',
    clinic_code: '',
    district: '',
    province: '',
    status: 'active',
  });

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
  ].sort();

  const provinces = [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern',
    'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
  ].sort();

  useEffect(() => {
    getClinicById(id)
      .then((clinic) => {
        setFormData({
          clinic_name: clinic.clinic_name || '',
          clinic_code: clinic.clinic_code || '',
          district: clinic.district || '',
          province: clinic.province || '',
          status: clinic.status || 'active',
        });
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to load clinic');
        navigate('/super-admin/clinics');
      })
      .finally(() => setLoadingClinic(false));
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clinic_name.trim()) {
      toast.error('Clinic Name is required');
      return;
    }
    if (!formData.clinic_code.trim()) {
      toast.error('Clinic Code is required');
      return;
    }
    if (!formData.district) {
      toast.error('District is required');
      return;
    }
    if (!formData.province) {
      toast.error('Province is required');
      return;
    }

    setIsLoading(true);

    try {
      await updateClinic(id, formData);
      toast.success('Clinic updated successfully');
      navigate('/super-admin/clinics');
    } catch (error) {
      toast.error(error.message || 'Failed to update clinic');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingClinic) {
    return <div style={{ padding: '24px' }}>Loading clinic...</div>;
  }

  return (
    <div style={{ padding: '0px', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/super-admin/clinics')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#831843', fontWeight: '500', transition: 'color 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#db2777'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#831843'}
      >
        <ArrowLeft size={18} /> Back to Clinics
      </button>

      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #fbcfe8', boxShadow: '0 20px 25px -5px rgba(131,24,67,0.05)' }}>
        <div style={{ background: 'linear-gradient(135deg, #db2777, #831843)', padding: '32px', color: 'white', textAlign: 'center' }}>
          <Building2 size={40} style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Edit Clinic</h1>
          <p style={{ opacity: 0.9 }}>Update the details of the clinic</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#831843' }}>
            <Building2 size={18} color="#db2777" /> Clinic details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Clinic Name *</label>
              <input type="text" name="clinic_name" value={formData.clinic_name} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '2px solid #fbcfe8', borderRadius: '10px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Clinic Code *</label>
              <input type="text" name="clinic_code" value={formData.clinic_code} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '2px solid #fbcfe8', borderRadius: '10px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>District *</label>
              <select name="district" value={formData.district} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '2px solid #fbcfe8', borderRadius: '10px', outline: 'none', background: 'white' }}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Province *</label>
              <select name="province" value={formData.province} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '2px solid #fbcfe8', borderRadius: '10px', outline: 'none', background: 'white' }}>
                <option value="">Select Province</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '2px solid #fbcfe8', borderRadius: '10px', outline: 'none', background: 'white' }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="submit" disabled={isLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px', background: 'linear-gradient(135deg, #db2777, #831843)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(219, 39, 119, 0.2)' }}>
              <Save size={16} /> {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/super-admin/clinics')} style={{ padding: '14px 24px', background: '#fce7f3', border: '1px solid #fbcfe8', borderRadius: '12px', cursor: 'pointer', color: '#db2777', fontWeight: '600' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClinic;

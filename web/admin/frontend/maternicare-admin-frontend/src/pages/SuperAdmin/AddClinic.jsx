import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, MapPin, Phone, Mail, UserPlus, User, Key, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClinic } from '../../services/clinicService';

const AddClinic = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clinic_name: '',
    clinic_code: '',
    district: '',
    province: '',
    admin_username: '',
    admin_full_name: '',
    admin_email: '',
    admin_password: '',
  });

  const [errors, setErrors] = useState({});

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.clinic_name.trim()) newErrors.clinic_name = 'Clinic name is required';
    if (!formData.clinic_code.trim()) newErrors.clinic_code = 'Clinic code is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.province) newErrors.province = 'Province is required';
    
    if (!formData.admin_username.trim()) newErrors.admin_username = 'Admin username is required';
    if (!formData.admin_full_name.trim()) newErrors.admin_full_name = 'Admin full name is required';
    
    if (!formData.admin_email.trim()) {
      newErrors.admin_email = 'Admin email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.admin_email)) {
      newErrors.admin_email = 'Email is invalid';
    }
    
    if (!formData.admin_password) {
      newErrors.admin_password = 'Password is required';
    } else if (formData.admin_password.length < 6) {
      newErrors.admin_password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors');
      return;
    }
    
    setIsLoading(true);

    try {
      await createClinic({
        clinic_name: formData.clinic_name,
        clinic_code: formData.clinic_code,
        district: formData.district,
        province: formData.province,
        admin_username: formData.admin_username,
        admin_full_name: formData.admin_full_name,
        admin_email: formData.admin_email,
        admin_password: formData.admin_password
      });
      toast.success('Clinic and admin account created successfully!');
      navigate('/super-admin/clinics');
    } catch (error) {
      toast.error(error.message || 'Failed to create clinic');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Register New Clinic</h1>
          <p style={{ opacity: 0.9 }}>Add a new clinic to the MaterniCare network</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#831843' }}>
            <Building2 size={18} color="#db2777" /> Clinic Information
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Clinic Name *</label>
              <input type="text" name="clinic_name" value={formData.clinic_name} onChange={handleChange} style={{ width: '100%', padding: '10px', border: `2px solid ${errors.clinic_name ? '#ef4444' : '#fbcfe8'}`, borderRadius: '10px', outline: 'none' }} />
              {errors.clinic_name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.clinic_name}</p>}
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Clinic Code *</label>
              <input type="text" name="clinic_code" value={formData.clinic_code} onChange={handleChange} placeholder="e.g. COL-01" style={{ width: '100%', padding: '10px', border: `2px solid ${errors.clinic_code ? '#ef4444' : '#fbcfe8'}`, borderRadius: '10px', outline: 'none' }} />
              {errors.clinic_code && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.clinic_code}</p>}
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>District *</label>
              <select name="district" value={formData.district} onChange={handleChange} style={{ width: '100%', padding: '10px', border: `2px solid ${errors.district ? '#ef4444' : '#fbcfe8'}`, borderRadius: '10px', outline: 'none', background: 'white' }}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.district && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.district}</p>}
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Province *</label>
              <select name="province" value={formData.province} onChange={handleChange} style={{ width: '100%', padding: '10px', border: `2px solid ${errors.province ? '#ef4444' : '#fbcfe8'}`, borderRadius: '10px', outline: 'none', background: 'white' }}>
                <option value="">Select Province</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.province && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.province}</p>}
            </div>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#831843' }}>
            <UserPlus size={18} color="#db2777" /> Clinic Admin Account
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Admin Full Name *</label>
              <input type="text" name="admin_full_name" value={formData.admin_full_name} onChange={handleChange} style={{ width: '100%', padding: '10px', border: `2px solid ${errors.admin_full_name ? '#ef4444' : '#fbcfe8'}`, borderRadius: '10px', outline: 'none' }} />
              {errors.admin_full_name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.admin_full_name}</p>}
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Admin Username *</label>
              <input type="text" name="admin_username" value={formData.admin_username} onChange={handleChange} style={{ width: '100%', padding: '10px', border: `2px solid ${errors.admin_username ? '#ef4444' : '#fbcfe8'}`, borderRadius: '10px', outline: 'none' }} />
              {errors.admin_username && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.admin_username}</p>}
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Admin Email *</label>
              <input type="email" name="admin_email" value={formData.admin_email} onChange={handleChange} style={{ width: '100%', padding: '10px', border: `2px solid ${errors.admin_email ? '#ef4444' : '#fbcfe8'}`, borderRadius: '10px', outline: 'none' }} />
              {errors.admin_email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.admin_email}</p>}
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#9d174d' }}>Admin Password *</label>
              <input type="password" name="admin_password" value={formData.admin_password} onChange={handleChange} style={{ width: '100%', padding: '10px', border: `2px solid ${errors.admin_password ? '#ef4444' : '#fbcfe8'}`, borderRadius: '10px', outline: 'none' }} />
              {errors.admin_password && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.admin_password}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="submit" disabled={isLoading} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #db2777, #831843)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(219, 39, 119, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShieldCheck size={18} />
              {isLoading ? 'Creating...' : 'Create Clinic & Admin'}
            </button>
            <button type="button" onClick={() => navigate('/super-admin/clinics')} style={{ padding: '14px 24px', background: '#fce7f3', border: '1px solid #fbcfe8', borderRadius: '12px', cursor: 'pointer', color: '#db2777', fontWeight: '600' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClinic;
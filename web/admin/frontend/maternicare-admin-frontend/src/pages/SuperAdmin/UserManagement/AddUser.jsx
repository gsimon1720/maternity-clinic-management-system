import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, User, Stethoscope, Baby, Users, Heart, Shield, Building2, Map
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClinicUser } from '../../../services/userService';
import { getClinics } from '../../../services/clinicService';

const getClinicId = (clinic) => clinic?.clinic_id ?? clinic?.id;

const PLUM = '#831843';
const PINK = '#db2777';

const ROLES = [
  { id: 'clinic_admin', label: 'Clinic Admin', icon: Shield, color: '#F59E0B' },
  { id: 'sphm', label: 'SPHM', icon: Heart, color: '#8B5CF6' },
  { id: 'ad_officer', label: 'ADO', icon: Map, color: '#8B5CF6' },
];

// SPHM and ADO are global roles (no fixed clinic) — only clinic_admin requires one.
const CLINIC_REQUIRED_ROLES = ['clinic_admin'];

const AddUser = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('clinic_admin');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nic: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    clinicId: '',
    status: 'active',
    licenseNumber: '',
    qualifications: '',
    professionalStartDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getClinics({ status: 'active' })
      .then((data) => setClinics(data || []))
      .catch(() => setClinics([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (CLINIC_REQUIRED_ROLES.includes(selectedRole) && !formData.clinicId) {
      nextErrors.clinicId = 'Clinic is required for this role';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsLoading(true);
    try {
      await createClinicUser({
        fullName: formData.fullName,
        email: formData.email,
        nic: formData.nic,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: selectedRole,
        clinicKey: formData.clinicId || undefined,
        status: formData.status,
        profileData: {
          licenseNumber: formData.licenseNumber,
          qualifications: formData.qualifications,
          professionalStartDate: formData.professionalStartDate,
        },
      });
      toast.success('User created successfully');
      navigate('/super-admin/users');
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '10px 12px',
    border: `2px solid ${errors[field] ? '#ef4444' : '#fbcfe8'}`,
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
  });

  return (
    <div style={{ padding: '0px', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/super-admin/users')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#831843', fontWeight: '500', transition: 'color 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#db2777'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#831843'}
      >
        <ArrowLeft size={18} /> Back to Users
      </button>

      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #fbcfe8', boxShadow: '0 20px 25px -5px rgba(131,24,67,0.05)' }}>
        <div style={{ background: 'linear-gradient(135deg, #db2777, #831843)', padding: '32px', color: 'white', textAlign: 'center' }}>
          <User size={32} style={{ marginBottom: '12px', display: 'inline-block' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Add New User</h1>
          <p style={{ opacity: 0.85 }}>Create a user account for any clinic in the network</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: PLUM }}>Select Role</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px' }}>
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                style={{
                  padding: '16px',
                  border: `2px solid ${selectedRole === role.id ? role.color : '#fbcfe8'}`,
                  borderRadius: '14px',
                  background: selectedRole === role.id ? `${role.color}10` : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  outline: 'none',
                }}
              >
                <role.icon size={20} color={role.color} />
                <div style={{ marginTop: '8px', fontWeight: '600', color: PLUM }}>{role.label}</div>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#9d174d' }}>Full Name *</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} style={inputStyle('fullName')} />
              {errors.fullName && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.fullName}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#9d174d' }}>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle('email')} />
              {errors.email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.email}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#9d174d' }}>NIC (optional)</label>
              <input name="nic" value={formData.nic} onChange={handleChange} style={inputStyle('nic')} placeholder="Enter NIC number" />
              {errors.nic && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.nic}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#9d174d' }}>Phone</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} style={inputStyle('phoneNumber')} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#9d174d' }}>Password *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle('password')} />
              {errors.password && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.password}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#9d174d' }}>Confirm Password *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={inputStyle('confirmPassword')} />
              {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.confirmPassword}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#9d174d' }}>
                Clinic {CLINIC_REQUIRED_ROLES.includes(selectedRole) ? '*' : '(optional)'}
              </label>
              <select name="clinicId" value={formData.clinicId} onChange={handleChange} style={{ ...inputStyle('clinicId'), background: 'white' }}>
                <option value="">Select clinic</option>
                {clinics.map((clinic) => (
                  <option key={getClinicId(clinic)} value={getClinicId(clinic)}>{clinic.clinic_name} — {clinic.city}</option>
                ))}
              </select>
              {errors.clinicId && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.clinicId}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#9d174d' }}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ ...inputStyle('status'), background: 'white' }}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {['doctor', 'nurse', 'midwife'].includes(selectedRole) && (
            <>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: PLUM }}>Professional Details (optional)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <input name="licenseNumber" placeholder="License Number" value={formData.licenseNumber} onChange={handleChange} style={inputStyle('licenseNumber')} />
                <input name="qualifications" placeholder="Qualifications" value={formData.qualifications} onChange={handleChange} style={inputStyle('qualifications')} />
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#9d174d', marginBottom: '4px' }}>Professional Start Date</label>
                  <input type="date" name="professionalStartDate" max={new Date().toISOString().split('T')[0]} value={formData.professionalStartDate} onChange={handleChange} style={inputStyle('professionalStartDate')} />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="submit" disabled={isLoading} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', background: 'linear-gradient(135deg, #db2777, #831843)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(219, 39, 119, 0.2)' }}>
              <Save size={16} /> {isLoading ? 'Creating...' : 'Create User'}
            </button>
            <button type="button" onClick={() => navigate('/super-admin/users')} style={{ padding: '14px 24px', background: '#fce7f3', border: '1px solid #fbcfe8', borderRadius: '12px', cursor: 'pointer', color: '#db2777', fontWeight: '600' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;

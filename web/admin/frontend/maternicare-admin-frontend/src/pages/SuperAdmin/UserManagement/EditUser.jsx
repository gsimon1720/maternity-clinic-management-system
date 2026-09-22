import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Building2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClinicUserById, updateClinicUser } from '../../../services/userService';
import { getClinics } from '../../../services/clinicService';

const getClinicId = (clinic) => clinic?.clinic_id ?? clinic?.id;

const PLUM = '#831843';
const PINK = '#db2777';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nic: '',
    phoneNumber: '',
    clinicId: '',
    status: 'active',
    password: '',
  });

  useEffect(() => {
    Promise.all([getClinics(), getClinicUserById(id)])
      .then(([clinicList, userData]) => {
        setClinics(clinicList || []);
        setUserName(userData.fullName || '');
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          nic: userData.nic || '',
          phoneNumber: userData.phoneNumber || userData.phone || '',
          clinicId: userData.clinicId || '',
          status: userData.status || 'active',
          password: '',
        });
      })
      .catch((error) => {
        toast.error(error.message || 'Unable to load admin details');
        navigate('/super-admin/users');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) { toast.error('Full name is required'); return; }
    if (!formData.email.trim()) { toast.error('Email is required'); return; }
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        nic: formData.nic,
        phoneNumber: formData.phoneNumber,
        role: 'clinic_admin',
        clinicKey: formData.clinicId || undefined,
        status: formData.status,
      };
      if (formData.password) payload.password = formData.password;

      await updateClinicUser(id, payload);
      toast.success('Clinic Admin updated successfully');
      navigate('/super-admin/users');
    } catch (error) {
      toast.error(error.message || 'Failed to update admin');
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #fbcfe8',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
    color: PLUM,
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#9d174d',
  };

  const sectionHeadingStyle = {
    fontSize: '15px',
    fontWeight: '700',
    color: PLUM,
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #fce7f3',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  if (isLoading) {
    return <div style={{ padding: '24px', color: '#831843', fontWeight: '500' }}>Loading admin details...</div>;
  }

  return (
    <div style={{ padding: '0px', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/super-admin/users')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'none', border: 'none', cursor: 'pointer', color: PLUM, fontWeight: '500', transition: 'color 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.color = PINK}
        onMouseLeave={(e) => e.currentTarget.style.color = PLUM}
      >
        <ArrowLeft size={18} /> Back to Users
      </button>

      <div style={{ maxWidth: '820px', margin: '0 auto', background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #fbcfe8', boxShadow: '0 20px 25px -5px rgba(131,24,67,0.05)' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${PLUM}, ${PINK})`, padding: '32px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold' }}>
              {userName?.charAt(0) || 'A'}
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>Edit Clinic Admin</h1>
              <p style={{ opacity: 0.85, fontSize: '14px' }}>{userName}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          {/* Personal Information */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={sectionHeadingStyle}>
              <User size={16} color={PINK} /> Personal Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} style={inputStyle} placeholder="Enter full name" />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="Enter email address" />
              </div>
              <div>
                <label style={labelStyle}>NIC (optional)</label>
                <input name="nic" value={formData.nic} onChange={handleChange} style={inputStyle} placeholder="National Identity Card number" />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} style={inputStyle} placeholder="Enter phone number" />
              </div>
            </div>
          </div>

          {/* Clinic Assignment & Status */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={sectionHeadingStyle}>
              <Building2 size={16} color={PINK} /> Clinic Assignment & Status
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Assigned Clinic</label>
                <select name="clinicId" value={formData.clinicId} onChange={handleChange} style={inputStyle}>
                  <option value="">— No clinic assigned —</option>
                  {clinics.map((clinic) => (
                    <option key={getClinicId(clinic)} value={getClinicId(clinic)}>
                      {clinic.clinic_name} ({clinic.district || clinic.city || ''})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Account Status</label>
                <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reset Password (optional) */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={sectionHeadingStyle}>
              <Shield size={16} color={PINK} /> Reset Password
              <span style={{ fontSize: '12px', color: '#9d174d', fontWeight: '400', marginLeft: '4px' }}>
                (leave blank to keep current password)
              </span>
            </h2>
            <div style={{ maxWidth: '400px' }}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Enter new password (min. 6 characters)"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #fce7f3', paddingTop: '24px' }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: isSaving ? '#fbcfe8' : `linear-gradient(135deg, ${PINK}, ${PLUM})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: isSaving ? 'none' : '0 4px 12px rgba(219,39,119,0.25)',
                transition: 'all 0.2s',
              }}
            >
              <Save size={16} /> {isSaving ? 'Saving changes...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/super-admin/users')}
              style={{ padding: '14px 28px', background: '#fce7f3', border: '1px solid #fbcfe8', borderRadius: '12px', cursor: 'pointer', color: PLUM, fontWeight: '600', fontSize: '14px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;

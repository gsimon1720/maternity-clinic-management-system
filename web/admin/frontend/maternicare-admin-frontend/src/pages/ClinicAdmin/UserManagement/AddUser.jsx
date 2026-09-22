import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Briefcase,
  Eye,
  EyeOff,
  Stethoscope,
  Users,
  Upload,
  CheckCircle,
  X,
  Award,
  Calendar,
  Plus,
  Trash2,
  ShieldX
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { createClinicUser } from '../../../services/userService';
import { calculateYearsOfExperience, getTodayString } from '../../../utils/dateUtils';
import toast from 'react-hot-toast';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const AddUser = () => {
  const navigate = useNavigate();
  const { currentClinic, hasPermission } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [currentStep, setCurrentStep] = useState(1);

  // Common Step 1 fields: Username, Email, Password, Confirm Password (NIC & Phone removed)
  const [commonData, setCommonData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Role Specific Step 2 Fields - All REQUIRED
  const [doctorData, setDoctorData] = useState({
    licenseNumber: '',
    qualifications: '',
    professionalStartDate: '',
  });

  const [nurseData, setNurseData] = useState({
    licenseNumber: '',
    qualifications: '',
    professionalStartDate: '',
  });

  // Qualifications List (supports multiple qualifications per staff member)
  const [qualificationsList, setQualificationsList] = useState([
    { id: Date.now(), qualificationTitle: '', qualificationDoc: null, docFileName: '' }
  ]);

  const addQualificationItem = () => {
    setQualificationsList((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), qualificationTitle: '', qualificationDoc: null, docFileName: '' }
    ]);
  };

  const removeQualificationItem = (index) => {
    if (qualificationsList.length === 1) {
      toast.error('At least one qualification entry is required');
      return;
    }
    setQualificationsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQualTitleChange = (index, value) => {
    setQualificationsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qualificationTitle: value };
      return updated;
    });
  };

  const handleQualFileUpload = (index, file) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be less than 20MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setQualificationsList((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], qualificationDoc: reader.result, docFileName: file.name };
        return updated;
      });
      toast.success(`Uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const removeQualFile = (index) => {
    setQualificationsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qualificationDoc: null, docFileName: '' };
      return updated;
    });
  };

  const [errors, setErrors] = useState({});

  const roles = [
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#10B981' },
    { id: 'nurse', label: 'Nurse', icon: Users, color: '#3B82F6' },
  ];

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setCommonData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be less than 20MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setQualificationDoc(reader.result);
      setDocFileName(file.name);
      setErrors((prev) => ({ ...prev, qualificationDoc: '' }));
      toast.success(`Uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setQualificationDoc(null);
    setDocFileName('');
  };

  const validateCommonFields = () => {
    const newErrors = {};
    if (!commonData.username.trim()) newErrors.username = 'Username is required';
    if (!commonData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(commonData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!commonData.password) {
      newErrors.password = 'Password is required';
    } else if (commonData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (commonData.password !== commonData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2Fields = () => {
    const newErrors = {};

    const hasValidQual = qualificationsList.some((q) => q.qualificationTitle.trim());
    if (!hasValidQual) {
      newErrors.qualificationsList = 'Please provide details for at least one qualification';
    }

    if (selectedRole === 'doctor') {
      if (!doctorData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
      if (!doctorData.professionalStartDate) newErrors.professionalStartDate = 'Professional Start Date is required';
    } else if (selectedRole === 'nurse') {
      if (!nurseData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
      if (!nurseData.professionalStartDate) newErrors.professionalStartDate = 'Professional Start Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCommonFields()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else {
      toast.error('Please fill all required fields correctly');
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCommonFields()) {
      setCurrentStep(1);
      toast.error('Please complete all required fields in Basic Info');
      return;
    }

    if (!validateStep2Fields()) {
      toast.error('Please complete all required additional details and upload qualification document');
      return;
    }

    if (!currentClinic?.id) {
      toast.error('No clinic is linked to your account. Please sign in again.');
      return;
    }

    setIsLoading(true);

    const activeRoleData = selectedRole === 'doctor' ? doctorData : nurseData;

    const userData = {
      username: commonData.username,
      fullName: commonData.username,
      email: commonData.email,
      password: commonData.password,
      role: selectedRole,
      clinicKey: currentClinic.id,
      status: 'active',
      licenseNumber: activeRoleData.licenseNumber,
      professionalStartDate: activeRoleData.professionalStartDate,
      qualificationsList: qualificationsList.map((q) => ({
        qualificationTitle: q.qualificationTitle,
        qualificationDoc: q.qualificationDoc,
        fileName: q.docFileName,
      })),
    };

    try {
      await createClinicUser(userData);
      toast.success(`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} registered successfully!`);
      navigate('/users');
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${errors[fieldName] ? '#EF4444' : COLORS.bgPink200}`,
    borderRadius: '12px',
    fontSize: '14px',
    transition: 'all 0.3s',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    color: COLORS.textPink900,
    boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: COLORS.textPink800,
  };

  // ── No ADD_STAFF permission ──────────────────────────────────────────────
  if (!hasPermission('ADD_STAFF')) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: 'white', padding: '48px 64px', borderRadius: '24px', border: '1px solid #fbcfe8', boxShadow: '0 4px 24px rgba(131,24,67,0.06)' }}>
          <ShieldX size={48} color="#db2777" />
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#831843', margin: 0 }}>Access Restricted</h2>
          <p style={{ color: '#9d174d', fontSize: '14px', margin: 0 }}>You do not have permission to add staff members.<br />Contact your Super Admin to enable this access.</p>
          <button onClick={() => navigate('/users')} style={{ padding: '10px 24px', background: '#db2777', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Back to Staff List</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: `linear-gradient(135deg, ${COLORS.bgPink50} 0%, ${COLORS.bgPink100} 100%)`,
      minHeight: '100vh',
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/users')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'white',
          border: `1px solid ${COLORS.bgPink200}`,
          borderRadius: '10px',
          cursor: 'pointer',
          color: COLORS.textPink800,
          fontWeight: '500',
          fontSize: '14px',
          transition: 'all 0.3s',
          marginBottom: '24px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bgPink100; e.currentTarget.style.transform = 'translateX(-4px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateX(0)'; }}
      >
        <ArrowLeft size={18} />
        Back to Users
      </button>

      {/* Main Card */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(131,24,67,0.08)',
        overflow: 'hidden',
        border: `1px solid ${COLORS.bgPink200}`,
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`,
          padding: '32px',
          color: 'white',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Add New Staff Member
          </h1>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>
            Register a new staff member for {currentClinic?.clinic_name || 'your clinic'}
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 32px',
          background: COLORS.bgPink50,
          borderBottom: `1px solid ${COLORS.bgPink200}`,
        }}>
          {['Basic Info', 'Additional Details & Qualifications'].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: currentStep === i + 1 ? COLORS.textPink600 : (currentStep > i + 1 ? '#10B981' : COLORS.bgPink200),
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700',
              }}>
                {currentStep > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: currentStep === i + 1 ? COLORS.textPink900 : COLORS.textPink800 }}>
                {step}
              </span>
              {i < 1 && <div style={{ width: '40px', height: '2px', background: currentStep > 1 ? '#10B981' : COLORS.bgPink200 }} />}
            </div>
          ))}
        </div>

        {/* Role Selection Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '20px 32px 0',
          borderBottom: `1px solid ${COLORS.bgPink200}`,
          overflowX: 'auto',
          background: COLORS.bgPink50,
        }}>
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px',
                background: selectedRole === role.id ? `linear-gradient(135deg, ${role.color}, ${role.color}dd)` : 'transparent',
                color: selectedRole === role.id ? 'white' : COLORS.textPink800,
                border: 'none', borderRadius: '12px', cursor: 'pointer',
                fontWeight: '600', fontSize: '14px', transition: 'all 0.3s',
              }}
            >
              <role.icon size={16} />
              {role.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '32px' }}>

            {/* STEP 1: Basic Information - Kept ONLY Username, Email, Password, Confirm Password */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color={COLORS.textPink600} />
                  Basic Information <span style={{ fontSize: '12px', color: '#EF4444' }}>(Required *)</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {/* Username */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}><User size={14} style={{ display: 'inline', marginRight: '4px' }} />Username <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" name="username" value={commonData.username} onChange={handleCommonChange} style={inputStyle('username')} placeholder="Enter username" />
                    {errors.username && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.username}</p>}
                  </div>

                  {/* Email */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />Email Address <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="email" name="email" value={commonData.email} onChange={handleCommonChange} style={inputStyle('email')} placeholder="Enter email address" />
                    {errors.email && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.email}</p>}
                  </div>
                </div>

                {/* Password Section */}
                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '24px', marginTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} color={COLORS.textPink600} />
                    Security Credentials <span style={{ fontSize: '12px', color: '#EF4444' }}>*</span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Password <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <input type={showPassword ? 'text' : 'password'} name="password" value={commonData.password} onChange={handleCommonChange} style={inputStyle('password')} placeholder="Min 6 characters" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textPink800 }}>
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.password}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Confirm Password <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={commonData.confirmPassword} onChange={handleCommonChange} style={inputStyle('confirmPassword')} placeholder="Re-enter password" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textPink800 }}>
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{ padding: '12px 32px', background: COLORS.textPink600, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Additional Details - ALL FIELDS REQUIRED */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} color={COLORS.textPink600} />
                  Additional Details & Qualifications
                  <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: '600', marginLeft: '8px' }}>(All fields required *)</span>
                </h2>
                <p style={{ fontSize: '13px', color: COLORS.textPink800, marginBottom: '24px', opacity: 0.8 }}>
                  Please complete all mandatory professional details and upload qualification documents.
                </p>

                {/* Doctor Fields */}
                {selectedRole === 'doctor' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>License Number <span style={{ color: '#EF4444' }}>*</span></label>
                      <input type="text" value={doctorData.licenseNumber} onChange={(e) => { setDoctorData({ ...doctorData, licenseNumber: e.target.value }); if (errors.licenseNumber) setErrors({ ...errors, licenseNumber: '' }); }} style={inputStyle('licenseNumber')} placeholder="e.g., SLMC-12345" />
                      {errors.licenseNumber && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.licenseNumber}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />Professional Start Date <span style={{ color: '#EF4444' }}>*</span></label>
                      <input
                        type="date"
                        max={getTodayString()}
                        value={doctorData.professionalStartDate}
                        onChange={(e) => { setDoctorData({ ...doctorData, professionalStartDate: e.target.value }); if (errors.professionalStartDate) setErrors({ ...errors, professionalStartDate: '' }); }}
                        style={inputStyle('professionalStartDate')}
                      />
                      {doctorData.professionalStartDate && (
                        <p style={{ fontSize: '12px', color: '#10B981', marginTop: '4px', fontWeight: '600' }}>
                          ✓ {calculateYearsOfExperience(doctorData.professionalStartDate)} year{calculateYearsOfExperience(doctorData.professionalStartDate) !== 1 ? 's' : ''} of experience
                        </p>
                      )}
                      {errors.professionalStartDate && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.professionalStartDate}</p>}
                    </div>
                  </div>
                )}

                {/* Nurse Fields */}
                {selectedRole === 'nurse' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>License Number <span style={{ color: '#EF4444' }}>*</span></label>
                      <input type="text" value={nurseData.licenseNumber} onChange={(e) => { setNurseData({ ...nurseData, licenseNumber: e.target.value }); if (errors.licenseNumber) setErrors({ ...errors, licenseNumber: '' }); }} style={inputStyle('licenseNumber')} placeholder="e.g., SLNMC-N-4455" />
                      {errors.licenseNumber && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.licenseNumber}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />Professional Start Date <span style={{ color: '#EF4444' }}>*</span></label>
                      <input
                        type="date"
                        max={getTodayString()}
                        value={nurseData.professionalStartDate}
                        onChange={(e) => { setNurseData({ ...nurseData, professionalStartDate: e.target.value }); if (errors.professionalStartDate) setErrors({ ...errors, professionalStartDate: '' }); }}
                        style={inputStyle('professionalStartDate')}
                      />
                      {nurseData.professionalStartDate && (
                        <p style={{ fontSize: '12px', color: '#10B981', marginTop: '4px', fontWeight: '600' }}>
                          ✓ {calculateYearsOfExperience(nurseData.professionalStartDate)} year{calculateYearsOfExperience(nurseData.professionalStartDate) !== 1 ? 's' : ''} of experience
                        </p>
                      )}
                      {errors.professionalStartDate && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.professionalStartDate}</p>}
                    </div>
                  </div>
                )}

                {/* MULTIPLE QUALIFICATIONS SECTION */}
                <div style={{
                  marginTop: '28px',
                  padding: '24px',
                  background: COLORS.bgPink50,
                  borderRadius: '16px',
                  border: `2px dashed ${errors.qualificationsList ? '#EF4444' : COLORS.bgPink200}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPink900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={20} color={COLORS.textPink600} />
                        Staff Qualifications & Documents <span style={{ color: '#EF4444' }}>*</span>
                      </h3>
                      <p style={{ fontSize: '13px', color: COLORS.textPink800, margin: '4px 0 0', opacity: 0.8 }}>
                        Add one or more qualifications. Each qualification contains description details and an optional document file.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addQualificationItem}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: COLORS.textPink600,
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                      }}
                    >
                      <Plus size={16} /> Add Another Qualification
                    </button>
                  </div>

                  {errors.qualificationsList && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginBottom: '16px', fontWeight: '500' }}>
                      ⚠️ {errors.qualificationsList}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {qualificationsList.map((item, index) => (
                      <div
                        key={item.id}
                        style={{
                          background: 'white',
                          borderRadius: '14px',
                          padding: '20px',
                          border: `1px solid ${COLORS.bgPink200}`,
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink900 }}>
                            Qualification #{index + 1}
                          </span>
                          {qualificationsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQualificationItem(index)}
                              style={{
                                background: '#fef2f2',
                                color: '#ef4444',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Trash2 size={14} /> Remove Entry
                            </button>
                          )}
                        </div>

                        {/* Text Area for Qualification Details */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={labelStyle}>Qualification Details / Title <span style={{ color: '#EF4444' }}>*</span></label>
                          <textarea
                            value={item.qualificationTitle}
                            onChange={(e) => handleQualTitleChange(index, e.target.value)}
                            rows="2"
                            style={{ ...inputStyle('qualifications'), resize: 'vertical' }}
                            placeholder="e.g., Bachelor of Medicine, Bachelor of Surgery (MBBS), MD in Pediatrics"
                          />
                        </div>

                        {/* File Upload Field for this Qualification */}
                        <div>
                          <label style={labelStyle}>Qualification Document (PDF, PNG, JPG, DOCX max 20MB)</label>
                          {!item.qualificationDoc ? (
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '16px',
                              background: COLORS.bgPink50,
                              borderRadius: '10px',
                              border: `1px dashed ${COLORS.textPink600}`,
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                              color: COLORS.textPink900,
                            }}>
                              <Upload size={18} color={COLORS.textPink600} />
                              Attach Certificate / Document for Qualification #{index + 1}
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                onChange={(e) => handleQualFileUpload(index, e.target.files[0])}
                                style={{ display: 'none' }}
                              />
                            </label>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              background: '#f0fdf4',
                              borderRadius: '10px',
                              border: '1px solid #10b981',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle size={20} color="#10b981" />
                                <div>
                                  <p style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textPink900, margin: 0 }}>
                                    {item.docFileName || 'Document attached'}
                                  </p>
                                  <span style={{ fontSize: '11px', color: '#10b981' }}>File attached</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeQualFile(index)}
                                style={{
                                  background: '#fef2f2',
                                  border: 'none',
                                  color: '#ef4444',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <X size={14} /> Remove File
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Navigation Buttons */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{ padding: '12px 24px', background: 'white', border: `2px solid ${COLORS.bgPink200}`, color: COLORS.textPink800, borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bgPink50; e.currentTarget.style.borderColor = COLORS.textPink600; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = COLORS.bgPink200; }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ flex: 1, padding: '12px', background: COLORS.textPink600, color: 'white', border: 'none', borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: isLoading ? 0.7 : 1, transition: 'all 0.3s' }}
                    onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {isLoading ? (
                      <>
                        <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: '8px', verticalAlign: 'middle' }} />
                        Registering Staff...
                      </>
                    ) : (
                      `💾 Complete Registration for ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AddUser;
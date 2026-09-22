import React, { useState, useEffect } from 'react';
import {
  Heart, User, Mail, Lock, Eye, EyeOff, Phone,
  Calendar, MapPin, Home, Smartphone, IdCard,
  AlertCircle, UserPlus, ArrowRight, Shield, Baby,
  Stethoscope, Users, Briefcase, GraduationCap,
  FileText, CheckCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerUser } from '../../services/authService';
import { getClinics } from '../../services/clinicService';

const PINK = '#F48FB1';
const PINK_DARK = '#e07a9e';
const PLUM = '#4A3B53';
const PLUM_DARK = '#3a2e42';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');

  const [formData, setFormData] = useState({
    // Common for all users
    fullName: '',
    nic: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    address: '',
    role: '',
    
    // For medical staff (Doctor, Nurse, Midwife)
    licenseNumber: '',
    specialization: '',
    qualifications: '',
    yearsOfExperience: '',
    
    // For Patients only
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    bloodGroup: '',
    
    // Account
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedRole === 'doctor' || selectedRole === 'nurse' || selectedRole === 'midwife') {
      getClinics({ status: 'active' })
        .then((data) => setClinics(data || []))
        .catch(() => setClinics([]));
    }
  }, [selectedRole]);

  const roles = [
    { id: 'patient', label: 'Patient', icon: Heart, color: PINK, description: 'Register as a patient to receive care' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#10B981', description: 'Medical professional — requires clinic approval' },
    { id: 'nurse', label: 'Nurse', icon: Users, color: '#3B82F6', description: 'Nursing staff — requires clinic approval' },
    { id: 'midwife', label: 'Midwife', icon: Baby, color: '#8B5CF6', description: 'Maternal care specialist — requires clinic approval' },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setFormData(prev => ({ ...prev, role: roleId }));
    setShowRoleSelection(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Common validation for all users
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC is required';
    } else if (formData.nic.length < 10) {
      newErrors.nic = 'Enter valid NIC';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\d\s+()-]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Staff-specific validation (Doctor, Nurse, Midwife)
    if (selectedRole === 'doctor' || selectedRole === 'nurse' || selectedRole === 'midwife') {
      if (!selectedClinicId) {
        newErrors.clinicId = 'Please select a clinic';
      }
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
    }
    
    // Patient-specific validation
    if (selectedRole === 'patient') {
      if (!formData.emergencyName.trim()) newErrors.emergencyName = 'Emergency contact name is required';
      if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required';
    }
    
    // Account validation for all
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        nic: formData.nic,
        role: selectedRole,
        clinicKey: selectedClinicId || undefined,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
        qualifications: formData.qualifications,
        yearsOfExperience: formData.yearsOfExperience,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
        emergencyRelation: formData.emergencyRelation,
        bloodGroup: formData.bloodGroup,
      };

      const result = await registerUser(payload);
      toast.success(result.message || 'Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToRoleSelection = () => {
    setShowRoleSelection(true);
    setSelectedRole('');
  };

  const inputStyle = (hasError, isFocused = false) => ({
    width: '100%',
    padding: isMobile ? '12px' : '14px',
    border: `1.5px solid ${hasError ? '#ef4444' : isFocused ? PINK : '#e5e7eb'}`,
    borderRadius: '14px',
    fontSize: isMobile ? '15px' : '14px',
    outline: 'none',
    transition: 'all 0.2s',
    background: isFocused ? '#fff' : '#fafafa',
    fontFamily: 'inherit'
  });

  // Role Selection Screen
  if (showRoleSelection) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #FFF7FA 0%, #FCE4EC 55%, #FFF0F5 100%)',
        padding: isMobile ? '16px' : '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : '600px',
          width: '100%',
          background: 'white',
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${PLUM}, ${PLUM_DARK})`,
            padding: isMobile ? '32px 24px' : '40px 32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: isMobile ? '56px' : '64px',
              height: isMobile ? '56px' : '64px',
              background: `rgba(244, 143, 177, 0.2)`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <UserPlus size={isMobile ? 28 : 32} color={PINK} />
            </div>
            <h1 style={{ color: 'white', fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginBottom: '8px' }}>
              Create Account
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
              Select your role to get started
            </p>
          </div>

          <div style={{ padding: isMobile ? '24px' : '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#f9fafb',
                    border: `2px solid transparent`,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = role.color;
                    e.currentTarget.style.background = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: `${role.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <role.icon size={24} color={role.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {role.label}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{role.description}</p>
                  </div>
                  <ArrowRight size={20} color="#9ca3af" />
                </button>
              ))}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: PINK, textDecoration: 'none', fontWeight: '600' }}>
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form (shown after role selection)
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #FFF7FA 0%, #FCE4EC 55%, #FFF0F5 100%)',
      padding: isMobile ? '16px' : '24px',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Decorative Elements */}
      <div style={{ position: 'absolute', top: '5%', right: '5%', opacity: 0.1 }}>
        {selectedRole === 'patient' && <Heart size={80} color={PINK} />}
        {selectedRole === 'doctor' && <Stethoscope size={80} color="#10B981" />}
        {selectedRole === 'nurse' && <Users size={80} color="#3B82F6" />}
        {selectedRole === 'midwife' && <Baby size={80} color="#8B5CF6" />}
      </div>

      {/* Main Container */}
      <div style={{
        maxWidth: isMobile ? '100%' : '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${PLUM}, ${PLUM_DARK})`,
          padding: isMobile ? '24px 24px 32px' : '32px 32px 40px',
          position: 'relative'
        }}>
          <button
            onClick={goBackToRoleSelection}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '10px',
              padding: '6px 12px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            Back
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <div style={{
              width: isMobile ? '56px' : '64px',
              height: isMobile ? '56px' : '64px',
              background: `rgba(244, 143, 177, 0.2)`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              {selectedRole === 'patient' && <Heart size={28} color={PINK} />}
              {selectedRole === 'doctor' && <Stethoscope size={28} color="#10B981" />}
              {selectedRole === 'nurse' && <Users size={28} color="#3B82F6" />}
              {selectedRole === 'midwife' && <Baby size={28} color="#8B5CF6" />}
            </div>
            <h1 style={{ color: 'white', fontSize: isMobile ? '22px' : '26px', fontWeight: '700', marginBottom: '4px' }}>
              Register as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
              Please fill in your details below
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: isMobile ? '24px' : '32px' }}>
            
            {/* Basic Information - Common for all */}
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color={PINK} />
                Basic Information
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleChange} style={inputStyle(!!errors.fullName)} />
                {errors.fullName && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.fullName}</p>}
                
                <input type="text" name="nic" placeholder="NIC Number *" value={formData.nic} onChange={handleChange} style={inputStyle(!!errors.nic)} />
                {errors.nic && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.nic}</p>}
                
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} style={inputStyle(!!errors.dateOfBirth)} />
                {errors.dateOfBirth && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.dateOfBirth}</p>}
                
                <input type="tel" name="phoneNumber" placeholder="Phone Number *" value={formData.phoneNumber} onChange={handleChange} style={inputStyle(!!errors.phoneNumber)} />
                {errors.phoneNumber && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.phoneNumber}</p>}
                
                <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} style={inputStyle(!!errors.email)} />
                {errors.email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.email}</p>}
                
                <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} rows="2" style={inputStyle(false)} />
              </div>
            </div>

            {/* Staff-Specific Fields (Doctor, Nurse, Midwife) */}
            {(selectedRole === 'doctor' || selectedRole === 'nurse' || selectedRole === 'midwife') && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} color={PINK} />
                  Professional Information
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <select
                    value={selectedClinicId}
                    onChange={(e) => setSelectedClinicId(e.target.value)}
                    style={inputStyle(!!errors.clinicId)}
                  >
                    <option value="">Select Clinic *</option>
                    {clinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.clinic_name} — {clinic.city}
                      </option>
                    ))}
                  </select>
                  {errors.clinicId && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.clinicId}</p>}

                  <input type="text" name="licenseNumber" placeholder="License Number *" value={formData.licenseNumber} onChange={handleChange} style={inputStyle(!!errors.licenseNumber)} />
                  {errors.licenseNumber && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.licenseNumber}</p>}

                  <input type="text" name="qualifications" placeholder="Qualifications" value={formData.qualifications} onChange={handleChange} style={inputStyle(false)} />
                  <input type="number" name="yearsOfExperience" placeholder="Years of Experience" value={formData.yearsOfExperience} onChange={handleChange} style={inputStyle(false)} />

                  <p style={{ fontSize: '12px', color: '#6b7280', background: '#f9fafb', padding: '12px', borderRadius: '12px' }}>
                    Staff accounts are created with pending status. A clinic administrator must activate your account before you can sign in.
                  </p>
                </div>
              </div>
            )}

            {/* Patient-Specific Fields (Emergency Contact) */}
            {selectedRole === 'patient' && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={20} color={PINK} />
                  Emergency Contact
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input type="text" name="emergencyName" placeholder="Emergency Contact Name *" value={formData.emergencyName} onChange={handleChange} style={inputStyle(!!errors.emergencyName)} />
                  {errors.emergencyName && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.emergencyName}</p>}
                  
                  <input type="tel" name="emergencyPhone" placeholder="Emergency Phone *" value={formData.emergencyPhone} onChange={handleChange} style={inputStyle(!!errors.emergencyPhone)} />
                  {errors.emergencyPhone && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.emergencyPhone}</p>}
                  
                  <input type="text" name="emergencyRelation" placeholder="Relationship (e.g., Husband, Mother)" value={formData.emergencyRelation} onChange={handleChange} style={inputStyle(false)} />
                  
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={inputStyle(false)}>
                    <option value="">Select Blood Group (Optional)</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            )}

            {/* Account Section - Common for all */}
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} color={PINK} />
                Account Setup
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password * (min 6 characters)" value={formData.password} onChange={handleChange} style={inputStyle(!!errors.password)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.password}</p>}
                
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password *" value={formData.confirmPassword} onChange={handleChange} style={inputStyle(!!errors.confirmPassword)} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '-12px' }}>{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} style={{
              width: '100%', padding: isMobile ? '14px' : '16px',
              background: `linear-gradient(135deg, ${PINK}, ${PINK_DARK})`,
              color: 'white', border: 'none', borderRadius: '16px',
              fontSize: isMobile ? '16px' : '16px', fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {isLoading ? <><div style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Creating Account...</>
              : <><UserPlus size={18} /> Register as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} <ArrowRight size={16} /></>}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Register;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Briefcase,
  Stethoscope,
  Baby,
  Users,
  MapPin,
  Map,
  CheckCircle,
  X,
  Award,
  Eye,
  EyeOff,
  Calendar,
  Plus,
  Trash2,
  Upload,
  Edit3,
  Save,
  FileText,
  ExternalLink,
  ShieldX
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { getClinicUserById, updateClinicUser, getClinicAreas } from '../../../services/userService';
import {
  getStaffQualifications,
  addStaffQualification,
  updateStaffQualification,
  deleteStaffQualification
} from '../../../services/qualificationService';
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

// ─── Qualification Panel ────────────────────────────────────────────────────
const QualificationPanel = ({ userId }) => {
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const emptyForm = { qualificationTitle: '', qualificationDoc: null, docFileName: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadQualifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const result = await getStaffQualifications(userId);
      setQualifications(Array.isArray(result) ? result : (result?.data || []));
    } catch {
      setQualifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadQualifications();
  }, [loadQualifications]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast.error('File must be less than 20MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setFormData((prev) => ({ ...prev, qualificationDoc: reader.result, docFileName: file.name }));
    reader.readAsDataURL(file);
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setFormData({
      qualificationTitle: q.qualification_title || '',
      qualificationDoc: q.document_url || null,
      docFileName: q.document_url ? 'Existing document' : '',
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!formData.qualificationTitle.trim()) { toast.error('Qualification title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        qualificationTitle: formData.qualificationTitle,
        qualificationDoc: formData.qualificationDoc,
        fileName: formData.docFileName,
        user_id: userId,
      };
      if (editingId) {
        await updateStaffQualification(editingId, payload);
        toast.success('Qualification updated');
      } else {
        await addStaffQualification(userId, payload);
        toast.success('Qualification added');
      }
      setEditingId(null);
      setShowAddForm(false);
      setFormData(emptyForm);
      await loadQualifications();
    } catch (err) {
      toast.error(err.message || 'Failed to save qualification');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this qualification?')) return;
    try {
      await deleteStaffQualification(id);
      toast.success('Qualification removed');
      await loadQualifications();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const isEditingOrAdding = editingId !== null || showAddForm;

  return (
    <div style={{ marginTop: '28px', padding: '24px', background: COLORS.bgPink50, borderRadius: '16px', border: `2px dashed ${COLORS.bgPink200}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPink900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color={COLORS.textPink600} />
            Qualification Records
          </h3>
          <p style={{ fontSize: '13px', color: COLORS.textPink800, margin: '4px 0 0', opacity: 0.8 }}>
            Manage certifications, licenses and professional documents.
          </p>
        </div>
        {!isEditingOrAdding && (
          <button
            type="button"
            onClick={() => { setShowAddForm(true); setFormData(emptyForm); setEditingId(null); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: COLORS.textPink600, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
          >
            <Plus size={16} /> Add Qualification
          </button>
        )}
      </div>

      {/* Inline Add / Edit Form */}
      {isEditingOrAdding && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: `1px solid ${COLORS.bgPink200}`, marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink900, marginBottom: '14px' }}>
            {editingId ? '✏️ Edit Qualification' : '➕ New Qualification'}
          </h4>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: COLORS.textPink800 }}>
              Qualification Title / Details *
            </label>
            <textarea
              value={formData.qualificationTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, qualificationTitle: e.target.value }))}
              rows="3"
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${COLORS.bgPink200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              placeholder="e.g., MBBS, MD in Obstetrics, FRCOG..."
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: COLORS.textPink800 }}>
              Certificate / Document (PDF, PNG, JPG – max 20MB)
            </label>
            {!formData.qualificationDoc ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px', background: COLORS.bgPink50, borderRadius: '10px', border: `1px dashed ${COLORS.textPink600}`, cursor: 'pointer', fontSize: '13px', color: COLORS.textPink900, fontWeight: '600' }}>
                <Upload size={18} color={COLORS.textPink600} />
                Attach Document
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(e) => handleFileSelect(e.target.files[0])} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textPink900 }}>{formData.docFileName}</span>
                </div>
                <button type="button" onClick={() => setFormData((prev) => ({ ...prev, qualificationDoc: null, docFileName: '' }))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                  <X size={14} /> Remove
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: COLORS.textPink600, color: 'white', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', opacity: saving ? 0.7 : 1 }}>
              <Save size={15} /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Add')}
            </button>
            <button type="button" onClick={cancelEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'white', color: COLORS.textPink800, border: `1px solid ${COLORS.bgPink200}`, borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              <X size={15} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Records */}
      {loading ? (
        <p style={{ fontSize: '13px', color: COLORS.textPink800, textAlign: 'center', padding: '20px' }}>Loading qualifications...</p>
      ) : qualifications.length === 0 ? (
        <p style={{ fontSize: '13px', color: COLORS.textPink800, textAlign: 'center', padding: '20px', opacity: 0.7 }}>No qualifications recorded. Click "Add Qualification" to get started.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {qualifications.map((q) => (
            <div key={q.id} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: `1px solid ${COLORS.bgPink200}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FileText size={16} color={COLORS.textPink600} />
                  <p style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textPink900, margin: 0 }}>
                    {q.qualification_title || 'Qualification'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {q.license_number && (
                    <span style={{ fontSize: '12px', color: COLORS.textPink800, background: COLORS.bgPink50, padding: '2px 8px', borderRadius: '6px', fontWeight: '500' }}>
                      🪪 {q.license_number}
                    </span>
                  )}
                  {q.professional_start_date && (
                    <span style={{ fontSize: '12px', color: COLORS.textPink800, background: COLORS.bgPink50, padding: '2px 8px', borderRadius: '6px', fontWeight: '500' }}>
                      📅 Since {new Date(q.professional_start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  )}
                  {q.document_url && (
                    <a href={q.document_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '500' }}>
                      <ExternalLink size={12} /> View Document
                    </a>
                  )}
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Added {q.uploaded_date ? new Date(q.uploaded_date).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => startEdit(q)}
                  style={{ padding: '6px 10px', background: COLORS.bgPink50, border: `1px solid ${COLORS.bgPink200}`, borderRadius: '8px', cursor: 'pointer', color: COLORS.textPink800, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  style={{ padding: '6px 10px', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main EditUser component ────────────────────────────────────────────────
const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentClinic, hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [selectedRole, setSelectedRole] = useState('doctor');
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Areas & zones for midwife assignment
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');

  // Step 1: Username, Email, Password (optional), Status
  const [commonData, setCommonData] = useState({
    username: '',
    email: '',
    password: '',
    status: 'active',
  });

  // Step 2: Role Specific Fields
  const [doctorData, setDoctorData] = useState({
    licenseNumber: '',
    professionalStartDate: '',
  });

  const [nurseData, setNurseData] = useState({
    licenseNumber: '',
    professionalStartDate: '',
  });

  const [midwifeData, setMidwifeData] = useState({
    licenseNumber: '',
    professionalStartDate: '',
  });

  useEffect(() => {
    const loadUserAndAreas = async () => {
      try {
        setIsLoading(true);
        const userData = await getClinicUserById(id);
        const normalizedRole = String(userData.role || 'doctor').toLowerCase();

        setSelectedRole(normalizedRole);
        setCommonData({
          username: userData.username || userData.fullName || userData.email || '',
          email: userData.email || '',
          password: '',
          status: String(userData.status || 'active').toLowerCase(),
        });

        const activeData = {
          licenseNumber: userData.licenseNumber || userData.license_number || '',
          professionalStartDate: userData.professionalStartDate || userData.professional_start_date || '',
        };

        if (normalizedRole === 'doctor') {
          setDoctorData(activeData);
        } else if (normalizedRole === 'nurse') {
          setNurseData(activeData);
        } else if (normalizedRole === 'midwife') {
          setMidwifeData(activeData);
          if (userData.area_id || userData.areaId) {
            setSelectedAreaId(String(userData.area_id || userData.areaId));
          }
        }

        if (currentClinic?.id) {
          const areaList = await getClinicAreas(currentClinic.id);
          setAreas(areaList || []);
        }
      } catch (error) {
        toast.error(error.message || 'Unable to load staff member details');
        navigate('/users');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndAreas();
  }, [id, currentClinic, navigate]);

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setCommonData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateCommonFields = () => {
    const newErrors = {};
    if (!commonData.username.trim()) newErrors.username = 'Username is required';
    if (!commonData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(commonData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (commonData.password && commonData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters if changing';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2Fields = () => {
    const newErrors = {};

    if (selectedRole === 'doctor') {
      if (!doctorData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
      if (!doctorData.professionalStartDate) newErrors.professionalStartDate = 'Professional Start Date is required';
    } else if (selectedRole === 'nurse') {
      if (!nurseData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
      if (!nurseData.professionalStartDate) newErrors.professionalStartDate = 'Professional Start Date is required';
    } else if (selectedRole === 'midwife') {
      if (!selectedAreaId) newErrors.area_id = 'Area assignment is required for Midwife';
      if (!midwifeData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
      if (!midwifeData.professionalStartDate) newErrors.professionalStartDate = 'Professional Start Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveUserData = async () => {
    setIsLoading(true);

    const activeRoleData =
      selectedRole === 'doctor'
        ? doctorData
        : selectedRole === 'nurse'
        ? nurseData
        : midwifeData;

    const updatedData = {
      username: commonData.username,
      fullName: commonData.username,
      email: commonData.email,
      role: selectedRole,
      clinicKey: currentClinic?.id,
      status: commonData.status,
      licenseNumber: activeRoleData.licenseNumber,
      professionalStartDate: activeRoleData.professionalStartDate,
    };

    if (commonData.password) {
      updatedData.password = commonData.password;
    }

    if (selectedRole === 'midwife' && selectedAreaId) {
      updatedData.area_id = parseInt(selectedAreaId, 10);
    }

    try {
      await updateClinicUser(id, updatedData);
      toast.success('Staff profile updated successfully!');
      navigate('/users');
    } catch (error) {
      toast.error(error.message || 'Failed to update staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateCommonFields()) {
      setCurrentStep(1);
      toast.error('Please fix errors in Basic Information');
      return;
    }
    if (!validateStep2Fields()) {
      setCurrentStep(2);
      toast.error('Please fix errors in Additional Details');
      return;
    }
    saveUserData();
  };

  const handleNext = () => {
    if (validateCommonFields()) {
      setCurrentStep(2);
    } else {
      toast.error('Please fix errors in Basic Information first');
    }
  };

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${errors[fieldName] ? '#EF4444' : COLORS.bgPink200}`,
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
    color: COLORS.textPink900,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  });

  const selectStyle = (fieldName) => ({
    ...inputStyle(fieldName),
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239d174d' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '40px',
  });

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: COLORS.textPink800,
  };

  // Parse numeric userId from route param
  const numericUserId = parseInt(id, 10);

  // ── No EDIT_STAFF permission ──────────────────────────────────────────────
  if (!hasPermission('EDIT_STAFF')) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: 'white', padding: '48px 64px', borderRadius: '24px', border: '1px solid #fbcfe8', boxShadow: '0 4px 24px rgba(131,24,67,0.06)' }}>
          <ShieldX size={48} color="#db2777" />
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#831843', margin: 0 }}>Access Restricted</h2>
          <p style={{ color: '#9d174d', fontSize: '14px', margin: 0 }}>You do not have permission to edit staff members.<br />Contact your Super Admin to enable this access.</p>
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
          marginBottom: '20px',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bgPink100; e.currentTarget.style.transform = 'translateX(-4px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateX(0)'; }}
      >
        <ArrowLeft size={18} /> Back to Users
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
            Edit Staff Profile
          </h1>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>
            Update staff information for {currentClinic?.clinic_name || 'your clinic'}
          </p>
        </div>

        {/* Step Tabs */}
        <div style={{
          display: 'flex',
          background: COLORS.bgPink50,
          borderBottom: `1px solid ${COLORS.bgPink200}`,
        }}>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: currentStep === 1 ? 'white' : 'transparent',
              color: COLORS.textPink900,
              fontWeight: '600',
              cursor: 'pointer',
              borderBottom: currentStep === 1 ? `3px solid ${COLORS.textPink600}` : '3px solid transparent',
              transition: 'all 0.3s',
            }}
          >
            1. Basic Information
          </button>
          <button
            type="button"
            onClick={() => {
              if (validateCommonFields()) {
                setCurrentStep(2);
              } else {
                toast.error('Please complete Basic Information first');
              }
            }}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: currentStep === 2 ? 'white' : 'transparent',
              color: COLORS.textPink900,
              fontWeight: '600',
              cursor: 'pointer',
              borderBottom: currentStep === 2 ? `3px solid ${COLORS.textPink600}` : '3px solid transparent',
              transition: 'all 0.3s',
            }}
          >
            2. Professional Details & Qualifications
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '32px', background: 'white' }}>

            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color={COLORS.textPink600} />
                  Basic Information
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {/* Username */}
                  <div>
                    <label style={labelStyle}>Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={commonData.username}
                      onChange={handleCommonChange}
                      style={inputStyle('username')}
                      placeholder="Enter username"
                    />
                    {errors.username && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.username}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={commonData.email}
                      onChange={handleCommonChange}
                      style={inputStyle('email')}
                      placeholder="Enter email address"
                    />
                    {errors.email && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.email}</p>}
                  </div>

                  {/* New Password (Optional) */}
                  <div>
                    <label style={labelStyle}>New Password (leave blank to keep existing)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={commonData.password}
                        onChange={handleCommonChange}
                        style={inputStyle('password')}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textPink800 }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.password}</p>}
                  </div>

                  {/* Account Status */}
                  <div>
                    <label style={labelStyle}>Account Status *</label>
                    <select
                      name="status"
                      value={commonData.status}
                      onChange={handleCommonChange}
                      style={selectStyle('status')}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      padding: '12px 32px',
                      background: COLORS.textPink600,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                    }}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Professional Details & Qualifications */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} color={COLORS.textPink600} />
                  Professional Details & Qualifications
                  <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: '600', marginLeft: '8px' }}>(Required *)</span>
                </h2>
                <p style={{ fontSize: '13px', color: COLORS.textPink800, marginBottom: '24px', opacity: 0.8 }}>
                  Update professional info below. Use the Qualification Records section to add, edit, or remove qualification entries.
                </p>

                {/* Doctor Fields */}
                {selectedRole === 'doctor' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>License Number *</label>
                      <input
                        type="text"
                        value={doctorData.licenseNumber}
                        onChange={(e) => setDoctorData({ ...doctorData, licenseNumber: e.target.value })}
                        style={inputStyle('licenseNumber')}
                        placeholder="e.g., SLMC-12345"
                      />
                      {errors.licenseNumber && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.licenseNumber}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />Professional Start Date *</label>
                      <input
                        type="date"
                        max={getTodayString()}
                        value={doctorData.professionalStartDate}
                        onChange={(e) => setDoctorData({ ...doctorData, professionalStartDate: e.target.value })}
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
                      <label style={labelStyle}>License Number *</label>
                      <input
                        type="text"
                        value={nurseData.licenseNumber}
                        onChange={(e) => setNurseData({ ...nurseData, licenseNumber: e.target.value })}
                        style={inputStyle('licenseNumber')}
                        placeholder="e.g., SLNMC-N-4455"
                      />
                      {errors.licenseNumber && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.licenseNumber}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />Professional Start Date *</label>
                      <input
                        type="date"
                        max={getTodayString()}
                        value={nurseData.professionalStartDate}
                        onChange={(e) => setNurseData({ ...nurseData, professionalStartDate: e.target.value })}
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

                {/* Midwife Fields */}
                {selectedRole === 'midwife' && (
                  <div>
                    <div style={{
                      background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                      borderRadius: '16px', padding: '20px', marginBottom: '20px',
                      border: '1px solid #c4b5fd',
                    }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#5b21b6', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={18} color="#7c3aed" />
                        Area Assignment *
                      </h3>
                      <select
                        value={selectedAreaId}
                        onChange={(e) => setSelectedAreaId(e.target.value)}
                        style={selectStyle('area_id')}
                      >
                        <option value="">— Select Area —</option>
                        {areas.map((area) => (
                          <option key={area.area_id} value={area.area_id}>
                            {area.area_name} {area.area_code ? `(${area.area_code})` : ''}
                          </option>
                        ))}
                      </select>
                      {errors.area_id && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.area_id}</p>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                      <div>
                        <label style={labelStyle}>License Number *</label>
                        <input
                          type="text"
                          value={midwifeData.licenseNumber}
                          onChange={(e) => setMidwifeData({ ...midwifeData, licenseNumber: e.target.value })}
                          style={inputStyle('licenseNumber')}
                          placeholder="e.g., SLNMC-MW-9988"
                        />
                        {errors.licenseNumber && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.licenseNumber}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />Professional Start Date *</label>
                        <input
                          type="date"
                          max={getTodayString()}
                          value={midwifeData.professionalStartDate}
                          onChange={(e) => setMidwifeData({ ...midwifeData, professionalStartDate: e.target.value })}
                          style={inputStyle('professionalStartDate')}
                        />
                        {midwifeData.professionalStartDate && (
                          <p style={{ fontSize: '12px', color: '#10B981', marginTop: '4px', fontWeight: '600' }}>
                            ✓ {calculateYearsOfExperience(midwifeData.professionalStartDate)} year{calculateYearsOfExperience(midwifeData.professionalStartDate) !== 1 ? 's' : ''} of experience
                          </p>
                        )}
                        {errors.professionalStartDate && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.professionalStartDate}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Qualification Records Panel */}
                {!isNaN(numericUserId) && <QualificationPanel userId={numericUserId} />}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      padding: '12px 24px',
                      background: 'white',
                      border: `2px solid ${COLORS.bgPink200}`,
                      color: COLORS.textPink800,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: COLORS.textPink600,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      opacity: isLoading ? 0.7 : 1,
                      transition: 'all 0.3s',
                    }}
                  >
                    {isLoading ? 'Saving Changes...' : '💾 Save Profile Changes to Database'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
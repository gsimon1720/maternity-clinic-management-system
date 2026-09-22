import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Briefcase,
  Eye,
  EyeOff,
  MapPin,
  Map,
  Upload,
  CheckCircle,
  X,
  Award,
  Calendar,
  Plus,
  Trash2,
} from 'lucide-react';
import { createClinicUser, getAllUnassignedAreas } from '../../../services/userService';
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

const AddMidwife = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [areasLoading, setAreasLoading] = useState(false);

  const [commonData, setCommonData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [midwifeData, setMidwifeData] = useState({
    licenseNumber: '',
    professionalStartDate: '',
  });

  const [qualificationsList, setQualificationsList] = useState([
    { id: Date.now(), qualificationTitle: '', qualificationDoc: null, docFileName: '' }
  ]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setAreasLoading(true);
    getAllUnassignedAreas()
      .then((data) => setAreas(data || []))
      .catch(() => {
        toast.error('Failed to load available areas');
        setAreas([]);
      })
      .finally(() => setAreasLoading(false));
  }, []);

  const selectedArea = areas.find((a) => String(a.area_id) === String(selectedAreaId));

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

    if (!selectedAreaId) newErrors.area_id = 'Area assignment is required for Midwife';
    if (!midwifeData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
    if (!midwifeData.professionalStartDate) newErrors.professionalStartDate = 'Professional Start Date is required';

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
      toast.error('Please complete all required additional details');
      return;
    }

    setIsLoading(true);

    const userData = {
      username: commonData.username,
      fullName: commonData.username,
      email: commonData.email,
      password: commonData.password,
      role: 'midwife',
      status: 'active',
      licenseNumber: midwifeData.licenseNumber,
      professionalStartDate: midwifeData.professionalStartDate,
      area_id: parseInt(selectedAreaId, 10),
      qualificationsList: qualificationsList.map((q) => ({
        qualificationTitle: q.qualificationTitle,
        qualificationDoc: q.qualificationDoc,
        fileName: q.docFileName,
      })),
    };

    try {
      await createClinicUser(userData);
      toast.success('Midwife registered successfully!');
      navigate('/sphm/midwives');
    } catch (error) {
      toast.error(error.message || 'Failed to register midwife');
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
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    color: COLORS.textPink900,
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

  return (
    <div style={{ padding: '24px', background: `linear-gradient(135deg, ${COLORS.bgPink50} 0%, ${COLORS.bgPink100} 100%)`, minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/sphm/midwives')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: `1px solid ${COLORS.bgPink200}`, borderRadius: '10px', cursor: 'pointer', color: COLORS.textPink800, fontWeight: '500', fontSize: '14px', marginBottom: '24px' }}
      >
        <ArrowLeft size={18} /> Back to Midwives
      </button>

      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(131,24,67,0.08)', overflow: 'hidden', border: `1px solid ${COLORS.bgPink200}` }}>
        <div style={{ background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`, padding: '32px', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Add New Midwife</h1>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>The clinic is assigned automatically based on the selected Area</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px 32px', background: COLORS.bgPink50, borderBottom: `1px solid ${COLORS.bgPink200}` }}>
          {['Basic Info', 'Area, License & Qualifications'].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: currentStep === i + 1 ? COLORS.textPink600 : (currentStep > i + 1 ? '#10B981' : COLORS.bgPink200), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' }}>
                {currentStep > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: currentStep === i + 1 ? COLORS.textPink900 : COLORS.textPink800 }}>{step}</span>
              {i < 1 && <div style={{ width: '40px', height: '2px', background: currentStep > 1 ? '#10B981' : COLORS.bgPink200 }} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '32px' }}>
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color={COLORS.textPink600} /> Basic Information <span style={{ fontSize: '12px', color: '#EF4444' }}>(Required *)</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}><User size={14} style={{ display: 'inline', marginRight: '4px' }} />Username <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" name="username" value={commonData.username} onChange={handleCommonChange} style={inputStyle('username')} placeholder="Enter username" />
                    {errors.username && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.username}</p>}
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />Email Address <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="email" name="email" value={commonData.email} onChange={handleCommonChange} style={inputStyle('email')} placeholder="Enter email address" />
                    {errors.email && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.email}</p>}
                  </div>
                </div>

                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '24px', marginTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} color={COLORS.textPink600} /> Security Credentials <span style={{ fontSize: '12px', color: '#EF4444' }}>*</span>
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

                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={handleNext} style={{ padding: '12px 32px', background: COLORS.textPink600, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} color={COLORS.textPink600} /> Area, License & Qualifications
                  <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: '600', marginLeft: '8px' }}>(All fields required *)</span>
                </h2>

                {/* Area Assignment */}
                <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: `2px solid ${errors.area_id ? '#EF4444' : '#c4b5fd'}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#5b21b6', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="#7c3aed" /> Area Assignment <span style={{ color: '#EF4444' }}>*</span>
                  </h3>
                  <p style={{ fontSize: '12px', color: '#7c3aed', marginBottom: '12px', opacity: 0.85 }}>
                    Only areas not yet assigned to another midwife are shown — each Area can have exactly one Midwife.
                  </p>
                  {areasLoading ? (
                    <p style={{ color: '#7c3aed', fontSize: '13px' }}>Loading available areas...</p>
                  ) : (
                    <div>
                      <select
                        value={selectedAreaId}
                        onChange={(e) => { setSelectedAreaId(e.target.value); if (errors.area_id) setErrors({ ...errors, area_id: '' }); }}
                        style={selectStyle('area_id')}
                      >
                        <option value="">— Select Assigned Area —</option>
                        {areas.map((area) => (
                          <option key={area.area_id} value={area.area_id}>
                            {area.area_name}{area.area_code ? ` (${area.area_code})` : ''}{area.clinic_name ? ` — ${area.clinic_name}` : ''}
                          </option>
                        ))}
                      </select>
                      {areas.length === 0 && !areasLoading && (
                        <p style={{ fontSize: '12px', color: '#d97706', marginTop: '6px' }}>No unassigned areas available system-wide.</p>
                      )}
                      {errors.area_id && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.area_id}</p>}
                    </div>
                  )}

                  {/* Read-only Zones + Clinic for the selected Area */}
                  {selectedArea && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #c4b5fd' }}>
                      {selectedArea.clinic_name && (
                        <p style={{ fontSize: '12px', color: '#5b21b6', fontWeight: '600', marginBottom: '10px' }}>
                          This Midwife will be automatically assigned to: <strong>{selectedArea.clinic_name}</strong>
                        </p>
                      )}
                      <label style={{ ...labelStyle, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Map size={14} /> Zones covered by this Area (read-only)
                      </label>
                      {selectedArea.zones?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {selectedArea.zones.map((z) => (
                            <span key={z.zone_id} style={{ background: 'white', border: '1px solid #c4b5fd', color: '#5b21b6', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                              {z.zone_name}{z.zone_code ? ` (${z.zone_code})` : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: '#7c3aed', opacity: 0.8, marginTop: '6px' }}>No zones defined for this area yet.</p>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>License Number <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" value={midwifeData.licenseNumber} onChange={(e) => { setMidwifeData({ ...midwifeData, licenseNumber: e.target.value }); if (errors.licenseNumber) setErrors({ ...errors, licenseNumber: '' }); }} style={inputStyle('licenseNumber')} placeholder="e.g., SLNMC-MW-9988" />
                    {errors.licenseNumber && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>{errors.licenseNumber}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />Professional Start Date <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="date"
                      max={getTodayString()}
                      value={midwifeData.professionalStartDate}
                      onChange={(e) => { setMidwifeData({ ...midwifeData, professionalStartDate: e.target.value }); if (errors.professionalStartDate) setErrors({ ...errors, professionalStartDate: '' }); }}
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

                {/* Qualifications */}
                <div style={{ marginTop: '28px', padding: '24px', background: COLORS.bgPink50, borderRadius: '16px', border: `2px dashed ${errors.qualificationsList ? '#EF4444' : COLORS.bgPink200}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPink900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={20} color={COLORS.textPink600} /> Qualifications & Documents <span style={{ color: '#EF4444' }}>*</span>
                      </h3>
                      <p style={{ fontSize: '13px', color: COLORS.textPink800, margin: '4px 0 0', opacity: 0.8 }}>
                        Add one or more qualifications. Each qualification contains description details and an optional document file.
                      </p>
                    </div>
                    <button type="button" onClick={addQualificationItem} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: COLORS.textPink600, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      <Plus size={16} /> Add Another Qualification
                    </button>
                  </div>

                  {errors.qualificationsList && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginBottom: '16px', fontWeight: '500' }}>⚠️ {errors.qualificationsList}</p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {qualificationsList.map((item, index) => (
                      <div key={item.id} style={{ background: 'white', borderRadius: '14px', padding: '20px', border: `1px solid ${COLORS.bgPink200}`, position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink900 }}>Qualification #{index + 1}</span>
                          {qualificationsList.length > 1 && (
                            <button type="button" onClick={() => removeQualificationItem(index)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Trash2 size={14} /> Remove Entry
                            </button>
                          )}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={labelStyle}>Qualification Details / Title <span style={{ color: '#EF4444' }}>*</span></label>
                          <textarea
                            value={item.qualificationTitle}
                            onChange={(e) => handleQualTitleChange(index, e.target.value)}
                            rows="2"
                            style={{ ...inputStyle('qualifications'), resize: 'vertical' }}
                            placeholder="e.g., Diploma in Midwifery, Registered Midwife certification"
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Qualification Document (PDF, PNG, JPG, DOCX max 20MB)</label>
                          {!item.qualificationDoc ? (
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: COLORS.bgPink50, borderRadius: '10px', border: `1px dashed ${COLORS.textPink600}`, cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: COLORS.textPink900 }}>
                              <Upload size={18} color={COLORS.textPink600} />
                              Attach Certificate / Document for Qualification #{index + 1}
                              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(e) => handleQualFileUpload(index, e.target.files[0])} style={{ display: 'none' }} />
                            </label>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #10b981' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle size={20} color="#10b981" />
                                <div>
                                  <p style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textPink900, margin: 0 }}>{item.docFileName || 'Document attached'}</p>
                                  <span style={{ fontSize: '11px', color: '#10b981' }}>File attached</span>
                                </div>
                              </div>
                              <button type="button" onClick={() => removeQualFile(index)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <X size={14} /> Remove File
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button type="button" onClick={handleBack} style={{ padding: '12px 24px', background: 'white', border: `2px solid ${COLORS.bgPink200}`, color: COLORS.textPink800, borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>
                    ← Back
                  </button>
                  <button type="submit" disabled={isLoading} style={{ flex: 1, padding: '12px', background: COLORS.textPink600, color: 'white', border: 'none', borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? 'Registering Midwife...' : '💾 Complete Midwife Registration'}
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

export default AddMidwife;

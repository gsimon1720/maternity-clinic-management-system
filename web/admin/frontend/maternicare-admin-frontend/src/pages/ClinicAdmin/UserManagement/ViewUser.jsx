import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  User,
  Briefcase,
  Shield,
  Stethoscope,
  Baby,
  Users,
  AlertCircle,
  IdCard,
  GraduationCap,
  Clock,
  Edit2,
  Printer,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
  Award,
  MapPin,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { getClinicUserById, getClinicAreas } from '../../../services/userService';
import { getStaffQualifications } from '../../../services/qualificationService';
import { calculateYearsOfExperience, formatProfessionalStartDate } from '../../../utils/dateUtils';
import toast from 'react-hot-toast';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const formatTimestamp = (ts) => {
  if (!ts || ts === 'N/A' || ts === 'null') return 'Never';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
};

const ViewUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentClinic } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [assignedAreaName, setAssignedAreaName] = useState('Not assigned');
  const [qualifications, setQualifications] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await getClinicUserById(id);

        const formatted = {
          id: userData.id || userData.user_id,
          username: userData.username || userData.fullName || userData.full_name || userData.email,
          fullName: userData.fullName || userData.full_name || userData.username || 'Staff Member',
          email: userData.email,
          role: userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'Unknown',
          status: String(userData.status || 'active').toLowerCase(),
          lastLogin: userData.lastLogin || userData.last_login || null,
          registeredAt: userData.createdAt || userData.created_at,
          licenseNumber: userData.licenseNumber || userData.license_number,
          qualifications: userData.qualifications,
          qualificationDoc: userData.qualificationDoc || userData.qualification_doc,
          professionalStartDate: userData.professionalStartDate || userData.professional_start_date,
          yearsOfExperience: userData.yearsOfExperience ?? calculateYearsOfExperience(userData.professionalStartDate || userData.professional_start_date),
          areaId: userData.area_id || userData.areaId,
        };

        setUser(formatted);

        if (formatted.areaId && currentClinic?.id) {
          getClinicAreas(currentClinic.id).then((areas) => {
            const matched = (areas || []).find((a) => String(a.area_id) === String(formatted.areaId));
            if (matched) setAssignedAreaName(matched.area_name);
          });
        }

        // Load qualifications separately
        try {
          const qualResult = await getStaffQualifications(formatted.id);
          setQualifications(Array.isArray(qualResult) ? qualResult : (qualResult?.data || []));
        } catch {
          setQualifications([]);
        }
      } catch (error) {
        toast.error(error.message || 'Unable to load staff member details from database');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, currentClinic]);

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'doctor': return <Stethoscope size={20} />;
      case 'nurse': return <Users size={20} />;
      case 'midwife': return <Baby size={20} />;
      case 'admin': return <Shield size={20} />;
      default: return <User size={20} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'doctor': return '#10B981';
      case 'midwife': return '#8B5CF6';
      case 'nurse': return '#3B82F6';
      case 'admin': return '#F59E0B';
      default: return COLORS.textPink600;
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    navigate(`/users/edit/${user?.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    if (!user?.qualificationDoc) {
      toast.error('No qualification document available for download');
      return;
    }
    const link = document.createElement('a');
    link.href = user.qualificationDoc;
    link.download = `Qualification_Doc_${user.username}.pdf`;
    link.click();
    toast.success('Downloading qualification document...');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.bgPink50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${COLORS.bgPink200}`,
            borderTopColor: COLORS.textPink600,
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: COLORS.textPink800 }}>Fetching staff details from Supabase database...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.bgPink50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" />
          <h2 style={{ marginTop: '16px', color: COLORS.textPink900 }}>Staff Member Not Found</h2>
          <button
            onClick={() => navigate('/users')}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              background: COLORS.textPink600,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: `linear-gradient(135deg, ${COLORS.bgPink50} 0%, ${COLORS.bgPink100} 100%)`,
      minHeight: '100vh'
    }}>
      {/* Header Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
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
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.bgPink100;
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={18} />
          Back to Users
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrint}
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
              transition: 'all 0.3s'
            }}
          >
            <Printer size={16} />
            Print Details
          </button>

          {user.qualificationDoc && (
            <button
              onClick={handleDownloadDoc}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              <Download size={16} />
              Download Qualifications
            </button>
          )}

          <button
            onClick={handleEdit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              background: COLORS.textPink600,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: `1px solid ${COLORS.bgPink200}`
      }}>
        {/* Profile Header */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`,
          padding: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}cc)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                border: '4px solid rgba(255,255,255,0.2)'
              }}>
                <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>
                  {getInitials(user.fullName)}
                </span>
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: user.status === 'active' ? '#10b981' : '#ef4444',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                border: '3px solid white'
              }} />
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>
                  {user.fullName}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {getRoleIcon(user.role)}
                  {user.role}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)' }}>
                  <User size={14} />
                  <span style={{ fontSize: '13px' }}>@{user.username}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)' }}>
                  <Mail size={14} />
                  <span style={{ fontSize: '13px' }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)' }}>
                  <Clock size={14} />
                  <span style={{ fontSize: '13px' }}>Joined {formatDate(user.registeredAt)}</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div style={{
              padding: '10px 20px',
              background: user.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              {user.status === 'active' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <CheckCircle size={18} />
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Active Staff</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                  <XCircle size={18} />
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Inactive Staff</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '0 32px',
          borderBottom: `1px solid ${COLORS.bgPink200}`,
          background: 'white'
        }}>
          {['overview', 'professional', 'details'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${COLORS.textPink600}` : '2px solid transparent',
                color: activeTab === tab ? COLORS.textPink600 : COLORS.textPink800,
                fontWeight: activeTab === tab ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '32px' }}>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <Activity size={24} color={getRoleColor(user.role)} style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.textPink900 }}>
                    {user.yearsOfExperience !== null && user.yearsOfExperience !== undefined && user.yearsOfExperience !== '' ? `${user.yearsOfExperience} Years` : 'N/A'}
                  </h3>
                  <p style={{ fontSize: '13px', color: COLORS.textPink800 }}>Years of Experience (Calculated)</p>
                </div>

                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <Clock size={24} color={COLORS.textPink600} style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.textPink900, marginTop: '4px' }}>
                    {formatTimestamp(user.lastLogin)}
                  </h3>
                  <p style={{ fontSize: '13px', color: COLORS.textPink800 }}>Last Login</p>
                </div>

                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <FileText size={24} color="#10b981" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.textPink900 }}>
                    #{user.id}
                  </h3>
                  <p style={{ fontSize: '13px', color: COLORS.textPink800 }}>Database User ID</p>
                </div>
              </div>

              {/* Information Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <InfoCard icon={User} label="Username" value={user.username} color={COLORS.textPink600} />
                <InfoCard icon={Mail} label="Email Address" value={user.email} color={COLORS.textPink600} />
                {user.licenseNumber && (
                  <InfoCard icon={IdCard} label="License Number" value={user.licenseNumber} color={COLORS.textPink600} />
                )}
                {user.role === 'Midwife' && (
                  <InfoCard icon={MapPin} label="Assigned Area" value={assignedAreaName} color="#8B5CF6" />
                )}
              </div>
            </div>
          )}

          {/* Professional Tab */}
          {activeTab === 'professional' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color={COLORS.textPink600} />
                Professional & Qualification Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <InfoCard icon={Briefcase} label="Staff Role" value={user.role} color={COLORS.textPink600} />
                <InfoCard icon={IdCard} label="License Number" value={user.licenseNumber || 'Not provided'} color={COLORS.textPink600} />
                <InfoCard icon={Calendar} label="Professional Start Date" value={formatProfessionalStartDate(user.professionalStartDate)} color={COLORS.textPink600} />
                <InfoCard icon={Activity} label="Calculated Experience" value={user.yearsOfExperience !== null && user.yearsOfExperience !== undefined && user.yearsOfExperience !== '' ? `${user.yearsOfExperience} years` : 'Not provided'} color={COLORS.textPink600} />
              </div>

              {/* Qualification Records List */}
              <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '24px', border: `1px solid ${COLORS.bgPink200}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} color={COLORS.textPink600} />
                  Qualification Records
                  <span style={{ fontSize: '13px', background: COLORS.bgPink200, color: COLORS.textPink900, padding: '2px 8px', borderRadius: '20px', fontWeight: '500', marginLeft: '4px' }}>
                    {qualifications.length}
                  </span>
                </h3>

                {qualifications.length === 0 ? (
                  <p style={{ fontSize: '14px', color: COLORS.textPink800, opacity: 0.7 }}>No qualification records found for this staff member.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {qualifications.map((q, idx) => (
                      <div key={q.id || idx} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: `1px solid ${COLORS.bgPink200}` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <GraduationCap size={16} color={COLORS.textPink600} />
                              <p style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textPink900, margin: 0 }}>
                                {q.qualification_title || 'Qualification'}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              {q.license_number && (
                                <span style={{ fontSize: '12px', background: COLORS.bgPink50, color: COLORS.textPink800, padding: '3px 10px', borderRadius: '8px', fontWeight: '500', border: `1px solid ${COLORS.bgPink200}` }}>
                                  🪪 {q.license_number}
                                </span>
                              )}
                              {q.professional_start_date && (
                                <span style={{ fontSize: '12px', background: COLORS.bgPink50, color: COLORS.textPink800, padding: '3px 10px', borderRadius: '8px', fontWeight: '500', border: `1px solid ${COLORS.bgPink200}` }}>
                                  📅 Since {new Date(q.professional_start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                </span>
                              )}
                              {q.uploaded_date && (
                                <span style={{ fontSize: '11px', color: '#9ca3af', padding: '3px 10px', borderRadius: '8px', fontWeight: '400' }}>
                                  Added {new Date(q.uploaded_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          {q.document_url && (
                            <a
                              href={q.document_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#10b981', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}
                            >
                              <ExternalLink size={13} /> View Document
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color={COLORS.textPink600} />
                Full Account Details
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <InfoCard icon={User} label="Username" value={user.username} color={COLORS.textPink800} />
                <InfoCard icon={Mail} label="Email Address" value={user.email} color={COLORS.textPink800} />
                <InfoCard icon={Clock} label="Last Login" value={formatTimestamp(user.lastLogin)} color={COLORS.textPink800} />
                <InfoCard icon={Clock} label="Account Created" value={formatDate(user.registeredAt)} color={COLORS.textPink800} />
                <InfoCard icon={FileText} label="Status" value={
                  <span style={{ color: user.status === 'active' ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                } color={COLORS.textPink800} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    background: COLORS.bgPink50,
    borderRadius: '14px',
    transition: 'all 0.3s'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      background: `${color}15`,
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={18} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', fontWeight: '500', color: COLORS.textPink900, wordBreak: 'break-word' }}>
        {value || 'Not provided'}
      </p>
    </div>
  </div>
);

export default ViewUser;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  User,
  Briefcase,
  Baby,
  AlertCircle,
  IdCard,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
  Award,
  MapPin,
  Map,
  ExternalLink,
  Calendar,
  Building2,
} from 'lucide-react';
import { getClinicUserById, getMidwives } from '../../../services/userService';
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
  purple600: '#7c3aed',
};

const formatTimestamp = (ts) => {
  if (!ts) return 'Never';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
};

const ViewMidwife = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [areaInfo, setAreaInfo] = useState(null);
  const [clinicName, setClinicName] = useState('—');
  const [qualifications, setQualifications] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await getClinicUserById(id);

        const formatted = {
          id: userData.id || userData.user_id,
          username: userData.username || userData.fullName || userData.full_name || userData.email,
          fullName: userData.fullName || userData.full_name || userData.username || 'Midwife',
          email: userData.email,
          status: String(userData.status || 'active').toLowerCase(),
          lastLogin: userData.lastLogin || userData.last_login || null,
          registeredAt: userData.createdAt || userData.created_at,
          licenseNumber: userData.licenseNumber || userData.license_number,
          professionalStartDate: userData.professionalStartDate || userData.professional_start_date,
          yearsOfExperience: userData.yearsOfExperience ?? calculateYearsOfExperience(userData.professionalStartDate || userData.professional_start_date),
          areaId: userData.area_id || userData.areaId,
        };

        setUser(formatted);

        // Pull area/zone/clinic info from the SPHM midwife listing (already enriched)
        try {
          const midwives = await getMidwives();
          const match = (midwives || []).find((m) => String(m.user_id) === String(formatted.id));
          if (match) {
            setAreaInfo(match.area || null);
            setClinicName(match.clinic?.clinic_name || '—');
          }
        } catch {
          setAreaInfo(null);
        }

        try {
          const qualResult = await getStaffQualifications(formatted.id);
          setQualifications(Array.isArray(qualResult) ? qualResult : (qualResult?.data || []));
        } catch {
          setQualifications([]);
        }
      } catch (error) {
        toast.error(error.message || 'Unable to load midwife details');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const getInitials = (name) => name?.charAt(0).toUpperCase() || 'M';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bgPink50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: `3px solid ${COLORS.bgPink200}`, borderTopColor: COLORS.textPink600, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: COLORS.textPink800 }}>Fetching midwife details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bgPink50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" />
          <h2 style={{ marginTop: '16px', color: COLORS.textPink900 }}>Midwife Not Found</h2>
          <button onClick={() => navigate('/sphm/midwives')} style={{ marginTop: '20px', padding: '10px 24px', background: COLORS.textPink600, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
            Back to Midwives
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: `linear-gradient(135deg, ${COLORS.bgPink50} 0%, ${COLORS.bgPink100} 100%)`, minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/sphm/midwives')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: `1px solid ${COLORS.bgPink200}`, borderRadius: '10px', cursor: 'pointer', color: COLORS.textPink800, fontWeight: '500', fontSize: '14px' }}
        >
          <ArrowLeft size={18} /> Back to Midwives
        </button>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: `1px solid ${COLORS.bgPink200}` }}>
        <div style={{ background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`, padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '120px', height: '120px', background: `linear-gradient(135deg, ${COLORS.purple600}, ${COLORS.purple600}cc)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', border: '4px solid rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>{getInitials(user.fullName)}</span>
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: user.status === 'active' ? '#10b981' : '#ef4444', width: '22px', height: '22px', borderRadius: '50%', border: '3px solid white' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{user.fullName}</h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(255,255,255,0.2)', borderRadius: '30px', fontSize: '13px', fontWeight: '600', color: 'white' }}>
                  <Baby size={16} /> Midwife
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)' }}>
                  <User size={14} /><span style={{ fontSize: '13px' }}>@{user.username}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)' }}>
                  <Mail size={14} /><span style={{ fontSize: '13px' }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)' }}>
                  <Clock size={14} /><span style={{ fontSize: '13px' }}>Joined {formatDate(user.registeredAt)}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 20px', background: user.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', borderRadius: '12px' }}>
              {user.status === 'active' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}><CheckCircle size={18} /><span style={{ fontWeight: '600', fontSize: '14px' }}>Active</span></div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}><XCircle size={18} /><span style={{ fontWeight: '600', fontSize: '14px' }}>Inactive</span></div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', padding: '0 32px', borderBottom: `1px solid ${COLORS.bgPink200}`, background: 'white' }}>
          {['overview', 'professional', 'coverage'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: activeTab === tab ? `2px solid ${COLORS.textPink600}` : '2px solid transparent', color: activeTab === tab ? COLORS.textPink600 : COLORS.textPink800, fontWeight: activeTab === tab ? '600' : '500', fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: '32px' }}>
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <Activity size={24} color={COLORS.purple600} style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.textPink900 }}>
                    {user.yearsOfExperience !== null && user.yearsOfExperience !== undefined && user.yearsOfExperience !== '' ? `${user.yearsOfExperience} Years` : 'N/A'}
                  </h3>
                  <p style={{ fontSize: '13px', color: COLORS.textPink800 }}>Years of Experience</p>
                </div>
                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <Clock size={24} color={COLORS.textPink600} style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.textPink900 }}>{formatTimestamp(user.lastLogin)}</h3>
                  <p style={{ fontSize: '13px', color: COLORS.textPink800 }}>Last Login</p>
                </div>
                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <FileText size={24} color="#10b981" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.textPink900 }}>#{user.id}</h3>
                  <p style={{ fontSize: '13px', color: COLORS.textPink800 }}>Database User ID</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <InfoCard icon={User} label="Username" value={user.username} color={COLORS.textPink600} />
                <InfoCard icon={Mail} label="Email Address" value={user.email} color={COLORS.textPink600} />
                <InfoCard icon={IdCard} label="License Number" value={user.licenseNumber} color={COLORS.textPink600} />
                <InfoCard icon={Building2} label="Clinic" value={clinicName} color={COLORS.textPink600} />
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color={COLORS.textPink600} /> Professional & Qualification Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <InfoCard icon={IdCard} label="License Number" value={user.licenseNumber || 'Not provided'} color={COLORS.textPink600} />
                <InfoCard icon={Calendar} label="Professional Start Date" value={formatProfessionalStartDate(user.professionalStartDate)} color={COLORS.textPink600} />
                <InfoCard icon={Activity} label="Calculated Experience" value={user.yearsOfExperience !== null && user.yearsOfExperience !== undefined && user.yearsOfExperience !== '' ? `${user.yearsOfExperience} years` : 'Not provided'} color={COLORS.textPink600} />
              </div>

              <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '24px', border: `1px solid ${COLORS.bgPink200}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} color={COLORS.textPink600} /> Qualification Records
                  <span style={{ fontSize: '13px', background: COLORS.bgPink200, color: COLORS.textPink900, padding: '2px 8px', borderRadius: '20px', fontWeight: '500', marginLeft: '4px' }}>{qualifications.length}</span>
                </h3>

                {qualifications.length === 0 ? (
                  <p style={{ fontSize: '14px', color: COLORS.textPink800, opacity: 0.7 }}>No qualification records found for this midwife.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {qualifications.map((q, idx) => (
                      <div key={q.id || idx} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: `1px solid ${COLORS.bgPink200}` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <GraduationCap size={16} color={COLORS.textPink600} />
                              <p style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textPink900, margin: 0 }}>{q.qualification_title || 'Qualification'}</p>
                            </div>
                          </div>
                          {q.document_url && (
                            <a href={q.document_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#10b981', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
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

          {activeTab === 'coverage' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color={COLORS.textPink600} /> Service Coverage
              </h2>

              {areaInfo ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
                    <InfoCard icon={MapPin} label="Assigned Area" value={`${areaInfo.area_name}${areaInfo.area_code ? ` (${areaInfo.area_code})` : ''}`} color={COLORS.purple600} />
                    <InfoCard icon={Building2} label="Responsible Clinic" value={clinicName} color={COLORS.purple600} />
                  </div>

                  <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '24px', border: `1px solid ${COLORS.bgPink200}` }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Map size={18} color={COLORS.textPink600} /> Zones in this Area (read-only)
                    </h3>
                    {areaInfo.zones?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {areaInfo.zones.map((z) => (
                          <span key={z.zone_id} style={{ background: 'white', border: `1px solid ${COLORS.bgPink200}`, color: COLORS.textPink900, padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                            {z.zone_name}{z.zone_code ? ` (${z.zone_code})` : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '14px', color: COLORS.textPink800, opacity: 0.7 }}>No zones defined for this area yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '14px', color: COLORS.textPink800, opacity: 0.7 }}>This midwife has not been assigned an area.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: COLORS.bgPink50, borderRadius: '14px' }}>
    <div style={{ width: '36px', height: '36px', background: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: '500', color: COLORS.textPink900, wordBreak: 'break-word' }}>{value || 'Not provided'}</p>
    </div>
  </div>
);

export default ViewMidwife;

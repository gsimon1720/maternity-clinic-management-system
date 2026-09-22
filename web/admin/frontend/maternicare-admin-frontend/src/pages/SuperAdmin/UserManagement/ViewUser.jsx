import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Mail, Phone, User, Building2, Shield, Stethoscope, Baby, Heart, Users, Clock, IdCard, MapPin, Calendar, Briefcase, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getClinicUserById } from '../../../services/userService';

const PLUM = '#831843';
const PINK = '#db2777';

const formatRole = (role) => {
  if (!role) return 'Unknown';
  return role.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClinicUserById(id)
      .then(setUser)
      .catch((error) => {
        toast.error(error.message || 'Unable to load user');
        navigate('/super-admin/users');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor': return '#10B981';
      case 'midwife': return '#8B5CF6';
      case 'nurse': return '#3B82F6';
      case 'clinic_admin': return '#F59E0B';
      case 'patient': return PINK;
      case 'super_admin': return PLUM;
      default: return '#6b7280';
    }
  };

  if (loading) return <div style={{ padding: '24px', color: '#831843', fontWeight: '500' }}>Loading user...</div>;
  if (!user) return null;

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #fbcfe8' }}>
      <Icon size={18} color={PINK} />
      <div>
        <div style={{ fontSize: '12px', color: '#9d174d', fontWeight: '500' }}>{label}</div>
        <div style={{ fontSize: '14px', color: PLUM, fontWeight: '600' }}>{value || '—'}</div>
      </div>
    </div>
  );

  const isClinicAdmin = (user.role || '').toLowerCase() === 'clinic_admin';

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

      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #fbcfe8', boxShadow: '0 20px 25px -5px rgba(131,24,67,0.05)' }}>
        <div style={{ background: `linear-gradient(135deg, ${PLUM}, ${PINK})`, padding: '32px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold' }}>
                {user.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{user.fullName}</h1>
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: `${getRoleColor(user.role)}30`, color: 'white', fontSize: '13px', fontWeight: '600' }}>
                  {formatRole(user.role)}
                </span>
                <span style={{ display: 'inline-block', marginLeft: '8px', padding: '4px 12px', borderRadius: '20px', background: user.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)', fontSize: '13px', fontWeight: '600' }}>
                  {user.status === 'inactive' ? 'Inactive' : 'Active'}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/super-admin/users/edit/${user.id}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <Edit2 size={16} /> Edit Admin Details
            </button>
          </div>
        </div>

        {isClinicAdmin ? (
          /* Clean, dedicated view for Clinic Admin */
          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: PLUM, marginBottom: '16px', borderBottom: '2px solid #fce7f3', paddingBottom: '8px' }}>
                Admin Account Details
              </h2>
              <InfoRow icon={User} label="Full Name" value={user.fullName} />
              {user.username && <InfoRow icon={User} label="Username" value={user.username} />}
              <InfoRow icon={Mail} label="Email Address" value={user.email} />
              <InfoRow icon={Phone} label="Phone / Mobile" value={user.phoneNumber || user.phone} />
              <InfoRow icon={IdCard} label="National Identity Card (NIC)" value={user.nic} />
              <InfoRow
                icon={Clock}
                label="Last Logged In"
                value={user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
              />
              <InfoRow
                icon={Calendar}
                label="Member Since"
                value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              />
            </div>

            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: PLUM, marginBottom: '16px', borderBottom: '2px solid #fce7f3', paddingBottom: '8px' }}>
                Clinic Assignment & Status
              </h2>
              <InfoRow icon={Building2} label="Assigned Clinic" value={user.clinicName || 'Not assigned'} />
              <InfoRow icon={MapPin} label="Clinic Location" value={user.clinicCity} />
              <InfoRow icon={Building2} label="Clinic Code" value={user.clinicRegistrationNo} />
              <InfoRow icon={Shield} label="Account Status" value={user.status === 'inactive' ? 'Inactive' : 'Active'} />
            </div>
          </div>
        ) : (
          /* General view for other roles */
          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: PLUM, marginBottom: '12px', borderBottom: '2px solid #fce7f3', paddingBottom: '6px' }}>Personal Details</h2>
              <InfoRow icon={Mail} label="Email Address" value={user.email} />
              <InfoRow icon={Phone} label="Phone / Mobile" value={user.phoneNumber || user.phone} />
              <InfoRow icon={IdCard} label="National Identity Card (NIC)" value={user.nic} />
              <InfoRow icon={MapPin} label="Home Address" value={user.address} />
              <InfoRow icon={Calendar} label="Date of Birth" value={user.dateOfBirth || user.date_of_birth} />
              <InfoRow icon={Clock} label="Last Logged In" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'} />
              <InfoRow icon={User} label="Member Since" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
            </div>

            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: PLUM, marginBottom: '12px', borderBottom: '2px solid #fce7f3', paddingBottom: '6px' }}>Clinic & Job Assignment</h2>
              <InfoRow icon={Building2} label="Assigned Clinic" value={user.clinicName || 'Not assigned'} />
              <InfoRow icon={Building2} label="Clinic Location" value={user.clinicCity} />
              <InfoRow icon={Building2} label="Clinic Registration No." value={user.clinicRegistrationNo} />
              
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: PLUM, margin: '24px 0 12px', borderBottom: '2px solid #fce7f3', paddingBottom: '6px' }}>Professional Profile</h2>
              <InfoRow icon={Briefcase} label="Designation / Position" value={user.position || ''} />
              <InfoRow icon={Briefcase} label="Department" value={user.department || ''} />
              <InfoRow icon={Users} label="Qualifications" value={
                Array.isArray(user.staffQualifications) && user.staffQualifications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    {user.staffQualifications.map((q, idx) => (
                      <div key={q.id || idx} style={{ fontSize: '13px', color: PLUM }}>
                        • {q.qualification_title}
                        {q.document_url && (
                          <a href={q.document_url} target="_blank" rel="noreferrer" style={{ marginLeft: '8px', color: PINK, fontSize: '12px', textDecoration: 'underline' }}>
                            View Doc
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  user.qualifications || '—'
                )
              } />
              {['doctor', 'nurse', 'midwife'].includes(user.role) && (
                <>
                  <InfoRow icon={Stethoscope} label="License Number" value={user.licenseNumber} />
                  <InfoRow icon={Calendar} label="Professional Start Date" value={user.professionalStartDate ? new Date(user.professionalStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} />
                  <InfoRow icon={Clock} label="Years of Experience (Calculated)" value={user.yearsOfExperience !== null && user.yearsOfExperience !== undefined && user.yearsOfExperience !== '' ? `${user.yearsOfExperience} years` : ''} />
                </>
              )}
              <InfoRow icon={Globe} label="Languages" value={user.languages} />
            </div>

            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: PLUM, marginBottom: '12px', borderBottom: '2px solid #fce7f3', paddingBottom: '6px' }}>Biography</h2>
              <div style={{ 
                padding: '16px', 
                background: '#fdf2f8', 
                borderRadius: '12px', 
                border: '1px solid #fbcfe8',
                color: PLUM,
                fontSize: '14px',
                lineHeight: '1.6',
                fontStyle: user.bio ? 'normal' : 'italic',
                marginBottom: '24px'
              }}>
                {user.bio || 'No biography written yet.'}
              </div>

              <h2 style={{ fontSize: '16px', fontWeight: '600', color: PLUM, marginBottom: '12px', borderBottom: '2px solid #fce7f3', paddingBottom: '6px' }}>Emergency Contact</h2>
              <InfoRow icon={Heart} label="Contact Person" value={user.emergencyName} />
              <InfoRow icon={Phone} label="Contact Phone" value={user.emergencyPhone} />
              <InfoRow icon={User} label="Relationship" value={user.emergencyRelation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUser;

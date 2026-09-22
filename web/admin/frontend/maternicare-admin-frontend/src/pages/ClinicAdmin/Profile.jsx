import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Edit2,
  Save,
  X,
  Lock,
  LogOut,
  ShieldAlert,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, changePassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, refreshSession } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const buildProfileState = () => ({
    name: user?.fullName || user?.full_name || 'Clinic Admin',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phoneNumber || user?.phone || '',
    nic: user?.nic || '',
    joinDate: (user?.createdAt || user?.created_at)
      ? new Date(user.createdAt || user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A',
  });

  const [profileData, setProfileData] = useState(buildProfileState);
  const [originalData, setOriginalData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const nextState = buildProfileState();
    setProfileData(nextState);
    setOriginalData(nextState);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword()) {
      toast.error('Please fix the errors in password form');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData.name.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!profileData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        fullName: profileData.name,
        username: profileData.username,
        email: profileData.email,
        phone: profileData.phone,
        nic: profileData.nic,
      });
      await refreshSession();
      setOriginalData(profileData);
      setIsEditing(false);
      toast.success('Personal profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    toast.info('Changes discarded');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div style={{
      padding: '24px',
      background: `linear-gradient(135deg, ${COLORS.bgPink50} 0%, ${COLORS.bgPink100} 100%)`,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '8px' }}>
              My Profile
            </h1>
            <p style={{ color: COLORS.textPink800, fontSize: '14px' }}>
              Manage your personal administrative profile details and security
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setOriginalData(profileData);
                  setIsEditing(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink800})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  boxShadow: `0 4px 12px rgba(219,39,119,0.25)`
                }}
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: 'white',
                    color: COLORS.textPink800,
                    border: `2px solid ${COLORS.bgPink200}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: `linear-gradient(135deg, #10B981, #059669)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'all 0.3s'
                  }}
                >
                  {isLoading ? (
                    <div style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  ) : (
                    <Save size={18} />
                  )}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Profile Info Container */}
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Card Summary Banner */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(131,24,67,0.05)',
          border: `1px solid ${COLORS.bgPink200}`,
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '36px',
            fontWeight: 'bold',
            boxShadow: '0 8px 16px rgba(131,24,67,0.1)'
          }}>
            {profileData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: COLORS.textPink900, margin: '0 0 4px' }}>
              {profileData.name}
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                background: COLORS.bgPink100,
                color: COLORS.textPink900,
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                Clinic Administrator
              </span>
              <span style={{ fontSize: '13px', color: COLORS.textPink800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Registered: {profileData.joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Details Form Panel */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(131,24,67,0.05)',
          border: `1px solid ${COLORS.bgPink200}`
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '24px', borderBottom: `2px solid ${COLORS.bgPink50}`, paddingBottom: '8px' }}>
            Personal Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${COLORS.bgPink200}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <p style={{ fontSize: '15px', color: COLORS.textPink900, margin: 0, fontWeight: '600' }}>{profileData.name}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${COLORS.bgPink200}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <p style={{ fontSize: '15px', color: COLORS.textPink900, margin: 0 }}>@{profileData.username}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${COLORS.bgPink200}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <p style={{ fontSize: '15px', color: COLORS.textPink900, margin: 0 }}>{profileData.email}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${COLORS.bgPink200}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <p style={{ fontSize: '15px', color: COLORS.textPink900, margin: 0 }}>{profileData.phone || 'N/A'}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                NIC Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="nic"
                  value={profileData.nic}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${COLORS.bgPink200}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <p style={{ fontSize: '15px', color: COLORS.textPink900, margin: 0 }}>{profileData.nic || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password / Security Panel */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(131,24,67,0.05)',
          border: `1px solid ${COLORS.bgPink200}`
        }}>
          
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '24px', borderBottom: `2px solid ${COLORS.bgPink50}`, paddingBottom: '8px' }}>
            Security Settings
          </h3>

          {!showChangePassword ? (
            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'white',
                border: `2px solid ${COLORS.textPink600}`,
                borderRadius: '12px',
                cursor: 'pointer',
                color: COLORS.textPink600,
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              <Lock size={16} />
              Change Account Password
            </button>
          ) : (
            <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: COLORS.textPink900, margin: 0 }}>Update Password</h4>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '6px', display: 'block' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${passwordErrors.currentPassword ? '#EF4444' : COLORS.bgPink200}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {passwordErrors.currentPassword && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', marginBlockEnd: 0 }}>{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '6px', display: 'block' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${passwordErrors.newPassword ? '#EF4444' : COLORS.bgPink200}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {passwordErrors.newPassword && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', marginBlockEnd: 0 }}>{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '6px', display: 'block' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${passwordErrors.confirmPassword ? '#EF4444' : COLORS.bgPink200}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {passwordErrors.confirmPassword && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', marginBlockEnd: 0 }}>{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    style={{
                      padding: '10px 20px',
                      background: 'white',
                      border: `2px solid ${COLORS.bgPink200}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={isPasswordLoading}
                    style={{
                      padding: '10px 20px',
                      background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink800})`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isPasswordLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '13px',
                      opacity: isPasswordLoading ? 0.7 : 1
                    }}
                  >
                    {isPasswordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout Account */}
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#FEE2E2',
              color: '#DC2626',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FECACA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FEE2E2';
            }}
          >
            <LogOut size={18} />
            Logout Account
          </button>
        </div>

      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Profile;
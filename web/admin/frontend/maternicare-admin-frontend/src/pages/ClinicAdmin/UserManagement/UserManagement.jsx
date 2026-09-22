import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Users, UserCheck, Stethoscope, Baby, Shield, ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { deleteClinicUser, getClinicUsers, updateClinicUser } from '../../../services/userService';
import { calculateYearsOfExperience } from '../../../utils/dateUtils';
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

const UserManagement = () => {
  const navigate = useNavigate();
  const { currentClinic, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const loadUsers = async () => {
    if (!currentClinic?.id) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getClinicUsers({
        clinicId: currentClinic.id,
        includeAll: true,
      });

      const liveUsers = (response || []).map((user) => ({
        id: user.id || user.user_id,
        name: user.fullName || user.username || user.full_name || 'Staff Member',
        username: user.username || user.email,
        role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown',
        email: user.email,
        phone: user.phoneNumber || user.phone || 'N/A',
        status: String(user.status || 'active').toLowerCase(),
        lastLogin: user.lastLogin || user.last_login || null,
        clinic_id: user.clinicId || user.clinic_id,
        licenseNumber: user.licenseNumber || user.license_number || '',
        qualifications: user.qualifications || '',
        qualificationDoc: user.qualificationDoc || user.qualification_doc || '',
        professionalStartDate: user.professionalStartDate || user.professional_start_date || null,
        yearsOfExperience: user.yearsOfExperience ?? calculateYearsOfExperience(user.professionalStartDate || user.professional_start_date) ?? '',
      }));

      setUsers(liveUsers);
    } catch (error) {
      console.error('Failed to load users', error);
      toast.error(error.message || 'Failed to load users from database');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentClinic]);

  // Handle instant Status Toggle Switch (Active <-> Inactive)
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setTogglingId(user.id);

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );

    try {
      await updateClinicUser(user.id, { status: newStatus });
      toast.success(`Status for ${user.name} changed to ${newStatus.toUpperCase()}`);
    } catch (error) {
      // Rollback on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u))
      );
      toast.error(error.message || 'Failed to update user status in database');
    } finally {
      setTogglingId(null);
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle Real Database Deletion
  const handleDeleteUser = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action is permanent.`)) {
      deleteClinicUser(id)
        .then(() => {
          setUsers((prev) => prev.filter((user) => user.id !== id));
          toast.success(`Staff member ${name} deleted successfully`);
        })
        .catch((error) => {
          toast.error(error.message || 'Unable to delete staff member from database');
        });
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'doctor': return '#10B981';
      case 'midwife': return '#8B5CF6';
      case 'nurse': return '#3B82F6';
      case 'admin': return '#EF4444';
      default: return COLORS.textPink600;
    }
  };

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'doctor': return <Stethoscope size={14} />;
      case 'midwife': return <Baby size={14} />;
      case 'nurse': return <Users size={14} />;
      case 'admin': return <Shield size={14} />;
      default: return <Users size={14} />;
    }
  };

  const getRoleBadgeStyle = (role) => {
    const color = getRoleColor(role);
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      background: `${color}15`,
      color: color,
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
    };
  };

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const totalDoctors = users.filter((u) => u.role === 'Doctor').length;
  const totalNurses = users.filter((u) => u.role === 'Nurse').length;
  const totalMidwives = users.filter((u) => u.role === 'Midwife').length;

  // ── Early return: no VIEW_STAFF permission ────────────────────────────────
  if (!hasPermission('VIEW_STAFF')) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: 'white', padding: '48px 64px', borderRadius: '24px', border: `1px solid #fbcfe8`, boxShadow: '0 4px 24px rgba(131,24,67,0.06)' }}>
          <ShieldX size={48} color="#db2777" />
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#831843', margin: 0 }}>Access Restricted</h2>
          <p style={{ color: '#9d174d', fontSize: '14px', margin: 0 }}>You do not have permission to view staff members.<br />Contact your Super Admin to enable this access.</p>
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
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '8px' }}>
          Staff Management
        </h1>
        <p style={{ color: COLORS.textPink800, fontSize: '14px' }}>
          Manage staff members for {currentClinic?.clinic_name || 'your clinic'}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px 20px',
          border: `1px solid ${COLORS.bgPink200}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: `${COLORS.textPink600}15`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={20} color={COLORS.textPink600} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.textPink900 }}>{totalUsers}</div>
              <div style={{ fontSize: '12px', color: COLORS.textPink800 }}>Total Staff</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px 20px',
          border: `1px solid ${COLORS.bgPink200}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#10b98115',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserCheck size={20} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{activeUsers}</div>
              <div style={{ fontSize: '12px', color: COLORS.textPink800 }}>Active Staff</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px 20px',
          border: `1px solid ${COLORS.bgPink200}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#10B98115',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Stethoscope size={20} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>{totalDoctors}</div>
              <div style={{ fontSize: '12px', color: COLORS.textPink800 }}>Doctors</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px 20px',
          border: `1px solid ${COLORS.bgPink200}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#3B82F615',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={20} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3B82F6' }}>{totalNurses}</div>
              <div style={{ fontSize: '12px', color: COLORS.textPink800 }}>Nurses</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px 20px',
          border: `1px solid ${COLORS.bgPink200}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#8B5CF615',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Baby size={20} color="#8B5CF6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B5CF6' }}>{totalMidwives}</div>
              <div style={{ fontSize: '12px', color: COLORS.textPink800 }}>Midwives</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter and Add Button Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: COLORS.textPink200,
              }}
            />
            <input
              type="text"
              placeholder="Search by username, email, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: `1px solid ${COLORS.bgPink200}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s',
                backgroundColor: 'white',
              }}
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: '10px 16px',
              border: `1px solid ${COLORS.bgPink200}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white',
              color: COLORS.textPink800,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            <option value="all">All Roles</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="midwife">Midwife</option>
          </select>
        </div>

        {/* Add User Button — only if ADD_STAFF permitted */}
        {hasPermission('ADD_STAFF') && (
        <button
          onClick={() => navigate('/users/add')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink800})`,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s',
            boxShadow: `0 4px 12px rgba(219,39,119,0.25)`,
          }}
        >
          <Plus size={18} />
          Add New Staff
        </button>
        )}
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflowX: 'auto',
        border: `1px solid ${COLORS.bgPink200}`,
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '850px',
        }}>
          <thead>
            <tr style={{
              background: COLORS.bgPink50,
              borderBottom: `1px solid ${COLORS.bgPink200}`,
            }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>#</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>USER / NAME</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>ROLE</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>EMAIL</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>STATUS (ACTIVE / INACTIVE)</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>LAST LOGIN</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: COLORS.textPink800 }}>
                  Loading staff from Supabase database...
                </td>
              </tr>
            ) : currentUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: COLORS.textPink800 }}>
                  No staff members found matching your search.
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user.id} style={{
                  borderBottom: `1px solid ${COLORS.bgPink100}`,
                  transition: 'background 0.3s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = COLORS.bgPink50}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '16px', fontSize: '14px', color: COLORS.textPink800 }}>
                    {user.id}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}cc)`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: COLORS.textPink900, fontSize: '14px' }}>
                          {user.name}
                        </div>
                        {user.username && user.username !== user.name && (
                          <div style={{ fontSize: '11px', color: COLORS.textPink800, opacity: 0.8 }}>
                            @{user.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={getRoleBadgeStyle(user.role)}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: COLORS.textPink800 }}>
                    {user.email}
                  </td>

                  {/* Status Toggle — read-only for midwives (SPHM-managed); otherwise gated by EDIT_STAFF */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {user.role === 'Midwife' ? (
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#8B5CF6', background: '#8B5CF615', padding: '4px 10px', borderRadius: '12px' }}>
                          Managed by SPHM
                        </span>
                      ) : hasPermission('EDIT_STAFF') ? (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user)}
                        disabled={togglingId === user.id}
                        title={`Click to switch status to ${user.status === 'active' ? 'Inactive' : 'Active'}`}
                        style={{
                          position: 'relative',
                          width: '46px',
                          height: '24px',
                          borderRadius: '12px',
                          background: user.status === 'active' ? '#10B981' : '#9CA3AF',
                          border: 'none',
                          cursor: togglingId === user.id ? 'wait' : 'pointer',
                          transition: 'background 0.3s ease',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'white',
                          transform: user.status === 'active' ? 'translateX(22px)' : 'translateX(0px)',
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }} />
                      </button>
                      ) : (
                        <div style={{ width: '46px', height: '24px', borderRadius: '12px', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShieldX size={12} color="#9CA3AF" />
                        </div>
                      )}
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: user.status === 'active' ? '#10B981' : '#6B7280',
                        textTransform: 'capitalize',
                      }}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>

                  {/* REQUIREMENT 5: Last Login Timestamp */}
                  <td style={{ padding: '16px', fontSize: '13px', color: COLORS.textPink800, fontWeight: '500' }}>
                    {formatTimestamp(user.lastLogin)}
                  </td>

                  {/* View / Edit / Delete — gated by permissions */}
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      {/* View Button */}
                      <button
                        onClick={() => navigate(`/users/view/${user.id}`)}
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', borderRadius: '6px', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        title="View Staff Member Details"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Edit Button — hidden for Midwives (SPHM-managed), otherwise gated by EDIT_STAFF */}
                      {user.role !== 'Midwife' && hasPermission('EDIT_STAFF') && (
                      <button
                        onClick={() => navigate(`/users/edit/${user.id}`)}
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textPink600, borderRadius: '6px', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = COLORS.bgPink100}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        title="Edit Staff Member Information"
                      >
                        <Edit2 size={18} />
                      </button>
                      )}

                      {/* Delete Button — hidden for Midwives (SPHM-managed), otherwise gated by DELETE_STAFF */}
                      {user.role !== 'Midwife' && hasPermission('DELETE_STAFF') && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '6px', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        title="Delete Staff Member from Database"
                      >
                        <Trash2 size={18} />
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${COLORS.bgPink200}`,
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ fontSize: '14px', color: COLORS.textPink800 }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${COLORS.bgPink200}`,
                  background: 'white',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentPage === 1 ? COLORS.bgPink200 : COLORS.textPink800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    padding: '6px 12px',
                    border: currentPage === i + 1 ? 'none' : `1px solid ${COLORS.bgPink200}`,
                    background: currentPage === i + 1 ? COLORS.textPink600 : 'white',
                    color: currentPage === i + 1 ? 'white' : COLORS.textPink800,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: currentPage === i + 1 ? '600' : '400',
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${COLORS.bgPink200}`,
                  background: 'white',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  color: currentPage === totalPages ? COLORS.bgPink200 : COLORS.textPink800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
import React, { useState, useEffect } from 'react';
import {
  Search, Eye, Edit2, ChevronLeft, ChevronRight,
  UserCheck, Shield, Building2, UserX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteClinicUser, getAllUsers, updateClinicUser } from '../../../services/userService';
import { getClinics } from '../../../services/clinicService';
import toast from 'react-hot-toast';

const getClinicId = (clinic) => clinic?.clinic_id ?? clinic?.id;

const PLUM = '#831843';
const PINK = '#db2777';

const formatLastLogin = (lastLogin) => {
  if (!lastLogin || lastLogin === 'N/A') return 'Never';
  const date = new Date(lastLogin);
  if (isNaN(date.getTime())) return 'Never';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClinic, setFilterClinic] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        clinicId: filterClinic !== 'all' ? filterClinic : undefined,
        includeAll: true,
        roles: ['CLINIC_ADMIN']
      });

      const clinicAdminsOnly = (response || [])
        .filter((user) => (user.role || '').toLowerCase() === 'clinic_admin')
        .map((user) => ({
          id: user.id,
          name: user.fullName,
          role: user.role,
          email: user.email,
          phone: user.phoneNumber || 'N/A',
          status: user.status || 'active',
          lastLogin: user.lastLogin || null,
          clinicId: user.clinicId,
          clinicName: user.clinicName || '—',
          clinicCity: user.clinicCity || '',
        }));

      setUsers(clinicAdminsOnly);
    } catch (error) {
      toast.error(error.message || 'Failed to load clinic admins');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClinics()
      .then((data) => setClinics(data || []))
      .catch(() => setClinics([]));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [filterClinic]);

  const handleToggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
    try {
      await updateClinicUser(id, { status: newStatus });
      setUsers(users.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
      toast.success(`Clinic Admin status updated to ${newStatus === 'active' ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.clinicName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  const totalClinicAdmins = users.length;
  const activeClinicAdmins = users.filter((u) => u.status === 'active').length;
  const inactiveClinicAdmins = users.filter((u) => u.status === 'inactive').length;

  return (
    <div style={{ padding: '0', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: PLUM, marginBottom: '8px' }}>
          Clinic Admin Management
        </h1>
        <p style={{ color: '#db2777', fontSize: '14px', fontWeight: '500' }}>
          Manage clinic administrators across all MaterniCare clinics
        </p>
      </div>

      {/* Retain strictly 3 summary cards: Clinic Admins, Active, Inactive */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Clinic Admins', value: totalClinicAdmins, color: '#F59E0B', icon: Shield },
          { label: 'Active', value: activeClinicAdmins, color: '#10b981', icon: UserCheck },
          { label: 'Inactive', value: inactiveClinicAdmins, color: '#ef4444', icon: UserX },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #fbcfe8', boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', background: `${stat.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={22} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: '#9d174d', fontWeight: '600' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#db2777' }} />
            <input
              type="text"
              placeholder="Search clinic admins..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px 12px 10px 40px', border: '2px solid #fbcfe8', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <select value={filterClinic} onChange={(e) => { setFilterClinic(e.target.value); setCurrentPage(1); }} style={{ padding: '10px 16px', border: '2px solid #fbcfe8', borderRadius: '12px', fontSize: '14px', background: 'white', outline: 'none', color: '#831843', fontWeight: '500' }}>
            <option value="all">All Clinics</option>
            {clinics.map((clinic) => (
              <option key={getClinicId(clinic)} value={getClinicId(clinic)}>{clinic.clinic_name} ({clinic.city || clinic.district})</option>
            ))}
          </select>

          {/* Retain Filter by Status */}
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} style={{ padding: '10px 16px', border: '2px solid #fbcfe8', borderRadius: '12px', fontSize: '14px', background: 'white', outline: 'none', color: '#831843', fontWeight: '500' }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* User Data Table */}
      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #fbcfe8', boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9d174d', fontWeight: '500' }}>Loading clinic admins...</div>
        ) : currentUsers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9d174d', fontWeight: '500' }}>No clinic admins found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fdf2f8', borderBottom: '1px solid #fbcfe8' }}>
                {['Admin Name', 'Clinic', 'Contact', 'Status Toggle', 'Last Login', 'Actions'].map((header) => (
                  <th key={header} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#831843', textTransform: 'uppercase' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => {
                const isInactive = user.status === 'inactive';
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #fbcfe8', opacity: isInactive ? 0.75 : 1 }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: PLUM }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#9d174d' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#831843', fontWeight: '500' }}>
                        <Building2 size={14} color="#db2777" />
                        <span>{user.clinicName}</span>
                      </div>
                      {user.clinicCity && <div style={{ fontSize: '11px', color: '#9d174d', marginLeft: '20px' }}>{user.clinicCity}</div>}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#831843' }}>{user.phone}</td>
                    {/* Status Toggle Switch */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.status)}
                        title={`Click to switch status to ${isInactive ? 'Active' : 'Inactive'}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: `1px solid ${isInactive ? '#fca5a5' : '#86efac'}`,
                          background: isInactive ? '#fef2f2' : '#f0fdf4',
                          color: isInactive ? '#ef4444' : '#16a34a',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isInactive ? '#ef4444' : '#16a34a'
                        }} />
                        {isInactive ? 'Inactive' : 'Active'}
                      </button>
                    </td>
                    {/* Last Login Timestamp */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#831843', fontWeight: '500' }}>
                      {formatLastLogin(user.lastLogin)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => navigate(`/super-admin/users/view/${user.id}`)} style={{ padding: '6px 12px', background: '#fce7f3', border: '1px solid #fbcfe8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: PLUM }} title="View User Details">
                          <Eye size={15} color={PLUM} /> View
                        </button>
                        <button onClick={() => navigate(`/super-admin/users/edit/${user.id}`)} style={{ padding: '6px 12px', background: '#fbcfe8', border: '1px solid #fbcfe8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: PLUM }} title="Edit Clinic Admin Details">
                          <Edit2 size={15} color={PLUM} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} style={{ padding: '8px 12px', border: '1px solid #fbcfe8', borderRadius: '8px', background: '#fce7f3', color: '#db2777', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '14px', color: '#831843', fontWeight: '500' }}>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} style={{ padding: '8px 12px', border: '1px solid #fbcfe8', borderRadius: '8px', background: '#fce7f3', color: '#db2777', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

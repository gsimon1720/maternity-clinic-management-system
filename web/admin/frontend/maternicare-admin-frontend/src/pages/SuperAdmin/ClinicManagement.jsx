import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Building2, MapPin, Hash, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClinics, updateClinic, deleteClinic } from '../../services/clinicService';

const getClinicId = (clinic) => clinic?.clinic_id ?? clinic?.id;

const ClinicManagement = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadClinics = async () => {
    try {
      setLoading(true);
      const data = await getClinics();
      setClinics(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load clinics');
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const filteredClinics = clinics.filter(clinic =>
    clinic.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (clinic.clinic_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (clinic.district || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleClinicStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
    try {
      await updateClinic(id, { status: newStatus });
      setClinics(clinics.map(c => getClinicId(c) === id ? { ...c, status: newStatus } : c));
      toast.success(`Clinic status updated to ${newStatus === 'active' ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error(error.message || 'Unable to update clinic status');
    }
  };

  const handleDeleteClinic = async (clinic) => {
    const id = getClinicId(clinic);
    if (!id) {
      toast.error('Invalid clinic ID');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete "${clinic.clinic_name}"? This action cannot be undone.`)) {
      try {
        await deleteClinic(id);
        setClinics(prev => prev.filter(c => getClinicId(c) !== id));
        toast.success(`Clinic "${clinic.clinic_name}" deleted permanently.`);
      } catch (error) {
        toast.error(error.message || 'Unable to delete clinic');
      }
    }
  };

  return (
    <div style={{ padding: '0px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#831843' }}>Clinic Management</h1>
          <p style={{ color: '#db2777', marginTop: '4px', fontSize: '14px' }}>Manage all clinics across Sri Lanka</p>
        </div>
        <button
          onClick={() => navigate('/super-admin/clinics/add')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #db2777, #831843)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(219, 39, 119, 0.2)'
          }}
        >
          <Plus size={18} />
          Add New Clinic
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#db2777' }} />
          <input
            type="text"
            placeholder="Search by clinic name, code or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 40px', border: '2px solid #fbcfe8', borderRadius: '12px', outline: 'none', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Clinics Grid */}
      {loading ? (
        <p style={{ color: '#9d174d' }}>Loading clinics from database...</p>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {filteredClinics.map((clinic) => {
          const isInactive = clinic.status === 'inactive';
          return (
            <div
              key={getClinicId(clinic)}
              onClick={() => navigate(`/super-admin/clinics/view/${getClinicId(clinic)}`)}
              style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(131,24,67,0.04)',
                border: '1px solid #fbcfe8',
                cursor: 'pointer',
                transition: 'all 0.3s',
                opacity: isInactive ? 0.75 : 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -12px rgba(131,24,67,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(131,24,67,0.04)';
              }}
            >
              {/* Header Color Bar */}
              <div style={{
                height: '6px',
                background: isInactive ? '#9ca3af' : '#db2777'
              }} />
              
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: '#fdf2f8',
                      border: '1px solid #fbcfe8',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Building2 size={24} color="#db2777" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#831843' }}>{clinic.clinic_name}</h3>
                      <p style={{ fontSize: '12px', color: '#9d174d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Hash size={12} /> Code: {clinic.clinic_code}
                      </p>
                    </div>
                  </div>
                  {/* Status Toggle Switch */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleClinicStatus(getClinicId(clinic), clinic.status);
                    }}
                    title={`Click to ${isInactive ? 'activate' : 'deactivate'} clinic`}
                    style={{
                      display: 'flex',
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
                </div>

                {/* Location & Registration Info */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <MapPin size={14} color="#db2777" />
                    <span style={{ fontSize: '13px', color: '#831843' }}><strong>District:</strong> {clinic.district}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <MapPin size={14} color="#db2777" />
                    <span style={{ fontSize: '13px', color: '#831843' }}><strong>Province:</strong> {clinic.province}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="#db2777" />
                    <span style={{ fontSize: '13px', color: '#831843' }}>
                      <strong>Registered:</strong> {clinic.created_at ? new Date(clinic.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '12px',
                  background: '#fdf2f8',
                  border: '1px solid #fbcfe8',
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#db2777' }}>{clinic.total_doctors || 0}</div>
                    <div style={{ fontSize: '10px', color: '#9d174d', fontWeight: '500' }}>Doctors</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#8B5CF6' }}>{clinic.total_midwives || 0}</div>
                    <div style={{ fontSize: '10px', color: '#9d174d', fontWeight: '500' }}>Midwives</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3B82F6' }}>{clinic.total_nurses || 0}</div>
                    <div style={{ fontSize: '10px', color: '#9d174d', fontWeight: '500' }}>Nurses</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>{clinic.total_patients || 0}</div>
                    <div style={{ fontSize: '10px', color: '#9d174d', fontWeight: '500' }}>Patients</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/super-admin/clinics/view/${getClinicId(clinic)}`);
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px 4px',
                      background: '#fce7f3',
                      border: '1px solid #fbcfe8',
                      borderRadius: '10px',
                      color: '#db2777',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/super-admin/clinics/edit/${getClinicId(clinic)}`);
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px 4px',
                      background: '#fbcfe8',
                      border: '1px solid #fbcfe8',
                      borderRadius: '10px',
                      color: '#831843',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClinic(clinic);
                    }}
                    title="Delete clinic permanently"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px 4px',
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: '10px',
                      color: '#ef4444',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default ClinicManagement;
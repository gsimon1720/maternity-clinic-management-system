import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Map,
  Layers,
  Calendar,
  Edit2,
  Save,
  X,
  Activity,
  ShieldCheck,
  ShieldX,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { updateClinic } from '../../services/clinicService';
import { getAreas } from '../../services/areaService';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const ClinicInformation = () => {
  const { currentClinic, refreshSession, hasPermission } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(false);
  const [areas, setAreas] = useState([]);

  const [clinicInfo, setClinicInfo] = useState({
    clinic_name: '',
    clinic_code: '',
    district: '',
    province: '',
    status: 'active',
    created_at: '',
  });

  const [originalInfo, setOriginalInfo] = useState({});

  const loadAreas = async () => {
    if (!currentClinic?.id) return;
    try {
      setAreasLoading(true);
      const res = await getAreas(currentClinic.id);
      if (res?.data) {
        setAreas(res.data);
      } else if (Array.isArray(res)) {
        setAreas(res);
      }
    } catch (err) {
      console.error('Failed to load clinic areas & zones:', err);
    } finally {
      setAreasLoading(false);
    }
  };

  useEffect(() => {
    if (!currentClinic) return;

    const mapped = {
      clinic_name: currentClinic.clinic_name || currentClinic.clinicName || '',
      clinic_code: currentClinic.clinic_code || currentClinic.clinicCode || '',
      district: currentClinic.district || '',
      province: currentClinic.province || '',
      status: String(currentClinic.status || 'active').toLowerCase(),
      created_at: currentClinic.created_at || currentClinic.createdAt || '',
    };

    setClinicInfo(mapped);
    setOriginalInfo(mapped);
    loadAreas();
  }, [currentClinic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClinicInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentClinic?.id) {
      toast.error('Clinic information is not available');
      return;
    }

    if (!clinicInfo.clinic_name?.trim()) {
      toast.error('Clinic Name is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateClinic(currentClinic.id, {
        clinic_name: clinicInfo.clinic_name,
        clinic_code: clinicInfo.clinic_code,
        district: clinicInfo.district,
        province: clinicInfo.province,
        status: clinicInfo.status,
      });
      await refreshSession();
      setOriginalInfo(clinicInfo);
      setIsEditing(false);
      toast.success('Clinic information updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update clinic information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setClinicInfo(originalInfo);
    setIsEditing(false);
    toast.info('Changes discarded');
  };

  const formatEstablishedDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={24} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.textPink900 }}>
                  Clinic Profile
                </h1>
                <p style={{ color: COLORS.textPink800, fontSize: '14px', marginTop: '4px' }}>
                  View clinic details, assigned areas, and active zones
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {!isEditing ? (
              hasPermission('EDIT_CLINIC_INFO') ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px rgba(219,39,119,0.35)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px rgba(219,39,119,0.25)`;
                }}
              >
                <Edit2 size={18} />
                Edit Information
              </button>
              ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#F3F4F6', borderRadius: '12px', color: '#6B7280', fontSize: '14px', fontWeight: '600' }}>
                <ShieldX size={16} />
                Editing Restricted
              </div>
              )
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = COLORS.bgPink50;
                    e.currentTarget.style.borderColor = COLORS.textPink600;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = COLORS.bgPink200;
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

      {/* Main Clinic Profile Form Panel */}
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(131,24,67,0.05)',
          border: `1px solid ${COLORS.bgPink200}`
        }}>
          
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '24px', borderBottom: `2px solid ${COLORS.bgPink100}`, paddingBottom: '12px' }}>
            General Details
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                Clinic Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="clinic_name"
                  value={clinicInfo.clinic_name}
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
                <p style={{ fontSize: '16px', color: COLORS.textPink900, fontWeight: '600', margin: 0 }}>{clinicInfo.clinic_name}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                Clinic Code
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="clinic_code"
                  value={clinicInfo.clinic_code}
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
                <p style={{ fontSize: '16px', color: COLORS.textPink900, fontWeight: '600', margin: 0 }}>{clinicInfo.clinic_code}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                District
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="district"
                  value={clinicInfo.district}
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
                <p style={{ fontSize: '16px', color: COLORS.textPink900, margin: 0 }}>{clinicInfo.district || 'N/A'}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                Province
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="province"
                  value={clinicInfo.province}
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
                <p style={{ fontSize: '16px', color: COLORS.textPink900, margin: 0 }}>{clinicInfo.province || 'N/A'}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                Clinic Account Status
              </label>
              {isEditing ? (
                <select
                  name="status"
                  value={clinicInfo.status}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${COLORS.bgPink200}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  background: clinicInfo.status === 'active' ? '#ECFDF5' : '#FEF2F2',
                  color: clinicInfo.status === 'active' ? '#10B981' : '#EF4444'
                }}>
                  ● {clinicInfo.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink800, marginBottom: '8px', display: 'block' }}>
                Registration Date
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.textPink900, fontSize: '15px', fontWeight: '500' }}>
                <Calendar size={16} color={COLORS.textPink600} />
                <span>{formatEstablishedDate(clinicInfo.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Hierarchy of Assigned Areas & Zones */}
          <div style={{ marginTop: '36px', borderTop: `2px solid ${COLORS.bgPink100}`, paddingTop: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.textPink900, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Map size={20} color={COLORS.textPink600} />
                Assigned Areas & Zones Hierarchy
              </h3>
              <button
                type="button"
                onClick={loadAreas}
                disabled={areasLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: COLORS.textPink800,
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} className={areasLoading ? 'spin-animation' : ''} />
                Reload Hierarchy
              </button>
            </div>

            <div style={{
              background: '#F9FAFB',
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${COLORS.bgPink200}`
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Building2 size={18} color={COLORS.textPink900} />
                <span style={{ fontWeight: 'bold', color: COLORS.textPink900, fontSize: '15px' }}>
                  {clinicInfo.clinic_name || 'Main Clinic'}
                </span>
              </div>

              {areasLoading ? (
                <div style={{ padding: '20px', color: COLORS.textPink800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', border: `2px solid ${COLORS.bgPink200}`, borderTopColor: COLORS.textPink600, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  <span>Loading assigned areas & zones...</span>
                </div>
              ) : areas.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, paddingLeft: '24px' }}>
                  No Areas or Zones currently assigned to this clinic.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '12px' }}>
                  {areas.map((area, areaIdx) => (
                    <div key={area.area_id || areaIdx} style={{ position: 'relative', paddingLeft: '20px', borderLeft: `2px dashed ${COLORS.bgPink200}` }}>
                      {/* Connection horizontal line */}
                      <div style={{ position: 'absolute', left: 0, top: '10px', width: '16px', height: '2px', background: COLORS.bgPink200 }} />
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <MapPin size={16} color={COLORS.textPink600} />
                        <span style={{ fontWeight: '700', color: COLORS.textPink900, fontSize: '14px' }}>
                          {area.area_name}
                        </span>
                        {area.area_code && (
                          <span style={{ fontSize: '11px', background: COLORS.bgPink100, color: COLORS.textPink800, padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                            Code: {area.area_code}
                          </span>
                        )}
                      </div>

                      <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(!area.zones || area.zones.length === 0) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '13px', paddingLeft: '16px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 0, top: '8px', width: '12px', height: '2px', background: '#E5E7EB' }} />
                            <span>No Zones in this Area</span>
                          </div>
                        ) : (
                          area.zones.map((zone, zoneIdx) => (
                            <div key={zone.zone_id || zoneIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: 0, top: '9px', width: '12px', height: '2px', background: COLORS.bgPink200 }} />
                              <Layers size={13} color="#3B82F6" />
                              <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>
                                {zone.zone_name}
                              </span>
                              {zone.zone_code && (
                                <span style={{ fontSize: '10px', color: '#6B7280', background: '#F3F4F6', padding: '1px 6px', borderRadius: '4px' }}>
                                  {zone.zone_code}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .spin-animation {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default ClinicInformation;
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, RefreshCw, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import request from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const STAFF_ROLES = ['DOCTOR', 'NURSE', 'MIDWIFE'];

const ROLE_META = {
  DOCTOR: { label: 'Doctor', color: '#10B981', bg: '#ECFDF5' },
  NURSE: { label: 'Nurse', color: '#3B82F6', bg: '#EFF6FF' },
  MIDWIFE: { label: 'Midwife', color: '#8B5CF6', bg: '#F5F3FF' },
};

const ClinicAdminPermissions = () => {
  const { currentClinic } = useAuth();
  const [selectedRole, setSelectedRole] = useState('DOCTOR');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [grouped, setGrouped] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  const loadPermissions = async (role) => {
    setLoading(true);
    try {
      const res = await request(`/permissions/clinic-staff-permissions?staff_role=${role}`);
      const data = res || {};
      setGrouped(data.grouped || {});
      const initExpanded = {};
      Object.keys(data.grouped || {}).forEach(m => { initExpanded[m] = true; });
      setExpandedModules(initExpanded);
    } catch (err) {
      toast.error('Failed to load staff permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPermissions(selectedRole); }, [selectedRole]);

  const handleToggle = async (perm) => {
    setSaving(prev => ({ ...prev, [perm.permission_id]: true }));
    try {
      await request('/permissions/clinic-staff-permissions', {
        method: 'PUT',
        body: JSON.stringify({
          staff_role: selectedRole,
          permission_id: perm.permission_id,
          is_enabled: !perm.is_enabled,
        }),
      });

      setGrouped(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(mod => {
          next[mod] = next[mod].map(p =>
            p.permission_id === perm.permission_id ? { ...p, is_enabled: !p.is_enabled } : p
          );
        });
        return next;
      });
      toast.success(`${perm.permission_name.replace(/_/g, ' ')} ${!perm.is_enabled ? 'enabled' : 'disabled'} for ${ROLE_META[selectedRole]?.label || selectedRole}`);
    } catch (err) {
      toast.error('Failed to update permission');
    } finally {
      setSaving(prev => ({ ...prev, [perm.permission_id]: false }));
    }
  };

  const toggleModule = (mod) => {
    setExpandedModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const roleMeta = ROLE_META[selectedRole] || { label: selectedRole, color: COLORS.textPink600, bg: COLORS.bgPink50 };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: '44px', height: '44px', background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} color="white" />
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: COLORS.textPink900, margin: 0 }}>
                Staff Access Permissions
              </h1>
            </div>
            <p style={{ color: COLORS.textPink800, fontSize: '14px', margin: 0, paddingLeft: '56px' }}>
              Manage module access for your clinic's staff — {currentClinic?.clinic_name || 'Your Clinic'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadPermissions(selectedRole)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', background: 'white',
              border: `1px solid ${COLORS.bgPink200}`, borderRadius: '10px',
              color: COLORS.textPink800, fontWeight: '600', fontSize: '13px', cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Role Selector */}
      <div style={{ background: 'white', borderRadius: '18px', padding: '20px 24px', marginBottom: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 2px 8px rgba(131,24,67,0.04)' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink900, marginBottom: '14px', margin: '0 0 14px' }}>
          Select Staff Role to Manage Permissions
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {STAFF_ROLES.map(role => {
            const meta = ROLE_META[role];
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${meta.color}` : `2px solid #E5E7EB`,
                  background: isSelected ? meta.bg : 'white',
                  color: isSelected ? meta.color : '#6B7280',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <UserCheck size={16} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Role Banner */}
      <div style={{ background: `linear-gradient(135deg, ${roleMeta.color}, ${COLORS.textPink900})`, borderRadius: '16px', padding: '18px 24px', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldCheck size={22} color="white" />
        <div>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>
            Permissions for: {roleMeta.label} — {currentClinic?.clinic_name || 'Your Clinic'}
          </p>
          <p style={{ margin: '2px 0 0', opacity: 0.85, fontSize: '12px' }}>
            These settings apply only to {roleMeta.label}s in your clinic. Other clinics may have different settings.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ width: '36px', height: '36px', border: `3px solid ${COLORS.bgPink200}`, borderTopColor: COLORS.textPink600, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: COLORS.textPink800, fontSize: '14px' }}>Loading {roleMeta.label} permissions...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(grouped).map(([moduleName, perms]) => (
            <div key={moduleName} style={{ background: 'white', borderRadius: '18px', border: `1px solid ${COLORS.bgPink200}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(131,24,67,0.04)' }}>
              <button
                type="button"
                onClick={() => toggleModule(moduleName)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: COLORS.bgPink50, border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontWeight: '700', fontSize: '15px', color: COLORS.textPink900 }}>{moduleName}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: COLORS.textPink800 }}>
                    {perms.filter(p => p.is_enabled).length}/{perms.length} enabled
                  </span>
                  {expandedModules[moduleName] ? <ChevronUp size={16} color={COLORS.textPink600} /> : <ChevronDown size={16} color={COLORS.textPink600} />}
                </div>
              </button>

              {expandedModules[moduleName] && (
                <div style={{ padding: '8px 24px 16px' }}>
                  {perms.map((perm, idx) => (
                    <div key={perm.permission_id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 0',
                      borderBottom: idx < perms.length - 1 ? `1px solid ${COLORS.bgPink50}` : 'none'
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', color: COLORS.textPink900, fontSize: '14px' }}>
                          {perm.permission_name.replace(/_/g, ' ')}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>{perm.description}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: perm.is_enabled ? '#10B981' : '#EF4444' }}>
                          {perm.is_enabled ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggle(perm)}
                          disabled={saving[perm.permission_id]}
                          style={{
                            width: '52px', height: '28px',
                            borderRadius: '14px',
                            background: perm.is_enabled ? roleMeta.color : '#E5E7EB',
                            border: 'none',
                            cursor: saving[perm.permission_id] ? 'not-allowed' : 'pointer',
                            position: 'relative',
                            transition: 'background 0.25s',
                            opacity: saving[perm.permission_id] ? 0.6 : 1
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            width: '20px', height: '20px',
                            borderRadius: '50%', background: 'white',
                            top: '4px',
                            left: perm.is_enabled ? '28px' : '4px',
                            transition: 'left 0.25s',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                          }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ClinicAdminPermissions;

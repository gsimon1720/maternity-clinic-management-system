import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldX, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
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

const SuperAdminPermissions = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [grouped, setGrouped] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const res = await request('/permissions/role-permissions');
      const data = res || {};
      setGrouped(data.grouped || {});
      // expand all modules by default
      const initExpanded = {};
      Object.keys(data.grouped || {}).forEach(m => { initExpanded[m] = true; });
      setExpandedModules(initExpanded);
    } catch (err) {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPermissions(); }, []);

  const handleToggle = async (perm) => {
    setSaving(prev => ({ ...prev, [perm.permission_id]: true }));
    try {
      await request('/permissions/role-permissions', {
        method: 'PUT',
        body: JSON.stringify({
          permission_id: perm.permission_id,
          is_enabled: !perm.is_enabled,
        }),
      });

      // Update local state
      setGrouped(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(mod => {
          next[mod] = next[mod].map(p =>
            p.permission_id === perm.permission_id ? { ...p, is_enabled: !p.is_enabled } : p
          );
        });
        return next;
      });
      toast.success(`Permission ${!perm.is_enabled ? 'enabled' : 'disabled'} for CLINIC_ADMIN`);
    } catch (err) {
      toast.error('Failed to update permission');
    } finally {
      setSaving(prev => ({ ...prev, [perm.permission_id]: false }));
    }
  };

  const toggleModule = (mod) => {
    setExpandedModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

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
                Clinic Admin Access Permissions
              </h1>
            </div>
            <p style={{ color: COLORS.textPink800, fontSize: '14px', margin: 0, paddingLeft: '56px' }}>
              Control which system modules Clinic Admins can access. Changes take effect on their next login.
            </p>
          </div>
          <button
            type="button"
            onClick={loadPermissions}
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

      {/* Role Banner */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`, borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldCheck size={24} color="white" />
        <div>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '16px' }}>Managing Permissions for: CLINIC_ADMIN</p>
          <p style={{ margin: '2px 0 0', opacity: 0.85, fontSize: '13px' }}>
            Toggle module access for all Clinic Administrators in the system
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ width: '36px', height: '36px', border: `3px solid ${COLORS.bgPink200}`, borderTopColor: COLORS.textPink600, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: COLORS.textPink800, fontSize: '14px' }}>Loading permission matrix...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(grouped).map(([moduleName, perms]) => (
            <div key={moduleName} style={{ background: 'white', borderRadius: '18px', border: `1px solid ${COLORS.bgPink200}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(131,24,67,0.04)' }}>
              {/* Module header */}
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
                          {perm.is_enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggle(perm)}
                          disabled={saving[perm.permission_id]}
                          style={{
                            width: '52px', height: '28px',
                            borderRadius: '14px',
                            background: perm.is_enabled ? '#10B981' : '#E5E7EB',
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

export default SuperAdminPermissions;

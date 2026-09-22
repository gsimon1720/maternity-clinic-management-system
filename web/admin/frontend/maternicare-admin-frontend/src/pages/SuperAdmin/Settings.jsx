import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Lock, Globe, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PLUM = '#831843';
const PINK = '#db2777';

const SuperAdminSettings = () => {
  const [systemName, setSystemName] = useState('MaterniCare Network');
  const [autoBackup, setAutoBackup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const handleSave = () => {
    toast.success('System settings saved successfully!');
  };

  return (
    <div style={{ padding: '0', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: PLUM, marginBottom: '8px' }}>
          Superadmin System Settings
        </h1>
        <p style={{ color: PINK, fontSize: '14px', fontWeight: '500' }}>
          Global configuration and administration controls for the MaterniCare platform
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Network & System Config */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #fbcfe8', boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Globe size={20} color={PINK} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: PLUM }}>Platform Configuration</h2>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: PLUM, marginBottom: '6px' }}>
              System Title
            </label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #fbcfe8', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #fbcfe8' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: PLUM }}>Maintenance Mode</div>
              <div style={{ fontSize: '12px', color: '#9d174d' }}>Temporarily disable non-admin access</div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Database & Security */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #fbcfe8', boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Shield size={20} color={PINK} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: PLUM }}>Security & Data Policy</h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #fbcfe8' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: PLUM }}>Daily Automatic Backups</div>
              <div style={{ fontSize: '12px', color: '#9d174d' }}>Automated daily snapshot to Supabase storage</div>
            </div>
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: PLUM }}>Security Event Notifications</div>
              <div style={{ fontSize: '12px', color: '#9d174d' }}>Receive alerts on failed admin logins</div>
            </div>
            <input
              type="checkbox"
              checked={securityAlerts}
              onChange={(e) => setSecurityAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          style={{ padding: '12px 28px', background: `linear-gradient(135deg, ${PINK}, ${PLUM})`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(219,39,119,0.25)' }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SuperAdminSettings;

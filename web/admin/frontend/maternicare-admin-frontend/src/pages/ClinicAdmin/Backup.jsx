import React, { useState } from 'react';
import { Database, Download, ShieldCheck, Clock, FileText, CheckCircle, RefreshCw } from 'lucide-react';
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

const Backup = () => {
  const [downloading, setDownloading] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const handleDownloadBackup = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/backup/download', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate backup export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `maternicare_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      const timestamp = new Date().toLocaleString();
      setLastBackup(timestamp);
      toast.success('Database backup downloaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Error downloading backup');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: `linear-gradient(135deg, ${COLORS.bgPink50}, ${COLORS.bgPink100})`, minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '8px' }}>
          Database Backup & Recovery
        </h1>
        <p style={{ color: COLORS.textPink800, fontSize: '14px' }}>
          Generate and download complete database snapshots of your clinic data and user records
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Download Action Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '54px', height: '54px', background: COLORS.bgPink100, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={28} color={COLORS.textPink600} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.textPink900 }}>Export Snapshot</h2>
              <p style={{ fontSize: '13px', color: COLORS.textPink800 }}>Complete JSON data snapshot</p>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: COLORS.textPink800, lineHeight: '1.6', marginBottom: '24px' }}>
            Downloading a backup exports all registered clinics, staff members, patients, geographic areas, and zones into a structured JSON backup document.
          </p>

          <button
            onClick={handleDownloadBackup}
            disabled={downloading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 24px',
              background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: downloading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(219,39,119,0.3)',
              opacity: downloading ? 0.7 : 1,
            }}
          >
            <Download size={20} />
            {downloading ? 'Preparing Backup...' : 'Download Database Backup'}
          </button>

          {lastBackup && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981', fontWeight: '500' }}>
              <CheckCircle size={14} /> Last export downloaded on {lastBackup}
            </div>
          )}
        </div>

        {/* Info & Status Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.03)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color={COLORS.textPink600} /> Backup Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 16px', background: COLORS.bgPink50, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={18} color={COLORS.textPink600} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textPink900 }}>Supported Format</div>
                <div style={{ fontSize: '12px', color: COLORS.textPink800 }}>Standard JSON format compatible with all database tools</div>
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: COLORS.bgPink50, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={18} color={COLORS.textPink600} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textPink900 }}>Encrypted Transmission</div>
                <div style={{ fontSize: '12px', color: COLORS.textPink800 }}>Downloads via SSL/TLS encrypted connection</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;
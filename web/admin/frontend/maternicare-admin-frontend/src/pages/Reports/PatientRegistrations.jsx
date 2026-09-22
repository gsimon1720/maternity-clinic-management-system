import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Download, Printer, UserPlus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

import request from '../../services/api';

const PatientRegistrations = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const res = await request('/reports/registrations');
        if (res) {
          setPatients(res);
        }
      } catch (err) {
        toast.error('Failed to load patient registrations');
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  const handleExport = () => {
    toast.success('Patient Registrations Report exported successfully!');
  };

  const totalRegistrations = patients.length;
  const totalActive = patients.filter(p => p.status === 'active').length;

  return (
    <div style={{ padding: '24px', background: `linear-gradient(135deg, ${COLORS.bgPink50}, ${COLORS.bgPink100})`, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button onClick={() => navigate('/reports')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: `1px solid ${COLORS.bgPink200}`, borderRadius: '10px', cursor: 'pointer', color: COLORS.textPink800 }}>
          <ArrowLeft size={18} /> Back to Reports
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: `1px solid ${COLORS.bgPink200}`, borderRadius: '8px', cursor: 'pointer' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: `1px solid ${COLORS.bgPink200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Activity size={28} color={COLORS.textPink600} />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.textPink900 }}>Patient Registrations Report</h1>
            <p style={{ color: COLORS.textPink800 }}>Detailed patient enrollment records</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: COLORS.bgPink50, padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.textPink600 }}>{totalRegistrations}</div>
            <div style={{ color: COLORS.textPink800, fontSize: '13px' }}>Total Registered Patients</div>
          </div>
          <div style={{ background: COLORS.bgPink50, padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>{totalActive}</div>
            <div style={{ color: COLORS.textPink800, fontSize: '13px' }}>Active Status Patients</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.bgPink200}` }}>
                <th style={{ padding: '12px', textAlign: 'left', color: COLORS.textPink800 }}>Patient Name</th>
                <th style={{ padding: '12px', textAlign: 'left', color: COLORS.textPink800 }}>NIC / ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: COLORS.textPink800 }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', color: COLORS.textPink800 }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'center', color: COLORS.textPink800 }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', color: COLORS.textPink800 }}>Date Registered</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: COLORS.textPink800 }}>Loading patients...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: COLORS.textPink800 }}>No patient records found</td></tr>
              ) : patients.map((item, index) => (
                <tr key={index} style={{ borderBottom: `1px solid ${COLORS.bgPink100}` }}>
                  <td style={{ padding: '12px', fontWeight: '500', color: COLORS.textPink900 }}>{item.name}</td>
                  <td style={{ padding: '12px', color: COLORS.textPink800 }}>{item.nic}</td>
                  <td style={{ padding: '12px', color: COLORS.textPink800 }}>{item.email}</td>
                  <td style={{ padding: '12px', color: COLORS.textPink800 }}>{item.phone}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 10px', background: '#D1FAE5', color: '#065F46', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: COLORS.textPink800 }}>{item.dateRegistered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistrations;
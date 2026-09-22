import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, Printer, Mail } from 'lucide-react';
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

const MonthlySummary = () => {
  const navigate = useNavigate();
  const [data, setData] = React.useState({ totalPatients: 0, activePatients: 0, totalStaff: 0, month: '', generatedAt: '' });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const res = await request('/reports/clinic-summary');
        if (res) {
          setData(res);
        }
      } catch (err) {
        toast.error('Failed to load summary report');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const handleExport = () => {
    toast.success('Monthly Summary Report exported successfully!');
  };

  return (
    <div style={{ padding: '24px', background: `linear-gradient(135deg, ${COLORS.bgPink50}, ${COLORS.bgPink100})`, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button
          onClick={() => navigate('/reports')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'white',
            border: `1px solid ${COLORS.bgPink200}`,
            borderRadius: '10px',
            cursor: 'pointer',
            color: COLORS.textPink800,
            transition: 'all 0.3s'
          }}
        >
          <ArrowLeft size={18} /> Back to Reports
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: `1px solid ${COLORS.bgPink200}`, borderRadius: '8px', cursor: 'pointer' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: `1px solid ${COLORS.bgPink200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Calendar size={28} color={COLORS.textPink600} />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.textPink900 }}>Monthly Summary Report</h1>
            <p style={{ color: COLORS.textPink800 }}>{data.month || 'Current Month'} • Generated on {data.generatedAt || 'Today'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: COLORS.bgPink50, padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.textPink600 }}>{data.totalPatients}</div>
            <div style={{ color: COLORS.textPink800 }}>Total Patients</div>
          </div>
          <div style={{ background: COLORS.bgPink50, padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>{data.activePatients}</div>
            <div style={{ color: COLORS.textPink800 }}>Active Patients</div>
          </div>
          <div style={{ background: COLORS.bgPink50, padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B5CF6' }}>{data.totalStaff}</div>
            <div style={{ color: COLORS.textPink800 }}>Assigned Healthcare Staff</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
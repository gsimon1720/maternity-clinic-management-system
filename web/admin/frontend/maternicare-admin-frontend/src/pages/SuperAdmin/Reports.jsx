import React, { useState, useEffect } from 'react';
import {
  FileText, MapPin, Building2, Users, Stethoscope, Baby, Activity, Filter, RefreshCw
} from 'lucide-react';
import request from '../../services/api';
import toast from 'react-hot-toast';

const PLUM = '#831843';
const PINK = '#db2777';

const SuperAdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ provinces: [], districts: [], summary: {} });
  const [activeTab, setActiveTab] = useState('provinces');
  const [filterQuery, setFilterQuery] = useState('');

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await request('/reports/province-district');
      if (res) {
        setData(res);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredProvinces = (data.provinces || []).filter(p =>
    p.province.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredDistricts = (data.districts || []).filter(d =>
    d.district.toLowerCase().includes(filterQuery.toLowerCase()) ||
    d.province.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '0', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: PLUM, marginBottom: '8px' }}>
            National Reports & Analytics
          </h1>
          <p style={{ color: PINK, fontSize: '14px', fontWeight: '500' }}>
            Aggregated database reports grouped by Provinces and Districts
          </p>
        </div>
        <button
          onClick={loadReports}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'white', border: '1px solid #fbcfe8', borderRadius: '12px', color: PLUM, cursor: 'pointer', fontWeight: '600' }}
        >
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Clinics', value: data.summary.totalClinics || 0, icon: Building2, color: PLUM },
          { label: 'Provinces Covered', value: data.summary.totalProvinces || 0, icon: MapPin, color: PINK },
          { label: 'Districts Covered', value: data.summary.totalDistricts || 0, icon: MapPin, color: '#8B5CF6' },
        ].map((stat, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #fbcfe8', boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', background: `${stat.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={22} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#9d174d', fontWeight: '500' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher & Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
          <button
            onClick={() => setActiveTab('provinces')}
            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'provinces' ? `linear-gradient(135deg, ${PINK}, ${PLUM})` : 'transparent', color: activeTab === 'provinces' ? 'white' : PLUM, fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
          >
            Province Breakdown
          </button>
          <button
            onClick={() => setActiveTab('districts')}
            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'districts' ? `linear-gradient(135deg, ${PINK}, ${PLUM})` : 'transparent', color: activeTab === 'districts' ? 'white' : PLUM, fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
          >
            District Breakdown
          </button>
        </div>

        <input
          type="text"
          placeholder={`Filter by ${activeTab === 'provinces' ? 'Province' : 'District or Province'}...`}
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          style={{ padding: '10px 16px', border: '1px solid #fbcfe8', borderRadius: '12px', fontSize: '14px', outline: 'none', minWidth: '260px' }}
        />
      </div>

      {/* Data Table */}
      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #fbcfe8', boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9d174d', fontWeight: '500' }}>Loading real report metrics from database...</div>
        ) : activeTab === 'provinces' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fdf2f8', borderBottom: '1px solid #fbcfe8' }}>
                {['Province Name', 'Total Clinics', 'Districts Covered', 'Doctors', 'Midwives', 'Nurses', 'Total Patients'].map((h) => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: PLUM, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProvinces.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#9d174d' }}>No province records found</td></tr>
              ) : filteredProvinces.map((prov, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #fbcfe8' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: PLUM }}>{prov.province}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '500', color: PINK }}>{prov.totalClinics}</td>
                  <td style={{ padding: '14px 16px', color: '#831843' }}>{prov.districtCount} ({prov.districts.join(', ')})</td>
                  <td style={{ padding: '14px 16px', color: '#10B981', fontWeight: '600' }}>{prov.totalDoctors}</td>
                  <td style={{ padding: '14px 16px', color: '#8B5CF6', fontWeight: '600' }}>{prov.totalMidwives}</td>
                  <td style={{ padding: '14px 16px', color: '#3B82F6', fontWeight: '600' }}>{prov.totalNurses}</td>
                  <td style={{ padding: '14px 16px', color: PINK, fontWeight: '600' }}>{prov.totalPatients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fdf2f8', borderBottom: '1px solid #fbcfe8' }}>
                {['District Name', 'Province', 'Total Clinics', 'Doctors', 'Midwives', 'Nurses', 'Total Patients'].map((h) => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: PLUM, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDistricts.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#9d174d' }}>No district records found</td></tr>
              ) : filteredDistricts.map((dist, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #fbcfe8' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: PLUM }}>{dist.district}</td>
                  <td style={{ padding: '14px 16px', color: '#9d174d' }}>{dist.province}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '500', color: PINK }}>{dist.totalClinics}</td>
                  <td style={{ padding: '14px 16px', color: '#10B981', fontWeight: '600' }}>{dist.totalDoctors}</td>
                  <td style={{ padding: '14px 16px', color: '#8B5CF6', fontWeight: '600' }}>{dist.totalMidwives}</td>
                  <td style={{ padding: '14px 16px', color: '#3B82F6', fontWeight: '600' }}>{dist.totalNurses}</td>
                  <td style={{ padding: '14px 16px', color: PINK, fontWeight: '600' }}>{dist.totalPatients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SuperAdminReports;

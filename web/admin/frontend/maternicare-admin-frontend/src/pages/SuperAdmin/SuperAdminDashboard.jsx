import React, { useState, useEffect } from 'react';
import { 
  Building2, CheckCircle2, XCircle, MapPin, 
  RefreshCw, Plus, ArrowRight, BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import request from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const PROVINCE_BAR_COLORS = ['#db2777', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];
const DISTRICT_BAR_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#db2777', '#F59E0B', '#06B6D4', '#64748B'];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalClinics: 0,
    activeClinics: 0,
    inactiveClinics: 0,
  });

  const [clinicsByProvince, setClinicsByProvince] = useState([]);
  const [clinicsByDistrict, setClinicsByDistrict] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, clinicsRes] = await Promise.all([
        request('/reports/province-district'),
        request('/clinics')
      ]);

      const reportsData = reportsRes?.data || reportsRes || {};
      const clinicList = Array.isArray(clinicsRes) ? clinicsRes : [];

      const total = clinicList.length;
      const active = clinicList.filter(c => String(c.status || 'active').toLowerCase() === 'active').length;
      const inactive = clinicList.filter(c => String(c.status || 'active').toLowerCase() === 'inactive').length;

      setStats({
        totalClinics: total,
        activeClinics: active,
        inactiveClinics: inactive,
      });

      if (reportsData?.provinces) {
        const mappedProvinces = reportsData.provinces.map(p => ({
          province: p.province || 'Unassigned',
          totalClinics: p.totalClinics || 0,
        }));
        setClinicsByProvince(mappedProvinces);
      }

      if (reportsData?.districts) {
        const mappedDistricts = reportsData.districts.map(d => ({
          district: d.district || 'Unassigned',
          totalClinics: d.totalClinics || 0,
        }));
        setClinicsByDistrict(mappedDistricts);
      }
    } catch (err) {
      console.error('Failed to load SuperAdmin stats:', err);
      toast.error('Failed to load live clinic metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData().then(() => {
      toast.success('Dashboard metrics updated from live database!');
    });
  };

  return (
    <div style={{ padding: '24px', background: `linear-gradient(135deg, ${COLORS.bgPink50}, ${COLORS.bgPink100})`, minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '4px' }}>
            National Clinic Dashboard
          </h1>
          <p style={{ color: COLORS.textPink800, fontSize: '14px', margin: 0 }}>
            Live clinic distribution and management metrics across Sri Lanka
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'white',
            border: `1px solid ${COLORS.bgPink200}`,
            borderRadius: '12px',
            color: COLORS.textPink800,
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(131,24,67,0.05)'
          }}
        >
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${COLORS.bgPink200}`, borderTopColor: COLORS.textPink600, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: COLORS.textPink800, fontSize: '14px' }}>Loading real-time clinic statistics from database...</p>
        </div>
      ) : (
        <div>
          {/* Key Metrics Cards (Only Clinic Management) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {/* Total Clinics Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.04)' }}>
              <div>
                <p style={{ color: COLORS.textPink800, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>Total Clinics</p>
                <h2 style={{ fontSize: '34px', fontWeight: 'bold', color: COLORS.textPink900, marginTop: '4px', marginBottom: 0 }}>{stats.totalClinics}</h2>
                <p style={{ color: COLORS.textPink600, fontSize: '12px', marginTop: '6px', fontWeight: '500', margin: 0 }}>Registered Nationwide</p>
              </div>
              <div style={{ width: '52px', height: '52px', background: `${COLORS.textPink600}15`, border: `1px solid ${COLORS.bgPink200}`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={26} color={COLORS.textPink600} />
              </div>
            </div>

            {/* Active Clinics Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.04)' }}>
              <div>
                <p style={{ color: COLORS.textPink800, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>Active Clinics</p>
                <h2 style={{ fontSize: '34px', fontWeight: 'bold', color: '#10B981', marginTop: '4px', marginBottom: 0 }}>{stats.activeClinics}</h2>
                <p style={{ color: '#10B981', fontSize: '12px', marginTop: '6px', fontWeight: '500', margin: 0 }}>Fully Operational</p>
              </div>
              <div style={{ width: '52px', height: '52px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={26} color="#10B981" />
              </div>
            </div>

            {/* Inactive Clinics Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.04)' }}>
              <div>
                <p style={{ color: COLORS.textPink800, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>Inactive Clinics</p>
                <h2 style={{ fontSize: '34px', fontWeight: 'bold', color: '#EF4444', marginTop: '4px', marginBottom: 0 }}>{stats.inactiveClinics}</h2>
                <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '6px', fontWeight: '500', margin: 0 }}>Currently Suspended</p>
              </div>
              <div style={{ width: '52px', height: '52px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={26} color="#EF4444" />
              </div>
            </div>
          </div>

          {/* Bar Charts Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            
            {/* Chart 1: Clinics by Province (Bar Chart) */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <MapPin size={20} color={COLORS.textPink600} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: COLORS.textPink900, margin: 0 }}>
                    Clinics by Province
                  </h3>
                  <p style={{ fontSize: '12px', color: COLORS.textPink800, margin: '2px 0 0' }}>
                    Total registered clinics per province
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={clinicsByProvince}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="province" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: `1px solid ${COLORS.bgPink200}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalClinics" name="Total Clinics" radius={[6, 6, 0, 0]} barSize={32}>
                    {clinicsByProvince.map((entry, idx) => (
                      <Cell key={`prov-${idx}`} fill={PROVINCE_BAR_COLORS[idx % PROVINCE_BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Clinics by District (Bar Chart) */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <BarChart2 size={20} color="#3B82F6" />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: COLORS.textPink900, margin: 0 }}>
                    Clinics by District
                  </h3>
                  <p style={{ fontSize: '12px', color: COLORS.textPink800, margin: '2px 0 0' }}>
                    Total registered clinics per district
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={clinicsByDistrict}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="district" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: `1px solid ${COLORS.bgPink200}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalClinics" name="Total Clinics" radius={[6, 6, 0, 0]} barSize={32}>
                    {clinicsByDistrict.map((entry, idx) => (
                      <Cell key={`dist-${idx}`} fill={DISTRICT_BAR_COLORS[idx % DISTRICT_BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Quick Actions Panel */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.04)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: COLORS.textPink900, margin: '0 0 16px' }}>Clinic Operations Quick Actions</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/super-admin/clinics/add')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(219, 39, 119, 0.2)' }}
              >
                <Plus size={18} /> Add New Clinic
              </button>
              <button
                type="button"
                onClick={() => navigate('/super-admin/clinics')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'white', color: COLORS.textPink900, border: `1px solid ${COLORS.bgPink200}`, borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
              >
                Manage All Clinics <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SuperAdminDashboard;
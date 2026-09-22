import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  Activity,
  Building2,
  PieChart,
  BarChart as BarChartIcon,
  TrendingUp,
  RefreshCw,
  UserCheck,
  UserX,
  Calendar,
  Lock
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import StatCard from '../../components/DashboardCards/StatCard';
import toast from 'react-hot-toast';
import request from '../../services/api';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const CHART_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B'];

const ClinicAdminDashboard = () => {
  const { currentClinic, user } = useAuth();
  const [trendRange, setTrendRange] = useState('monthly');
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    activeVsInactive: [],
    staffDistribution: [],
    mostActiveStaff: [],
    userStatusByRole: [],
    registrationTrend: [],
    inactiveUsersByRole: [],
    summary: {
      totalStaff: 0,
      activeStaff: 0,
      inactiveStaff: 0
    }
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const clinicId = currentClinic?.id || currentClinic?.clinic_id;
      const params = new URLSearchParams();
      if (clinicId) params.set('clinic_id', clinicId);
      params.set('trendRange', trendRange);

      const res = await request(`/dashboard/stats?${params.toString()}`);
      if (res?.data) {
        setDashboardData(res.data);
      } else if (res) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      toast.error('Failed to load real-time dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentClinic, trendRange]);

  const handleRefresh = () => {
    loadDashboardData().then(() => {
      toast.success('Dashboard data refreshed from database!');
    });
  };

  // Top KPI Stats Cards
  const stats = [
    { title: 'Total Registered Staff', value: String(dashboardData.summary?.totalStaff || 0), icon: Users, color: 'pink', trend: 'up', trendValue: 'Roster Total' },
    { title: 'Active Accounts', value: String(dashboardData.summary?.activeStaff || 0), icon: UserCheck, color: 'success', trend: 'up', trendValue: 'System Enabled' },
    { title: 'Inactive Accounts', value: String(dashboardData.summary?.inactiveStaff || 0), icon: UserX, color: 'danger', trend: 'down', trendValue: 'System Disabled' },
  ];

  return (
    <div style={{
      padding: '24px',
      background: `linear-gradient(135deg, ${COLORS.bgPink50}, ${COLORS.bgPink100})`,
      minHeight: '100vh'
    }}>
      {/* Clinic Header - Welcome Card */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`,
        borderRadius: '24px',
        padding: '28px',
        marginBottom: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={28} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  {currentClinic?.clinic_name || 'MaterniCare Clinic'}
                </h1>
                <p style={{ opacity: 0.9, fontSize: '14px', margin: '4px 0 0' }}>
                  System Usage & Staff Activity Dashboard
                </p>
              </div>
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
                border: 'none',
                borderRadius: '12px',
                color: COLORS.textPink900,
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <RefreshCw size={16} /> Refresh Charts
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${COLORS.bgPink200}`, borderTopColor: COLORS.textPink600, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: COLORS.textPink800, fontSize: '14px' }}>Loading real-time database charts...</p>
        </div>
      ) : (
        <div>
          {/* Statistics Grid */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>

          {/* Charts Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
            
            {/* Chart 1: Active vs Inactive Users */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <PieChart size={18} color={COLORS.textPink600} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', margin: 0 }}>Active vs Inactive Users</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RePieChart>
                  <Pie
                    data={dashboardData.activeVsInactive}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dashboardData.activeVsInactive.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Staff Distribution by Role */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <PieChart size={18} color={COLORS.textPink600} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', margin: 0 }}>Staff Distribution by Role</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RePieChart>
                  <Pie
                    data={dashboardData.staffDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dashboardData.staffDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 3: Most Active Staff Members (Horizontal Bar Chart) */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <BarChartIcon size={18} color={COLORS.textPink600} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', margin: 0 }}>Most Active Staff Members</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dashboardData.mostActiveStaff} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="logins" fill="#8B5CF6" name="Total Logins" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 4: User Status by Role (Stacked Bar Chart) */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <BarChartIcon size={18} color={COLORS.textPink600} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', margin: 0 }}>User Status by Role</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dashboardData.userStatusByRole}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="role" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Active" stackId="statusStack" fill="#10B981" />
                  <Bar dataKey="Inactive" stackId="statusStack" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 5: Staff Registration Trend (Line Chart) */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.02)', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color={COLORS.textPink600} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', margin: 0 }}>Staff Registration Trend</h3>
                </div>
                <div style={{ display: 'flex', background: COLORS.bgPink50, borderRadius: '8px', padding: '3px', border: `1px solid ${COLORS.bgPink200}` }}>
                  {['daily', 'weekly', 'monthly'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTrendRange(mode)}
                      style={{
                        padding: '4px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        background: trendRange === mode ? COLORS.textPink600 : 'transparent',
                        color: trendRange === mode ? 'white' : COLORS.textPink800,
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dashboardData.registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="registrations" name="New Registrations" stroke={COLORS.textPink600} strokeWidth={2.5} dot={{ fill: COLORS.textPink600 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 6: Inactive Users by Role */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 4px 12px rgba(131,24,67,0.02)', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <PieChart size={18} color={COLORS.textPink600} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', margin: 0 }}>Inactive Users by Role</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RePieChart>
                  <Pie
                    data={dashboardData.inactiveUsersByRole}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dashboardData.inactiveUsersByRole.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ClinicAdminDashboard;
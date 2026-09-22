import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Clock,
  Activity,
  Timer,
  UserX,
  ShieldCheck,
  ShieldX,
  Download,
  Search,
  Calendar,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  XCircle,
  BarChart3,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { useAuth } from '../../hooks/useAuth';
import request from '../../services/api';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const TAB_CONFIGS = [
  { id: 'active-users', label: 'Active Users', icon: Users, description: 'Active vs. inactive staff accounts and permissions' },
  { id: 'last-login', label: 'Last Login', icon: Clock, description: 'Recent staff timestamps and idle account tracking' },
  { id: 'user-activity', label: 'User Activity', icon: Activity, description: 'Login frequency and staff engagement metrics' },
  { id: 'user-session', label: 'User Session & Duration', icon: Timer, description: 'Active time spent in system (daily/weekly/monthly)' },
  { id: 'inactive-users', label: 'Inactive Users', icon: UserX, description: 'Staff members idle for 30+ days or status disabled' },
  { id: 'account-status', label: 'Account Status', icon: ShieldCheck, description: 'Complete staff status roster and change log' },
];

const Reports = () => {
  const { currentClinic, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('active-users');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent' or 'oldest'
  const [daysThreshold, setDaysThreshold] = useState(30); // 30, 60, 90
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentClinic?.id) params.set('clinic_id', currentClinic.id);
      params.set('daysInactive', daysThreshold);

      const res = await request(`/reports/system-reports?${params.toString()}`);
      if (res?.data) {
        setReportData(res.data);
      } else if (res) {
        setReportData(res);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load system report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if the user has VIEW_REPORTS permission
    if (hasPermission('VIEW_REPORTS')) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [currentClinic, daysThreshold]);

  // Derived filtered staff records for active tab
  const getTabFilteredData = useMemo(() => {
    if (!reportData) return [];

    let list = [];
    switch (activeTab) {
      case 'active-users':
        list = reportData.activeUsersReport?.activeUsersList || [];
        break;
      case 'last-login':
        list = [...(reportData.lastLoginReport?.staff || [])];
        if (sortOrder === 'recent') {
          list.sort((a, b) => (b.lastLogin ? new Date(b.lastLogin) : 0) - (a.lastLogin ? new Date(a.lastLogin) : 0));
        } else {
          list.sort((a, b) => (a.lastLogin ? new Date(a.lastLogin) : 0) - (b.lastLogin ? new Date(b.lastLogin) : 0));
        }
        break;
      case 'user-activity':
        list = [...(reportData.userActivityReport?.activityList || [])];
        if (startDate || endDate) {
          list = list.filter((s) => {
            if (!s.lastLogin) return false;
            const d = new Date(s.lastLogin);
            if (startDate && d < new Date(startDate)) return false;
            if (endDate && d > new Date(endDate)) return false;
            return true;
          });
        }
        break;
      case 'user-session':
        list = reportData.userSessionReport?.sessionList || [];
        break;
      case 'inactive-users':
        list = reportData.inactiveUserReport?.inactiveUsersList || [];
        break;
      case 'account-status':
        list = reportData.accountStatusReport?.statusRoster || [];
        break;
      default:
        list = [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.role?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [reportData, activeTab, searchQuery, sortOrder, startDate, endDate]);

  // PDF Export Engine
  const handleExportPDF = () => {
    if (!getTabFilteredData || getTabFilteredData.length === 0) {
      toast.error('No report data available to export');
      return;
    }

    const currentTabObj = TAB_CONFIGS.find((t) => t.id === activeTab);
    const reportTitle = `${currentTabObj?.label || 'System'} Report`;
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const nowStr = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

    // PDF Header Banner
    doc.setFillColor(131, 24, 67); // Plum
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MaterniCare System Reports', 14, 14);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${reportTitle} — ${currentClinic?.clinic_name || 'Clinic Administration'}`, 14, 22);

    // Timestamp & Clinic Context
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Generated on: ${nowStr}   |   Clinic: ${currentClinic?.clinic_name || 'Main Clinic'}`, 14, 37);

    // KPI Summary Banner
    let summaryText = '';
    if (activeTab === 'active-users') {
      summaryText = `Total Staff: ${reportData?.activeUsersReport?.totalStaff || 0}  |  Active Accounts: ${reportData?.activeUsersReport?.totalActive || 0}  |  Inactive Accounts: ${reportData?.activeUsersReport?.totalInactive || 0} (${reportData?.activeUsersReport?.activePercentage || 0}% Active)`;
    } else if (activeTab === 'last-login') {
      summaryText = `Recent Logins (<7d): ${reportData?.lastLoginReport?.recentLoginsCount || 0}  |  Stale/Never Logged In (>30d): ${reportData?.lastLoginReport?.staleLoginsCount || 0}`;
    } else if (activeTab === 'user-activity') {
      summaryText = `Total Logins: ${reportData?.userActivityReport?.totalLogins || 0}  |  Avg Logins/User: ${reportData?.userActivityReport?.avgLoginsPerUser || 0}  |  Top Active: ${reportData?.userActivityReport?.mostActiveUser?.name || 'N/A'}`;
    } else if (activeTab === 'user-session') {
      summaryText = `Total Hours Spent: ${reportData?.userSessionReport?.totalHoursSpent || 0} hrs  |  Total Sessions: ${reportData?.userSessionReport?.totalSessions || 0}  |  Avg Session: ${reportData?.userSessionReport?.avgSessionDuration || 0} mins`;
    } else if (activeTab === 'inactive-users') {
      summaryText = `Inactivity Threshold: ${daysThreshold} Days  |  Total Inactive/Idle Staff: ${reportData?.inactiveUserReport?.inactiveUserCount || 0}`;
    } else if (activeTab === 'account-status') {
      summaryText = `Total Roster: ${reportData?.accountStatusReport?.totalAccounts || 0}  |  Active: ${reportData?.accountStatusReport?.activeAccounts || 0}  |  Inactive: ${reportData?.accountStatusReport?.inactiveAccounts || 0}`;
    }

    doc.setFillColor(253, 242, 248);
    doc.roundedRect(14, 42, 182, 12, 2, 2, 'F');
    doc.setTextColor(131, 24, 67);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(summaryText, 18, 50);

    // Table Header & Rows
    let startY = 62;
    const tableData = getTabFilteredData;

    // Define columns per tab
    let cols = [];
    if (activeTab === 'active-users') {
      cols = [
        { header: 'Staff Name', key: 'name', width: 45 },
        { header: 'Role', key: 'role', width: 30 },
        { header: 'Email Address', key: 'email', width: 55 },
        { header: 'Last Login', key: 'lastLoginDate', width: 30 },
        { header: 'Access Status', key: 'status', width: 22 },
      ];
    } else if (activeTab === 'last-login') {
      cols = [
        { header: 'Staff Name', key: 'name', width: 45 },
        { header: 'Role', key: 'role', width: 30 },
        { header: 'Last Login Timestamp', key: 'lastLoginTime', width: 55 },
        { header: 'Days Since Login', key: 'daysSinceLastLogin', width: 30 },
        { header: 'Status', key: 'status', width: 22 },
      ];
    } else if (activeTab === 'user-activity') {
      cols = [
        { header: 'Staff Name', key: 'name', width: 45 },
        { header: 'Role', key: 'role', width: 30 },
        { header: 'Total Logins', key: 'loginCount', width: 30 },
        { header: 'Frequency', key: 'loginFrequency', width: 30 },
        { header: 'Last Active', key: 'lastLoginDate', width: 47 },
      ];
    } else if (activeTab === 'user-session') {
      cols = [
        { header: 'Staff Name', key: 'name', width: 40 },
        { header: 'Role', key: 'role', width: 25 },
        { header: 'Total Active Time', key: 'totalActiveDurationHours', width: 35 },
        { header: 'Total Sessions', key: 'totalSessions', width: 35 },
        { header: 'Avg Session (min)', key: 'avgSessionDurationMins', width: 47 },
      ];
    } else if (activeTab === 'inactive-users') {
      cols = [
        { header: 'Staff Name', key: 'name', width: 45 },
        { header: 'Role', key: 'role', width: 30 },
        { header: 'Account Status', key: 'status', width: 30 },
        { header: 'Last Successful Login', key: 'lastLoginDate', width: 47 },
        { header: 'Days Inactive', key: 'daysSinceLastLogin', width: 30 },
      ];
    } else {
      cols = [
        { header: 'Staff Name', key: 'name', width: 45 },
        { header: 'Role', key: 'role', width: 30 },
        { header: 'Email', key: 'email', width: 50 },
        { header: 'Account Status', key: 'status', width: 30 },
        { header: 'Created Date', key: 'registeredAt', width: 27 },
      ];
    }

    // Draw Table Headers
    doc.setFillColor(219, 39, 119); // Pink
    doc.rect(14, startY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');

    let currentX = 16;
    cols.forEach((col) => {
      doc.text(col.header, currentX, startY + 5.5);
      currentX += col.width;
    });

    startY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);

    tableData.forEach((row, idx) => {
      if (startY > 275) {
        doc.addPage();
        startY = 20;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(252, 231, 243);
        doc.rect(14, startY, 182, 7, 'F');
      }

      currentX = 16;
      cols.forEach((col) => {
        let val = '';
        if (col.key === 'daysSinceLastLogin') {
          val = row.daysSinceLastLogin !== null ? `${row.daysSinceLastLogin} days` : 'Never';
        } else if (col.key === 'totalActiveDurationHours') {
          val = `${row.totalActiveDurationHours} hrs`;
        } else {
          val = String(row[col.key] ?? 'N/A');
        }

        doc.text(val.substring(0, 24), currentX, startY + 5);
        currentX += col.width;
      });

      startY += 7;
    });

    // Page Numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`MaterniCare System Report  |  Page ${i} of ${totalPages}`, 14, 288);
    }

    doc.save(`${activeTab}_system_report_${Date.now()}.pdf`);
    toast.success(`${reportTitle} PDF downloaded successfully!`);
  };

  // ── No VIEW_REPORTS permission ────────────────────────────────────────────
  if (!hasPermission('VIEW_REPORTS')) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: 'white', padding: '48px 64px', borderRadius: '24px', border: '1px solid #fbcfe8', boxShadow: '0 4px 24px rgba(131,24,67,0.06)' }}>
          <ShieldX size={48} color="#db2777" />
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#831843', margin: 0 }}>Reports Access Restricted</h2>
          <p style={{ color: '#9d174d', fontSize: '14px', margin: 0 }}>You do not have permission to view system reports.<br />Contact your Super Admin to enable this access.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: `linear-gradient(135deg, ${COLORS.bgPink50}, ${COLORS.bgPink100})`, minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={28} color={COLORS.textPink600} />
            System Reports Hub
          </h1>
          <p style={{ color: COLORS.textPink800, fontSize: '14px', opacity: 0.9 }}>
            Live staff management, login activity, user session & account status metrics for {currentClinic?.clinic_name || 'your clinic'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={fetchReports}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: `1px solid ${COLORS.bgPink200}`, borderRadius: '12px', color: COLORS.textPink800, fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <RefreshCw size={16} /> Refresh Data
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={loading || !getTabFilteredData.length}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink900})`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '13px', cursor: loading || !getTabFilteredData.length ? 'not-allowed' : 'pointer', opacity: loading || !getTabFilteredData.length ? 0.7 : 1, boxShadow: '0 4px 12px rgba(131,24,67,0.15)' }}
          >
            <Download size={16} /> Download PDF Report
          </button>
        </div>
      </div>

      {/* System Reports Navigation Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {TAB_CONFIGS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                background: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                border: isActive ? `2px solid ${COLORS.textPink600}` : `1px solid ${COLORS.bgPink200}`,
                borderRadius: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 8px 20px rgba(219,39,119,0.12)' : 'none',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isActive ? `${COLORS.textPink600}15` : COLORS.bgPink100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={isActive ? COLORS.textPink600 : COLORS.textPink800} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: isActive ? '700' : '600', color: isActive ? COLORS.textPink900 : COLORS.textPink800, margin: 0 }}>
                  {tab.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Report Card Container */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '28px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 10px 25px -5px rgba(131,24,67,0.05)' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: '40px', height: '40px', border: `3px solid ${COLORS.bgPink200}`, borderTopColor: COLORS.textPink600, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: COLORS.textPink800, fontSize: '14px' }}>Loading live system report data from database...</p>
          </div>
        ) : (
          <div>

            {/* TAB 1: ACTIVE USERS REPORT */}
            {activeTab === 'active-users' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <KpiCard label="Total Staff Roster" value={reportData?.activeUsersReport?.totalStaff || 0} icon={Users} color="#3B82F6" />
                  <KpiCard label="Active Staff Accounts" value={reportData?.activeUsersReport?.totalActive || 0} icon={CheckCircle2} color="#10B981" />
                  <KpiCard label="Inactive Staff Accounts" value={reportData?.activeUsersReport?.totalInactive || 0} icon={XCircle} color="#EF4444" />
                  <KpiCard label="Active Ratio" value={`${reportData?.activeUsersReport?.activePercentage || 0}%`} icon={TrendingUp} color={COLORS.textPink600} />
                </div>

                {/* Ratio Bar */}
                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '20px', marginBottom: '24px', border: `1px solid ${COLORS.bgPink200}` }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '10px' }}>
                    Active vs. Inactive Staff Account Comparison
                  </h4>
                  <div style={{ height: '14px', borderRadius: '10px', background: '#EF4444', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${reportData?.activeUsersReport?.activePercentage || 0}%`, background: '#10B981', transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', fontWeight: '600' }}>
                    <span style={{ color: '#10B981' }}>🟢 Active Access ({reportData?.activeUsersReport?.totalActive || 0})</span>
                    <span style={{ color: '#EF4444' }}>🔴 Disabled Access ({reportData?.activeUsersReport?.totalInactive || 0})</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LAST LOGIN REPORT */}
            {activeTab === 'last-login' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <KpiCard label="Recent Logins (<7 days)" value={reportData?.lastLoginReport?.recentLoginsCount || 0} icon={Clock} color="#10B981" />
                  <KpiCard label="Stale / Idle (>30 days)" value={reportData?.lastLoginReport?.staleLoginsCount || 0} icon={Clock} color="#F59E0B" />
                  <KpiCard label="Never Logged In" value={reportData?.lastLoginReport?.neverLoggedInCount || 0} icon={UserX} color="#EF4444" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: COLORS.bgPink50, padding: '6px 14px', borderRadius: '10px', border: `1px solid ${COLORS.bgPink200}` }}>
                    <ArrowUpDown size={15} color={COLORS.textPink800} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textPink900 }}>Sort by:</span>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', color: COLORS.textPink600, cursor: 'pointer', outline: 'none' }}>
                      <option value="recent">Most Recent Login</option>
                      <option value="oldest">Oldest Login</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: USER ACTIVITY REPORT */}
            {activeTab === 'user-activity' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <KpiCard label="Total Staff Logins" value={reportData?.userActivityReport?.totalLogins || 0} icon={Activity} color={COLORS.textPink600} />
                  <KpiCard label="Average Logins per User" value={reportData?.userActivityReport?.avgLoginsPerUser || 0} icon={TrendingUp} color="#3B82F6" />
                  <KpiCard label="Top Active Staff Member" value={reportData?.userActivityReport?.mostActiveUser?.name || 'N/A'} icon={Users} color="#10B981" />
                </div>

                {/* Date Range Filter */}
                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', border: `1px solid ${COLORS.bgPink200}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} color={COLORS.textPink600} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textPink900 }}>Date Range Filter:</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: COLORS.textPink800, fontWeight: '500' }}>From:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid ${COLORS.bgPink200}`, fontSize: '13px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: COLORS.textPink800, fontWeight: '500' }}>To:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid ${COLORS.bgPink200}`, fontSize: '13px', outline: 'none' }} />
                  </div>
                  {(startDate || endDate) && (
                    <button type="button" onClick={() => { setStartDate(''); setEndDate(''); }} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: USER SESSION REPORT */}
            {activeTab === 'user-session' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <KpiCard label="Total System Hours Spent" value={`${reportData?.userSessionReport?.totalHoursSpent || 0} hrs`} icon={Timer} color={COLORS.textPink600} />
                  <KpiCard label="Total Active Sessions" value={reportData?.userSessionReport?.totalSessions || 0} icon={Activity} color="#8B5CF6" />
                  <KpiCard label="Average Session Duration" value={`${reportData?.userSessionReport?.avgSessionDuration || 0} mins`} icon={Clock} color="#10B981" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', background: COLORS.bgPink50, borderRadius: '10px', padding: '4px', border: `1px solid ${COLORS.bgPink200}` }}>
                    {['daily', 'weekly', 'monthly'].map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setTimeframe(tf)}
                        style={{
                          padding: '6px 14px',
                          border: 'none',
                          borderRadius: '8px',
                          background: timeframe === tf ? COLORS.textPink600 : 'transparent',
                          color: timeframe === tf ? 'white' : COLORS.textPink800,
                          fontWeight: '600',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          transition: 'all 0.2s',
                        }}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: INACTIVE USER REPORT */}
            {activeTab === 'inactive-users' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <KpiCard label="Inactive / Idle Staff Count" value={reportData?.inactiveUserReport?.inactiveUserCount || 0} icon={UserX} color="#EF4444" />
                  <KpiCard label="Selected Threshold" value={`${daysThreshold} Days Inactive`} icon={Calendar} color="#F59E0B" />
                </div>

                <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', border: `1px solid ${COLORS.bgPink200}` }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textPink900 }}>Configurable Inactivity Threshold:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[30, 60, 90].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setDaysThreshold(days)}
                        style={{
                          padding: '6px 14px',
                          border: `1px solid ${daysThreshold === days ? COLORS.textPink600 : COLORS.bgPink200}`,
                          borderRadius: '8px',
                          background: daysThreshold === days ? COLORS.textPink600 : 'white',
                          color: daysThreshold === days ? 'white' : COLORS.textPink800,
                          fontWeight: '600',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: ACCOUNT STATUS REPORT */}
            {activeTab === 'account-status' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <KpiCard label="Total Registered Roster" value={reportData?.accountStatusReport?.totalAccounts || 0} icon={Users} color="#3B82F6" />
                  <KpiCard label="Active Accounts" value={reportData?.accountStatusReport?.activeAccounts || 0} icon={CheckCircle2} color="#10B981" />
                  <KpiCard label="Inactive Accounts" value={reportData?.accountStatusReport?.inactiveAccounts || 0} icon={XCircle} color="#EF4444" />
                </div>
              </div>
            )}

            {/* Search Bar for Reports Table */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={16} color={COLORS.textPink800} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter staff by name, role, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 36px', border: `2px solid ${COLORS.bgPink200}`, borderRadius: '12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <span style={{ fontSize: '13px', color: COLORS.textPink800, fontWeight: '500' }}>
                Showing <strong>{getTabFilteredData.length}</strong> staff entries
              </span>
            </div>

            {/* Main Report Table */}
            <div style={{ overflowX: 'auto', border: `1px solid ${COLORS.bgPink200}`, borderRadius: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: COLORS.bgPink50, borderBottom: `2px solid ${COLORS.bgPink200}` }}>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Staff Member</th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Role</th>
                    
                    {activeTab === 'active-users' && (
                      <>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Email</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Last Login</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Status</th>
                      </>
                    )}

                    {activeTab === 'last-login' && (
                      <>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Last Login Timestamp</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Days Since Login</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Activity Warning</th>
                      </>
                    )}

                    {activeTab === 'user-activity' && (
                      <>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Total Logins</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Login Frequency</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Last Activity</th>
                      </>
                    )}

                    {activeTab === 'user-session' && (
                      <>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Total Active Duration</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Active Mins</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Total Sessions</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Avg Duration</th>
                      </>
                    )}

                    {activeTab === 'inactive-users' && (
                      <>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Account Status</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Last Successful Login</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Inactivity Period</th>
                      </>
                    )}

                    {activeTab === 'account-status' && (
                      <>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Contact Email</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Current Status</th>
                        <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: COLORS.textPink900, textTransform: 'uppercase' }}>Member Since</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {getTabFilteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: COLORS.textPink800, fontSize: '13px' }}>
                        No staff records match your criteria.
                      </td>
                    </tr>
                  ) : (
                    getTabFilteredData.map((staff, idx) => (
                      <tr key={staff.id || idx} style={{ borderBottom: `1px solid ${COLORS.bgPink100}`, background: idx % 2 === 1 ? COLORS.bgPink50 : 'white' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: COLORS.textPink900, margin: 0 }}>{staff.name}</p>
                          <span style={{ fontSize: '12px', color: COLORS.textPink800 }}>@{staff.username}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: COLORS.bgPink100, color: COLORS.textPink900 }}>
                            {staff.role}
                          </span>
                        </td>

                        {activeTab === 'active-users' && (
                          <>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink900 }}>{staff.email}</td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink800 }}>{staff.lastLoginDate}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <StatusBadge status={staff.status} />
                            </td>
                          </>
                        )}

                        {activeTab === 'last-login' && (
                          <>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink900 }}>{staff.lastLoginTime}</td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: COLORS.textPink900 }}>
                              {staff.daysSinceLastLogin !== null ? `${staff.daysSinceLastLogin} days` : 'Never'}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {staff.daysSinceLastLogin === null || staff.daysSinceLastLogin > 30 ? (
                                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: '#FEF2F2', color: '#EF4444' }}>⚠️ Idle / Stale</span>
                              ) : (
                                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: '#ECFDF5', color: '#10B981' }}>✓ Active Recently</span>
                              )}
                            </td>
                          </>
                        )}

                        {activeTab === 'user-activity' && (
                          <>
                            <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: COLORS.textPink900 }}>{staff.loginCount} logins</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', background: staff.loginFrequency === 'High' ? '#ECFDF5' : staff.loginFrequency === 'Medium' ? '#EFF6FF' : '#FEF2F2', color: staff.loginFrequency === 'High' ? '#10B981' : staff.loginFrequency === 'Medium' ? '#3B82F6' : '#EF4444' }}>
                                {staff.loginFrequency}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink800 }}>{staff.lastLoginDate}</td>
                          </>
                        )}

                        {activeTab === 'user-session' && (
                          <>
                            <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: COLORS.textPink900 }}>{staff.totalActiveDurationHours} hrs</td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink800 }}>
                              {timeframe === 'daily' ? `${staff.dailyActiveMins} mins` : timeframe === 'weekly' ? `${staff.weeklyActiveMins} mins` : `${staff.monthlyActiveMins} mins`}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink900, fontWeight: '600' }}>{staff.totalSessions} sessions</td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink800 }}>{staff.avgSessionDurationMins} mins</td>
                          </>
                        )}

                        {activeTab === 'inactive-users' && (
                          <>
                            <td style={{ padding: '14px 16px' }}>
                              <StatusBadge status={staff.status} />
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink900 }}>{staff.lastLoginDate}</td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#EF4444' }}>
                              {staff.daysSinceLastLogin !== null ? `${staff.daysSinceLastLogin} days idle` : 'Never logged in'}
                            </td>
                          </>
                        )}

                        {activeTab === 'account-status' && (
                          <>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink900 }}>{staff.email}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <StatusBadge status={staff.status} />
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: COLORS.textPink800 }}>{staff.registeredAt}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const KpiCard = ({ label, value, icon: Icon, color }) => (
  <div style={{ background: COLORS.bgPink50, borderRadius: '16px', padding: '20px', border: `1px solid ${COLORS.bgPink200}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ fontSize: '12px', color: COLORS.textPink800, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, fontWeight: '600' }}>{label}</p>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.textPink900, margin: '2px 0 0' }}>{value}</h3>
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: status === 'active' ? '#ECFDF5' : '#FEF2F2', color: status === 'active' ? '#10B981' : '#EF4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
    {status === 'active' ? '● Active' : '● Inactive'}
  </span>
);

export default Reports;
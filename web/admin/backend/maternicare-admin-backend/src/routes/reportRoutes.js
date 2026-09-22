import express from 'express';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

router.use(authenticate);

// Superadmin: Reports by Province & District
router.get('/province-district', async (req, res) => {
  try {
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('clinic_id, clinic_name, clinic_code, district, province, status, created_at');

    if (clinicsError) throw clinicsError;

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, clinic_id, role, created_at');

    if (usersError) throw usersError;

    const { data: areas, error: areasError } = await supabase
      .from('areas')
      .select('area_id, clinic_id, area_name');

    // Grouping by Province
    const provinceMap = {};
    const districtMap = {};

    let activeClinics = 0;
    let inactiveClinics = 0;

    (clinics || []).forEach(c => {
      const prov = c.province || 'Unassigned';
      const dist = c.district || 'Unassigned';
      const cStatus = String(c.status || 'active').toLowerCase();

      if (cStatus === 'active') {
        activeClinics++;
      } else {
        inactiveClinics++;
      }

      if (!provinceMap[prov]) {
        provinceMap[prov] = {
          province: prov,
          totalClinics: 0,
          totalDoctors: 0,
          totalMidwives: 0,
          totalNurses: 0,
          totalPatients: 0,
          totalStaff: 0,
          districts: new Set(),
        };
      }

      if (!districtMap[dist]) {
        districtMap[dist] = {
          district: dist,
          province: prov,
          totalClinics: 0,
          totalDoctors: 0,
          totalMidwives: 0,
          totalNurses: 0,
          totalPatients: 0,
          totalStaff: 0,
        };
      }

      provinceMap[prov].totalClinics++;
      provinceMap[prov].districts.add(dist);
      districtMap[dist].totalClinics++;
    });

    (users || []).forEach(u => {
      const clinic = (clinics || []).find(c => c.clinic_id === u.clinic_id);
      if (!clinic) return;

      const prov = clinic.province || 'Unassigned';
      const dist = clinic.district || 'Unassigned';
      const role = (u.role || '').toUpperCase();

      if (provinceMap[prov]) {
        if (role === 'DOCTOR') provinceMap[prov].totalDoctors++;
        else if (role === 'MIDWIFE') provinceMap[prov].totalMidwives++;
        else if (role === 'NURSE') provinceMap[prov].totalNurses++;
        else if (role === 'PATIENT') provinceMap[prov].totalPatients++;
        if (['DOCTOR', 'MIDWIFE', 'NURSE'].includes(role)) provinceMap[prov].totalStaff++;
      }

      if (districtMap[dist]) {
        if (role === 'DOCTOR') districtMap[dist].totalDoctors++;
        else if (role === 'MIDWIFE') districtMap[dist].totalMidwives++;
        else if (role === 'NURSE') districtMap[dist].totalNurses++;
        else if (role === 'PATIENT') districtMap[dist].totalPatients++;
        if (['DOCTOR', 'MIDWIFE', 'NURSE'].includes(role)) districtMap[dist].totalStaff++;
      }
    });

    const provincesList = Object.values(provinceMap).map(p => ({
      ...p,
      districtCount: p.districts.size,
      districts: Array.from(p.districts),
    }));

    const districtsList = Object.values(districtMap);

    return res.status(200).json({
      success: true,
      data: {
        provinces: provincesList,
        districts: districtsList,
        summary: {
          totalClinics: (clinics || []).length,
          activeClinics,
          inactiveClinics,
          totalProvinces: provincesList.length,
          totalDistricts: districtsList.length,
          totalUsers: (users || []).length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Clinic Admin: System Reports (Active Users, Last Login, User Activity, User Session, Inactive Users, Account Status)
router.get('/system-reports', checkPermission('VIEW_REPORTS'), async (req, res) => {
  try {
    const clinicId = req.query.clinic_id || (req.user.user_type !== 'super_admin' ? req.user.clinic_id : null);
    if (!clinicId) {
      return res.status(400).json({ success: false, message: 'Clinic ID is required' });
    }

    // Query staff members belonging to this clinic
    const { data: users, error } = await supabase
      .from('users')
      .select('user_id, full_name, username, email, role, status, last_login, created_at, phone, nic, area_id')
      .eq('clinic_id', clinicId)
      .in('role', ['DOCTOR', 'NURSE', 'MIDWIFE', 'CLINIC_ADMIN'])
      .order('full_name');

    if (error) throw error;

    const staffIds = (users || []).map((u) => u.user_id);
    let activityLogs = [];
    let statusHistory = [];

    if (staffIds.length > 0) {
      const { data: actLogs } = await supabase
        .from('user_activity_logs')
        .select('*')
        .in('user_id', staffIds);
      if (actLogs) activityLogs = actLogs;

      const { data: statHist } = await supabase
        .from('user_status_history')
        .select('*')
        .in('user_id', staffIds);
      if (statHist) statusHistory = statHist;
    }

    const now = new Date();
    const staffList = (users || []).map((u) => {
      const lastLoginDate = u.last_login ? new Date(u.last_login) : null;
      const daysSinceLastLogin = lastLoginDate
        ? Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24))
        : null;

      // Query activity metrics dynamically from database logs
      const userLogs = activityLogs.filter((log) => log.user_id === u.user_id);
      const loginCount = userLogs.length;
      const totalSessionMins = userLogs.reduce((sum, log) => sum + (log.session_duration_minutes || 0), 0);
      const avgSessionMins = loginCount > 0 ? Math.round(totalSessionMins / loginCount) : 0;

      // Query status history modification date
      const userHistory = statusHistory
        .filter((hist) => hist.user_id === u.user_id)
        .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));
      const statusLastChanged = userHistory.length > 0 ? userHistory[0].changed_at : u.created_at;

      return {
        id: u.user_id,
        user_id: u.user_id,
        name: u.full_name || u.username || u.email,
        username: u.username || u.email,
        email: u.email || 'N/A',
        role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : 'Staff',
        status: String(u.status || 'active').toLowerCase(),
        phone: u.phone || 'N/A',
        nic: u.nic || 'N/A',
        lastLogin: u.last_login || null,
        lastLoginDate: u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never',
        lastLoginTime: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
        daysSinceLastLogin,
        registeredAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
        createdAt: u.created_at || null,
        statusLastChanged: statusLastChanged ? new Date(statusLastChanged).toLocaleString() : 'N/A',
        // Activity & Session Metrics
        loginCount,
        loginFrequency: loginCount > 30 ? 'High' : loginCount > 10 ? 'Medium' : loginCount > 0 ? 'Low' : 'None',
        totalActiveDurationMins: totalSessionMins,
        totalActiveDurationHours: (totalSessionMins / 60).toFixed(1),
        dailyActiveMins: Math.round(totalSessionMins / 30),
        weeklyActiveMins: Math.round(totalSessionMins / 4),
        monthlyActiveMins: totalSessionMins,
        totalSessions: loginCount,
        avgSessionDurationMins: avgSessionMins,
      };
    });

    const activeStaff = staffList.filter((s) => s.status === 'active');
    const inactiveStaff = staffList.filter((s) => s.status === 'inactive');

    // 1. Active Users Report Data
    const activeUsersReport = {
      totalActive: activeStaff.length,
      totalInactive: inactiveStaff.length,
      totalStaff: staffList.length,
      activePercentage: staffList.length > 0 ? Math.round((activeStaff.length / staffList.length) * 100) : 0,
      activeUsersList: activeStaff,
    };

    // 2. Last Login Report Data
    const lastLoginReport = {
      staff: [...staffList].sort((a, b) => {
        if (!a.lastLogin) return 1;
        if (!b.lastLogin) return -1;
        return new Date(b.lastLogin) - new Date(a.lastLogin);
      }),
      recentLoginsCount: staffList.filter((s) => s.daysSinceLastLogin !== null && s.daysSinceLastLogin <= 7).length,
      staleLoginsCount: staffList.filter((s) => s.daysSinceLastLogin === null || s.daysSinceLastLogin > 30).length,
      neverLoggedInCount: staffList.filter((s) => !s.lastLogin).length,
    };

    // 3. User Activity Report Data
    const userActivityReport = {
      totalLogins: staffList.reduce((acc, s) => acc + s.loginCount, 0),
      avgLoginsPerUser: staffList.length > 0 ? Math.round(staffList.reduce((acc, s) => acc + s.loginCount, 0) / staffList.length) : 0,
      mostActiveUser: [...staffList].sort((a, b) => b.loginCount - a.loginCount)[0] || null,
      activityList: [...staffList].sort((a, b) => b.loginCount - a.loginCount),
    };

    // 4. User Session / Active Time Report Data
    const userSessionReport = {
      totalHoursSpent: (staffList.reduce((acc, s) => acc + s.totalActiveDurationMins, 0) / 60).toFixed(1),
      totalSessions: staffList.reduce((acc, s) => acc + s.totalSessions, 0),
      avgSessionDuration: staffList.length > 0
        ? Math.round(staffList.reduce((acc, s) => acc + s.avgSessionDurationMins, 0) / staffList.length)
        : 0,
      sessionList: [...staffList].sort((a, b) => b.totalActiveDurationMins - a.totalActiveDurationMins),
    };

    // 5. Inactive User Report Data
    const daysThreshold = parseInt(req.query.daysInactive || '30', 10);
    const inactiveFilterList = staffList.filter((s) => s.status === 'inactive' || (s.daysSinceLastLogin !== null && s.daysSinceLastLogin >= daysThreshold) || !s.lastLogin);

    const inactiveUserReport = {
      daysThreshold,
      inactiveUserCount: inactiveFilterList.length,
      inactiveUsersList: inactiveFilterList.sort((a, b) => (b.daysSinceLastLogin || 999) - (a.daysSinceLastLogin || 999)),
    };

    // 6. Account Status Report Data
    const accountStatusReport = {
      totalAccounts: staffList.length,
      activeAccounts: activeStaff.length,
      inactiveAccounts: inactiveStaff.length,
      recentlyDeactivated: inactiveStaff.filter((s) => s.daysSinceLastLogin && s.daysSinceLastLogin <= 30),
      statusRoster: staffList,
    };

    return res.status(200).json({
      success: true,
      data: {
        activeUsersReport,
        lastLoginReport,
        userActivityReport,
        userSessionReport,
        inactiveUserReport,
        accountStatusReport,
        summary: {
          totalStaff: staffList.length,
          totalActive: activeStaff.length,
          totalInactive: inactiveStaff.length,
          generatedAt: new Date().toLocaleString(),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

import express from 'express';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats', async (req, res) => {
  try {
    const clinicId = req.query.clinic_id || (req.user.user_type !== 'super_admin' ? req.user.clinic_id : null);
    if (!clinicId) {
      return res.status(400).json({ success: false, message: 'Clinic ID is required' });
    }

    // Query staff members for this clinic (excluding patient role)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, full_name, username, role, status, created_at')
      .eq('clinic_id', clinicId)
      .in('role', ['DOCTOR', 'NURSE', 'MIDWIFE', 'CLINIC_ADMIN']);

    if (usersError) throw usersError;

    const allStaff = users || [];

    // Filter staff for role-based statistics (Doctors, Nurses, Midwives)
    const medicalStaff = allStaff.filter(u => ['DOCTOR', 'NURSE', 'MIDWIFE'].includes(String(u.role).toUpperCase()));

    // 1. Active vs Inactive Users
    const activeStaffCount = allStaff.filter(u => String(u.status).toLowerCase() === 'active').length;
    const inactiveStaffCount = allStaff.filter(u => String(u.status).toLowerCase() === 'inactive').length;
    const activeVsInactive = [
      { name: 'Active Users', value: activeStaffCount, color: '#10B981' },
      { name: 'Inactive Users', value: inactiveStaffCount, color: '#EF4444' }
    ];

    // 2. Staff Distribution by Role
    const doctorsCount = medicalStaff.filter(u => String(u.role).toUpperCase() === 'DOCTOR').length;
    const nursesCount = medicalStaff.filter(u => String(u.role).toUpperCase() === 'NURSE').length;
    const midwivesCount = medicalStaff.filter(u => String(u.role).toUpperCase() === 'MIDWIFE').length;
    const staffDistribution = [
      { name: 'Doctors', value: doctorsCount, color: '#10B981' },
      { name: 'Nurses', value: nursesCount, color: '#3B82F6' },
      { name: 'Midwives', value: midwivesCount, color: '#8B5CF6' }
    ];

    // 3. Most Active Staff Members (via user_activity_logs)
    const staffIds = allStaff.map(u => u.user_id);
    let mostActiveStaff = [];
    if (staffIds.length > 0) {
      const { data: activityLogs, error: logError } = await supabase
        .from('user_activity_logs')
        .select('user_id')
        .in('user_id', staffIds);

      if (!logError && activityLogs) {
        const counts = {};
        activityLogs.forEach(log => {
          counts[log.user_id] = (counts[log.user_id] || 0) + 1;
        });

        mostActiveStaff = allStaff.map(u => ({
          name: u.full_name || u.username || 'Staff Member',
          logins: counts[u.user_id] || 0
        })).sort((a, b) => b.logins - a.logins).slice(0, 10);
      }
    }

    // 4. User Status by Role (Stacked Bar Chart)
    const userStatusByRole = [
      {
        role: 'Doctors',
        Active: medicalStaff.filter(u => String(u.role).toUpperCase() === 'DOCTOR' && String(u.status).toLowerCase() === 'active').length,
        Inactive: medicalStaff.filter(u => String(u.role).toUpperCase() === 'DOCTOR' && String(u.status).toLowerCase() === 'inactive').length
      },
      {
        role: 'Nurses',
        Active: medicalStaff.filter(u => String(u.role).toUpperCase() === 'NURSE' && String(u.status).toLowerCase() === 'active').length,
        Inactive: medicalStaff.filter(u => String(u.role).toUpperCase() === 'NURSE' && String(u.status).toLowerCase() === 'inactive').length
      },
      {
        role: 'Midwives',
        Active: medicalStaff.filter(u => String(u.role).toUpperCase() === 'MIDWIFE' && String(u.status).toLowerCase() === 'active').length,
        Inactive: medicalStaff.filter(u => String(u.role).toUpperCase() === 'MIDWIFE' && String(u.status).toLowerCase() === 'inactive').length
      }
    ];

    // 5. Staff Registration Trend (daily/weekly/monthly)
    const trendRange = req.query.trendRange || 'monthly';
    const registrationTrend = [];
    const now = new Date();

    if (trendRange === 'daily') {
      // Last 7 Days daily registrations
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const count = allStaff.filter(u => {
          if (!u.created_at) return false;
          const uDate = new Date(u.created_at);
          return uDate.toDateString() === date.toDateString();
        }).length;
        registrationTrend.push({ period: dateStr, registrations: count });
      }
    } else if (trendRange === 'weekly') {
      // Last 4 Weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7 + 7));
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
        const weekLabel = `Wk -${i}`;
        const count = allStaff.filter(u => {
          if (!u.created_at) return false;
          const uDate = new Date(u.created_at);
          return uDate >= weekStart && uDate <= weekEnd;
        }).length;
        registrationTrend.push({ period: weekLabel, registrations: count });
      }
    } else {
      // Default: Last 6 Months (Monthly)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = monthNames[date.getMonth()];
        const count = allStaff.filter(u => {
          if (!u.created_at) return false;
          const uDate = new Date(u.created_at);
          return uDate.getFullYear() === date.getFullYear() && uDate.getMonth() === date.getMonth();
        }).length;
        registrationTrend.push({ period: monthLabel, registrations: count });
      }
    }

    // 6. Inactive Users by Role
    const inactiveDoctors = medicalStaff.filter(u => String(u.role).toUpperCase() === 'DOCTOR' && String(u.status).toLowerCase() === 'inactive').length;
    const inactiveNurses = medicalStaff.filter(u => String(u.role).toUpperCase() === 'NURSE' && String(u.status).toLowerCase() === 'inactive').length;
    const inactiveMidwives = medicalStaff.filter(u => String(u.role).toUpperCase() === 'MIDWIFE' && String(u.status).toLowerCase() === 'inactive').length;
    const inactiveUsersByRole = [
      { name: 'Inactive Doctors', value: inactiveDoctors, color: '#10B981' },
      { name: 'Inactive Nurses', value: inactiveNurses, color: '#3B82F6' },
      { name: 'Inactive Midwives', value: inactiveMidwives, color: '#8B5CF6' }
    ];

    return res.status(200).json({
      success: true,
      data: {
        activeVsInactive,
        staffDistribution,
        mostActiveStaff,
        userStatusByRole,
        registrationTrend,
        inactiveUsersByRole,
        summary: {
          totalStaff: allStaff.length,
          activeStaff: activeStaffCount,
          inactiveStaff: inactiveStaffCount
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

import express from 'express';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();
router.use(authenticate);

// ─── GET /api/permissions ────────────────────────────────────────────────────
// Returns all available permissions grouped by module (anyone authenticated)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module_name')
      .order('permission_name');

    if (error) throw error;

    // Group by module
    const grouped = {};
    (data || []).forEach(p => {
      if (!grouped[p.module_name]) grouped[p.module_name] = [];
      grouped[p.module_name].push(p);
    });

    return res.json({ success: true, data: { permissions: data || [], grouped } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/permissions/role-permissions ───────────────────────────────────
// Super Admin: Get CLINIC_ADMIN role permissions with enabled status
router.get('/role-permissions', requireRole(['super_admin']), async (req, res) => {
  try {
    const { data: allPerms, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .order('module_name')
      .order('permission_name');

    if (permError) throw permError;

    const { data: rolePerms, error: rpError } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role', 'CLINIC_ADMIN');

    if (rpError) throw rpError;

    const rolePermMap = {};
    (rolePerms || []).forEach(rp => {
      rolePermMap[rp.permission_id] = rp;
    });

    const merged = (allPerms || []).map(p => ({
      ...p,
      is_enabled: rolePermMap[p.permission_id]?.is_enabled ?? true,
      role_permission_id: rolePermMap[p.permission_id]?.id ?? null,
    }));

    // Group by module
    const grouped = {};
    merged.forEach(p => {
      if (!grouped[p.module_name]) grouped[p.module_name] = [];
      grouped[p.module_name].push(p);
    });

    return res.json({ success: true, data: { role: 'CLINIC_ADMIN', permissions: merged, grouped } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/permissions/role-permissions ───────────────────────────────────
// Super Admin: Toggle a CLINIC_ADMIN permission
router.put('/role-permissions', requireRole(['super_admin']), async (req, res) => {
  try {
    const { permission_id, is_enabled } = req.body;

    if (!permission_id) {
      return res.status(400).json({ success: false, message: 'permission_id is required' });
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('role', 'CLINIC_ADMIN')
      .eq('permission_id', permission_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('role_permissions')
        .update({ is_enabled, updated_at: new Date().toISOString() })
        .eq('role', 'CLINIC_ADMIN')
        .eq('permission_id', permission_id);
    } else {
      await supabase
        .from('role_permissions')
        .insert([{ role: 'CLINIC_ADMIN', permission_id, is_enabled }]);
    }

    return res.json({ success: true, message: 'Role permission updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/permissions/clinic-staff-permissions ───────────────────────────
// Clinic Admin: Get permissions for a specific staff_role in this clinic
router.get('/clinic-staff-permissions', requireRole(['clinic_admin']), async (req, res) => {
  try {
    const clinicId = req.user.clinic_id;
    const { staff_role } = req.query;

    if (!staff_role) {
      return res.status(400).json({ success: false, message: 'staff_role query parameter is required' });
    }

    const { data: allPerms, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .order('module_name')
      .order('permission_name');

    if (permError) throw permError;

    // Get existing clinic staff permission overrides
    const { data: cspRows, error: cspError } = await supabase
      .from('clinic_staff_permissions')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('staff_role', staff_role.toUpperCase());

    if (cspError) throw cspError;

    const cspMap = {};
    (cspRows || []).forEach(row => {
      cspMap[row.permission_id] = row;
    });

    const merged = (allPerms || []).map(p => ({
      ...p,
      is_enabled: cspMap[p.permission_id] !== undefined ? cspMap[p.permission_id].is_enabled : true,
      csp_id: cspMap[p.permission_id]?.id ?? null,
    }));

    // Group by module
    const grouped = {};
    merged.forEach(p => {
      if (!grouped[p.module_name]) grouped[p.module_name] = [];
      grouped[p.module_name].push(p);
    });

    return res.json({ success: true, data: { clinic_id: clinicId, staff_role: staff_role.toUpperCase(), permissions: merged, grouped } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/permissions/clinic-staff-permissions ───────────────────────────
// Clinic Admin: Toggle a permission for a staff role in this clinic
router.put('/clinic-staff-permissions', requireRole(['clinic_admin']), async (req, res) => {
  try {
    const clinicId = req.user.clinic_id;
    const { staff_role, permission_id, is_enabled } = req.body;

    if (!staff_role || !permission_id) {
      return res.status(400).json({ success: false, message: 'staff_role and permission_id are required' });
    }

    const { data: existing } = await supabase
      .from('clinic_staff_permissions')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('staff_role', staff_role.toUpperCase())
      .eq('permission_id', permission_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('clinic_staff_permissions')
        .update({ is_enabled, updated_at: new Date().toISOString() })
        .eq('clinic_id', clinicId)
        .eq('staff_role', staff_role.toUpperCase())
        .eq('permission_id', permission_id);
    } else {
      await supabase
        .from('clinic_staff_permissions')
        .insert([{ clinic_id: clinicId, staff_role: staff_role.toUpperCase(), permission_id, is_enabled }]);
    }

    return res.json({ success: true, message: 'Staff permission updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/permissions/my-permissions ─────────────────────────────────────
// Returns effective permissions for the currently authenticated user
router.get('/my-permissions', async (req, res) => {
  try {
    const userRole = (req.user.user_type || req.user.role || '').toUpperCase();
    const clinicId = req.user.clinic_id;

    let effectivePermissions = [];

    if (userRole === 'SUPER_ADMIN') {
      // Super Admin has all permissions
      const { data } = await supabase.from('permissions').select('permission_name');
      effectivePermissions = (data || []).map(p => p.permission_name);

    } else if (userRole === 'CLINIC_ADMIN') {
      // Check role_permissions for CLINIC_ADMIN
      const { data } = await supabase
        .from('role_permissions')
        .select('permission_id, is_enabled, permissions(permission_name)')
        .eq('role', 'CLINIC_ADMIN')
        .eq('is_enabled', true);
      effectivePermissions = (data || []).map(rp => rp.permissions?.permission_name).filter(Boolean);

    } else {
      // Doctor, Nurse, Midwife: check clinic_staff_permissions
      if (clinicId) {
        const { data } = await supabase
          .from('clinic_staff_permissions')
          .select('permission_id, is_enabled, permissions(permission_name)')
          .eq('clinic_id', clinicId)
          .eq('staff_role', userRole)
          .eq('is_enabled', true);
        effectivePermissions = (data || []).map(csp => csp.permissions?.permission_name).filter(Boolean);
      }
    }

    return res.json({ success: true, data: { permissions: effectivePermissions } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

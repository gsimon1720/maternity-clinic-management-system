import { supabaseAdmin as supabase } from '../config/supabase.js';

/**
 * Middleware factory that enforces a named permission for CLINIC_ADMIN requests.
 *
 * Usage in routes:
 *   router.put('/:id', checkRole([ROLES.CLINIC_ADMIN]), checkPermission('EDIT_CLINIC_INFO'), handler);
 *
 * - Super Admins always bypass permission checks.
 * - Unknown permissions (not in the DB) fail open (allow through) so unregistered
 *   features don't break during a DB migration window.
 * - DB errors also fail open to avoid locking out users due to infra issues.
 */
export const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userRole = (req.user.user_type || req.user.role || '').toLowerCase();

    // ── Super Admins bypass all permission checks ─────────────────────────────
    if (userRole === 'super_admin') {
      return next();
    }

    // ── CLINIC_ADMIN: check role_permissions table ────────────────────────────
    if (userRole === 'clinic_admin') {
      try {
        // 1. Resolve permission_id by name
        const { data: perm, error: permErr } = await supabase
          .from('permissions')
          .select('permission_id')
          .eq('permission_name', permissionName)
          .maybeSingle();

        if (permErr) {
          console.error(`[checkPermission] DB error looking up ${permissionName}:`, permErr.message);
          return next(); // fail open on DB error
        }

        if (!perm) {
          // Permission name not registered yet → fail open
          console.warn(`[checkPermission] Unknown permission name: ${permissionName} — allowing through`);
          return next();
        }

        // 2. Check role_permissions row for CLINIC_ADMIN
        const { data: rolePerm, error: rpErr } = await supabase
          .from('role_permissions')
          .select('is_enabled')
          .eq('role', 'CLINIC_ADMIN')
          .eq('permission_id', perm.permission_id)
          .maybeSingle();

        if (rpErr) {
          console.error(`[checkPermission] DB error on role_permissions:`, rpErr.message);
          return next(); // fail open
        }

        // No row = default enabled; row with is_enabled=true = allowed
        if (!rolePerm || rolePerm.is_enabled === true) {
          return next();
        }

        // Permission is explicitly disabled → reject
        return res.status(403).json({
          success: false,
          message: `Access denied: the '${permissionName}' permission has been disabled for your account. Contact your Super Admin.`,
          permission: permissionName,
        });

      } catch (err) {
        console.error('[checkPermission] Unexpected error:', err.message);
        return next(); // fail open
      }
    }

    // ── Other roles (DOCTOR, NURSE, MIDWIFE): no enforcement yet ─────────────
    return next();
  };
};

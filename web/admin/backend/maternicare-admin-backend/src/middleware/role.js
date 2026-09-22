 export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLINIC_ADMIN: 'clinic_admin',
  SPHM: 'sphm',
  ADO: 'ad_officer',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  MIDWIFE: 'midwife',
  PATIENT: 'patient'
};

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized - User not authenticated' });
    }
    if (!allowedRoles.includes(req.user.user_type)) {
      return res.status(403).json({ success: false, message: 'Forbidden - Insufficient permissions' });
    }
    next();
  };
};

// Alias for named import compatibility
export const requireRole = checkRole;

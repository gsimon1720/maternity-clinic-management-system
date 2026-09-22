export const STAFF_ROLES = ['doctor', 'nurse', 'midwife'];

// Roles each clinic-scoped actor is allowed to create/view/edit.
const CREATABLE_ROLES = {
  clinic_admin: ['doctor', 'nurse'],
  sphm: ['midwife'],
};

const VIEWABLE_ROLES = {
  clinic_admin: ['doctor', 'nurse', 'midwife'],
  sphm: ['midwife'],
};

const EDITABLE_ROLES = {
  clinic_admin: ['doctor', 'nurse'],
  sphm: ['midwife'],
};

export const isClinicAdmin = (user) => user?.user_type === 'clinic_admin';

export const isSphm = (user) => user?.user_type === 'sphm';

// Only Clinic Admin is "clinic-scoped" (bound to their own clinic_id).
// SPHM is a global role — handled separately in the functions below.
const scopedRole = (user) => {
  if (isClinicAdmin(user)) return 'clinic_admin';
  return null;
};

export const assertOwnClinic = (req, clinicId) => {
  const role = scopedRole(req.user);
  if (!role) return null;

  const requestedId = parseInt(clinicId, 10);
  const ownClinicId = parseInt(req.user.clinic_id, 10);

  if (requestedId !== ownClinicId) {
    return {
      status: 403,
      body: { success: false, message: 'Access denied to this clinic' },
    };
  }

  return null;
};

// Shared role-only check for SPHM (global — no clinic ownership comparison).
const assertSphmRoleOnly = (req, targetUser, allowedRoles, denyMessage) => {
  const resolvedRole = String(targetUser.user_type || targetUser.role || '').toLowerCase();

  if (!allowedRoles.includes(resolvedRole)) {
    return { status: 403, body: { success: false, message: denyMessage } };
  }

  if (parseInt(targetUser.user_id, 10) === parseInt(req.user.user_id, 10)) {
    return {
      status: 403,
      body: { success: false, message: 'You cannot modify your own account here' },
    };
  }

  return null;
};

// Used for VIEW access (getUserById) — Clinic Admin can view doctor/nurse/midwife
// in their own clinic (read-only for midwife); SPHM (global) can view any Midwife.
export const assertCanManageUser = (req, targetUser) => {
  if (isSphm(req.user)) {
    return assertSphmRoleOnly(req, targetUser, VIEWABLE_ROLES.sphm, 'SPHM can only view Midwives.');
  }

  const role = scopedRole(req.user);
  if (!role) return null;

  const ownClinicId = parseInt(req.user.clinic_id, 10);
  const targetClinicId = parseInt(targetUser.clinic_id, 10);

  if (targetClinicId !== ownClinicId) {
    return {
      status: 403,
      body: { success: false, message: 'Access denied to this user' },
    };
  }

  const resolvedRole = String(targetUser.user_type || targetUser.role || '').toLowerCase();

  if (!VIEWABLE_ROLES[role].includes(resolvedRole)) {
    return {
      status: 403,
      body: { success: false, message: 'Clinic Admins can manage Doctors, Nurses, and Midwives.' },
    };
  }

  if (parseInt(targetUser.user_id, 10) === parseInt(req.user.user_id, 10)) {
    return {
      status: 403,
      body: { success: false, message: 'You cannot modify your own account here' },
    };
  }

  return null;
};

// Used for EDIT/DELETE (updateUser, deleteUser) — Clinic Admin is restricted to
// doctor/nurse here (midwife records are SPHM-only); SPHM (global) may edit/delete
// any Midwife, regardless of clinic.
export const assertCanEditOrDeleteUser = (req, targetUser) => {
  if (isSphm(req.user)) {
    return assertSphmRoleOnly(req, targetUser, EDITABLE_ROLES.sphm, 'SPHM can only manage Midwives.');
  }

  const role = scopedRole(req.user);
  if (!role) return null;

  const ownClinicId = parseInt(req.user.clinic_id, 10);
  const targetClinicId = parseInt(targetUser.clinic_id, 10);

  if (targetClinicId !== ownClinicId) {
    return {
      status: 403,
      body: { success: false, message: 'Access denied to this user' },
    };
  }

  const resolvedRole = String(targetUser.user_type || targetUser.role || '').toLowerCase();

  if (!EDITABLE_ROLES[role].includes(resolvedRole)) {
    return {
      status: 403,
      body: {
        success: false,
        message: 'Midwife records are managed by the Supervising Public Health Midwife (SPHM) and cannot be edited or deleted here.',
      },
    };
  }

  if (parseInt(targetUser.user_id, 10) === parseInt(req.user.user_id, 10)) {
    return {
      status: 403,
      body: { success: false, message: 'You cannot modify your own account here' },
    };
  }

  return null;
};

export const assertCanCreateStaffRole = (req, userType) => {
  const role = isSphm(req.user) ? 'sphm' : scopedRole(req.user);
  if (!role) return null;

  if (!CREATABLE_ROLES[role].includes(userType)) {
    return {
      status: 403,
      body: {
        success: false,
        message: role === 'sphm'
          ? 'SPHM can only register Midwives'
          : 'Clinic admin can only add doctors and nurses',
      },
    };
  }

  return null;
};

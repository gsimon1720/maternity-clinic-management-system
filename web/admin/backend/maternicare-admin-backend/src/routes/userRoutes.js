import express from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole, ROLES } from '../middleware/role.js';
import { validate, schemas } from '../middleware/validation.js';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

router.use(authenticate);

// Super Admin only
router.get('/admins', checkRole([ROLES.SUPER_ADMIN]), userController.getClinicAdmins);
router.post(
  '/admins',
  checkRole([ROLES.SUPER_ADMIN]),
  validate(schemas.addClinicAdmin),
  userController.addClinicAdmin
);

// ─── Midwife Management (SPHM only) ────────────────────────────────────────

// GET /api/users/midwives  → all midwives system-wide (SPHM is a global role)
//   enriched with their assigned area, that area's zones, and their clinic
router.get(
  '/midwives',
  checkRole([ROLES.SPHM]),
  async (req, res) => {
    try {
      const { data: midwives, error } = await supabase
        .from('users')
        .select('user_id, full_name, email, phone, nic, area_id, clinic_id, status, created_at')
        .eq('role', 'MIDWIFE')
        .order('full_name');

      if (error) throw error;

      const clinicIds = [...new Set((midwives || []).map((m) => m.clinic_id).filter(Boolean))];
      let clinics = [];
      if (clinicIds.length > 0) {
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('clinic_id, clinic_name')
          .in('clinic_id', clinicIds);
        clinics = clinicData || [];
      }
      const clinicMap = {};
      clinics.forEach((c) => { clinicMap[c.clinic_id] = c; });

      const areaIds = [...new Set((midwives || []).map((m) => m.area_id).filter(Boolean))];
      let areas = [];
      if (areaIds.length > 0) {
        const { data: areaData } = await supabase
          .from('areas')
          .select('area_id, area_name, area_code')
          .in('area_id', areaIds);
        areas = areaData || [];
      }

      let zones = [];
      if (areaIds.length > 0) {
        const { data: zoneData } = await supabase
          .from('zones')
          .select('zone_id, zone_name, zone_code, area_id')
          .in('area_id', areaIds);
        zones = zoneData || [];
      }

      const areaMap = {};
      areas.forEach((a) => {
        areaMap[a.area_id] = { ...a, zones: zones.filter((z) => z.area_id === a.area_id) };
      });

      const enriched = (midwives || []).map((m) => ({
        ...m,
        area: m.area_id ? (areaMap[m.area_id] || null) : null,
        clinic: m.clinic_id ? (clinicMap[m.clinic_id] || null) : null,
      }));

      return res.status(200).json({ success: true, data: enriched });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

import { qualificationController } from '../controllers/qualificationController.js';

// ─── Staff Qualifications CRUD ─────────────────────────────────────────────
router.get('/:id/qualifications', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.SPHM]), checkPermission('VIEW_STAFF'), qualificationController.getQualifications);
router.post('/:id/qualifications', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.SPHM]), checkPermission('EDIT_STAFF'), qualificationController.addQualification);
router.put('/qualifications/:qualificationId', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.SPHM]), checkPermission('EDIT_STAFF'), qualificationController.updateQualification);
router.delete('/qualifications/:qualificationId', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.SPHM]), checkPermission('DELETE_STAFF'), qualificationController.deleteQualification);

// ─── General CRUD (Clinic Admin + SPHM + Super Admin) ──────────────────────
router.get('/', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.SPHM]), checkPermission('VIEW_STAFF'), userController.getUsers);
router.post(
  '/',
  checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.SPHM]),
  checkPermission('ADD_STAFF'),
  validate(schemas.createUser),
  userController.createUser
);
router.get('/:id', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.SPHM]), checkPermission('VIEW_STAFF'), userController.getUserById);
router.put('/:id', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.SPHM]), checkPermission('EDIT_STAFF'), validate(schemas.updateUser), userController.updateUser);
router.delete('/:id', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.SPHM]), checkPermission('DELETE_STAFF'), userController.deleteUser);

export default router;

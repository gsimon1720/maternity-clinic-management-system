import express from 'express';
import { clinicController } from '../controllers/clinicController.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole, ROLES } from '../middleware/role.js';
import { validate, schemas } from '../middleware/validation.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

router.use(authenticate);

// Super Admin: full clinic management; ADO: read-only, needed to pick a clinic when creating an Area
router.get('/', checkRole([ROLES.SUPER_ADMIN, ROLES.ADO]), clinicController.getAllClinics);

// Clinic Admin: view own clinic (needs VIEW_CLINIC_INFO)
router.get('/my', checkRole([ROLES.CLINIC_ADMIN]), checkPermission('VIEW_CLINIC_INFO'), clinicController.getMyClinic);

// Super Admin: create clinic
router.post(
  '/',
  checkRole([ROLES.SUPER_ADMIN]),
  validate(schemas.registerClinic),
  clinicController.registerClinic
);

// Both: view by ID
router.get('/:id', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN]), clinicController.getClinicById);

// Both: update — Clinic Admin also needs EDIT_CLINIC_INFO permission
router.put(
  '/:id',
  checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN]),
  checkPermission('EDIT_CLINIC_INFO'),
  validate(schemas.updateClinic),
  clinicController.updateClinic
);

// Super Admin only: delete
router.delete('/:id', checkRole([ROLES.SUPER_ADMIN]), clinicController.deleteClinic);

export default router;

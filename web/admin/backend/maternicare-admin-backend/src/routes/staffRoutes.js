 import express from 'express';
import { staffController } from '../controllers/staffController.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole, ROLES } from '../middleware/role.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

// Clinic Admin only
router.post('/', checkRole([ROLES.CLINIC_ADMIN]), validate(schemas.registerStaff), staffController.registerStaff);

// Clinic Admin + Super Admin
router.get('/clinic/:clinic_id', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN]), staffController.getStaffByClinic);
router.get('/:id', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN]), staffController.getStaffById);
router.put('/:id', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN]), staffController.updateStaff);
router.delete('/:id', checkRole([ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN]), staffController.deleteStaff);

export default router;

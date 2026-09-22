// src/routes/postnatalRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const postnatalController = require('../controllers/postnatalController');

// All routes require authentication
router.use(authenticate);

// ============================
// GET ROUTES - Doctor & Nurse
// ============================
router.get(
  '/',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  postnatalController.getAll
);

router.get(
  '/patient/:patientId',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  postnatalController.getByPatient
);

router.get(
  '/pregnancy/:pregnancyId',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  postnatalController.getByPregnancy
);

router.get(
  '/:id',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  postnatalController.getById
);

// ============================
// CREATE ROUTE - DOCTOR ONLY
// ============================
router.post(
  '/',
  authorize(['DOCTOR', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  postnatalController.create
);

// ============================
// UPDATE ROUTE - Doctor & Nurse
// ============================
router.put(
  '/:id',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  postnatalController.update
);

// ============================
// DELETE ROUTE - DOCTOR ONLY
// ============================
router.delete(
  '/:id',
  authorize(['DOCTOR', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  postnatalController.softDelete
);

module.exports = router;
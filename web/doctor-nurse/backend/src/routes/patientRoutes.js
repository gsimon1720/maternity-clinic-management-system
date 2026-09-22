// src/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const patientController = require('../controllers/patientController');

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  patientController.getAllPatients
);

router.get(
  '/:patientId/full',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  patientController.getPatientWithAllData
);

router.get(
  '/:patientId',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  patientController.getPatientById
);

router.put(
  '/:patientId',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  patientController.updatePatient
);

router.put(
  '/:patientId/pregnancy/:pregnancyId',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  patientController.updateCurrentPregnancy
);

router.put(
  '/:patientId/medical-history',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  patientController.updateMedicalHistory
);

router.put(
  '/:patientId/family-history',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  patientController.updateFamilyHistory
);



module.exports = router;
// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const dashboardController = require('../controllers/dashboardController');

router.use(authenticate);

//  Doctor Dashboard - Clinic ID = 2 only
router.get(
  '/doctor',
  authorize(['DOCTOR', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  dashboardController.getDoctorDashboard
);

// Nurse Dashboard - ALL data
router.get(
  '/nurse',
  authorize(['NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  dashboardController.getNurseDashboard
);

router.get(
  '/stats',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  dashboardController.getStats
);

router.get(
  '/clinic-visit-types',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  dashboardController.getClinicVisitTypes
);

module.exports = router;
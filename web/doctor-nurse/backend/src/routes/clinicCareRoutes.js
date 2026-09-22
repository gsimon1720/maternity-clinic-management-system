// src/routes/clinicCareRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

//  Make sure controller exists and is imported correctly
let clinicCareController;
try {
  clinicCareController = require('../controllers/clinicCareController');
} catch (error) {
  console.error('❌ ClinicCareController not found:', error.message);
  // Create a fallback controller
  clinicCareController = {
    getAllClinicVisits: (req, res) => {
      res.status(200).json({ success: true, data: { visits: [], total: 0 } });
    },
    getClinicVisitById: (req, res) => {
      res.status(404).json({ success: false, message: 'Clinic visit not found' });
    }
  };
}

// All routes require authentication
router.use(authenticate);

// Get all clinic visits (Doctor & Nurse)
router.get(
  '/',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  clinicCareController.getAllClinicVisits
);

// Get clinic visit by ID (Doctor & Nurse)
router.get(
  '/:id',
  authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']),
  clinicCareController.getClinicVisitById
);

module.exports = router;
// src/controllers/postnatalController.js
const Postnatal = require('../models/Postnatal');
const { validateCreate, validateUpdate } = require('../validations/postnatalValidation');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// ============================
// GET ALL POSTNATAL RECORDS
// ============================
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId = null } = req.query;
    
    const result = await Postnatal.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      patientId: patientId ? parseInt(patientId) : null
    });
    
    return successResponse(res, result, 'Postnatal records retrieved successfully');
  } catch (error) {
    console.error('Error in getAll:', error);
    return errorResponse(res, 'Failed to retrieve postnatal records', 500);
  }
};


// ============================
// GET POSTNATAL BY ID
// ============================
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Fetching postnatal record with id:', id); // Debug log
    
    const record = await Postnatal.getById(parseInt(id));
    
    if (!record) {
      console.log('❌ Record not found for id:', id);
      return errorResponse(res, 'Postnatal record not found', 404);
    }
    
    console.log('✅ Record found:', record);
    return successResponse(res, record, 'Postnatal record retrieved successfully');
  } catch (error) {
    console.error('Error in getById:', error);
    return errorResponse(res, 'Failed to retrieve postnatal record', 500);
  }
};

// ============================
// GET POSTNATAL BY PATIENT
// ============================
const getByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const records = await Postnatal.getByPatientId(parseInt(patientId));
    
    return successResponse(res, records, 'Postnatal records retrieved successfully');
  } catch (error) {
    console.error('Error in getByPatient:', error);
    return errorResponse(res, 'Failed to retrieve postnatal records', 500);
  }
};

// ============================
// GET POSTNATAL BY PREGNANCY
// ============================
const getByPregnancy = async (req, res) => {
  try {
    const { pregnancyId } = req.params;
    
    const records = await Postnatal.getByPregnancyId(parseInt(pregnancyId));
    
    return successResponse(res, records, 'Postnatal records retrieved successfully');
  } catch (error) {
    console.error('Error in getByPregnancy:', error);
    return errorResponse(res, 'Failed to retrieve postnatal records', 500);
  }
};

// ============================
// CREATE POSTNATAL RECORD - ✅ FIXED
// ============================
const create = async (req, res) => {
  try {
    // Validate input
    const { error } = validateCreate(req.body);
    if (error) {
      return errorResponse(res, 'Validation failed', 400, error.details);
    }
    
    // Check if patient exists
    const patientCheck = await require('../models/Patient').getById(req.body.patient_id);
    if (!patientCheck) {
      return errorResponse(res, 'Patient not found', 404);
    }
    
    // ✅ FIX: Check pregnancy only if pregnancy_id is provided
    if (req.body.pregnancy_id) {
      const pregnancyCheck = await require('../models/Pregnancy').getById(req.body.pregnancy_id);
      if (!pregnancyCheck) {
        return errorResponse(res, 'Pregnancy not found', 404);
      }
    }
    // If pregnancy_id is null, skip the check - allow creating without pregnancy
    
    // Create record
    const newRecord = await Postnatal.create(req.body);
    
    return successResponse(res, newRecord, 'Postnatal record created successfully', 201);
  } catch (error) {
    console.error('Error in create:', error);
    return errorResponse(res, 'Failed to create postnatal record', 500);
  }
};

// ============================
// UPDATE POSTNATAL RECORD
// ============================
const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate input
    const { error } = validateUpdate(req.body);
    if (error) {
      return errorResponse(res, 'Validation failed', 400, error.details);
    }
    
    // Check if record exists
    const existingRecord = await Postnatal.getById(parseInt(id));
    if (!existingRecord) {
      return errorResponse(res, 'Postnatal record not found', 404);
    }
    
    // Update record
    const updatedRecord = await Postnatal.update(parseInt(id), req.body);
    
    if (!updatedRecord) {
      return errorResponse(res, 'Postnatal record not found or already deleted', 404);
    }
    
    return successResponse(res, updatedRecord, 'Postnatal record updated successfully');
  } catch (error) {
    console.error('Error in update:', error);
    return errorResponse(res, 'Failed to update postnatal record', 500);
  }
};

// ============================
// SOFT DELETE POSTNATAL RECORD
// ============================
const softDelete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const existingRecord = await Postnatal.getById(parseInt(id));
    if (!existingRecord) {
      return errorResponse(res, 'Postnatal record not found', 404);
    }
    
    // Soft delete
    const deletedRecord = await Postnatal.softDelete(parseInt(id));
    
    if (!deletedRecord) {
      return errorResponse(res, 'Postnatal record not found or already deleted', 404);
    }
    
    return successResponse(res, deletedRecord, 'Postnatal record deleted successfully');
  } catch (error) {
    console.error('Error in softDelete:', error);
    return errorResponse(res, 'Failed to delete postnatal record', 500);
  }
};

module.exports = {
  getAll,
  getById,
  getByPatient,
  getByPregnancy,
  create,
  update,
  softDelete
};
// src/controllers/clinicCareController.js
const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// ============================
// GET ALL CLINIC VISITS
// ============================
const getAllClinicVisits = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    if (type === 'upcoming') {
      whereClause = `WHERE cc.visit_date > CURRENT_DATE`;
    } else if (type === 'today') {
      whereClause = `WHERE cc.visit_date = CURRENT_DATE`;
    } else if (type === 'completed') {
      whereClause = `WHERE cc.visit_date < CURRENT_DATE`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM clinic_care cc
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || 0);

    // Get visits with pagination
    const dataQuery = `
      SELECT 
        cc.clinic_care_id,
        cc.visit_date,
        cc.poa,
        cc.weight,
        cc.bp_systolic,
        cc.bp_diastolic,
        cc.fundal_height,
        cc.fhs,
        cc.officer_signature,
        cc.designation,
        CONCAT(pt.first_name, ' ', pt.last_name) as patient_name,
        pt.patient_id,
        p.pregnancy_id,
        p.pregnancy_no,
        c.clinic_name,
        CASE 
          WHEN cc.visit_date < CURRENT_DATE THEN 'Completed'
          WHEN cc.visit_date = CURRENT_DATE THEN 'Today'
          ELSE 'Upcoming'
        END as status
      FROM clinic_care cc
      JOIN pregnancy p ON cc.pregnancy_id = p.pregnancy_id
      JOIN patient pt ON p.patient_id = pt.patient_id
      LEFT JOIN clinics c ON pt.clinic_id = c.clinic_id
      ${whereClause}
      ORDER BY cc.visit_date ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, parseInt(limit), offset];
    const dataResult = await query(dataQuery, dataParams);

    return successResponse(res, {
      visits: dataResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }, 'Clinic visits retrieved successfully');

  } catch (error) {
    console.error('Error in getAllClinicVisits:', error);
    return errorResponse(res, 'Failed to retrieve clinic visits', 500);
  }
};

// ============================
// GET CLINIC VISIT BY ID
// ============================
const getClinicVisitById = async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = `
      SELECT 
        cc.*,
        CONCAT(pt.first_name, ' ', pt.last_name) as patient_name,
        pt.patient_id,
        p.pregnancy_id,
        p.pregnancy_no,
        c.clinic_name
      FROM clinic_care cc
      JOIN pregnancy p ON cc.pregnancy_id = p.pregnancy_id
      JOIN patient pt ON p.patient_id = pt.patient_id
      LEFT JOIN clinics c ON pt.clinic_id = c.clinic_id
      WHERE cc.clinic_care_id = $1
    `;

    const result = await query(queryText, [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Clinic visit not found', 404);
    }

    return successResponse(res, result.rows[0], 'Clinic visit retrieved successfully');

  } catch (error) {
    console.error('Error in getClinicVisitById:', error);
    return errorResponse(res, 'Failed to retrieve clinic visit', 500);
  }
};

module.exports = {
  getAllClinicVisits,
  getClinicVisitById
};
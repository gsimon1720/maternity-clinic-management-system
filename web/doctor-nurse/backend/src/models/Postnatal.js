// src/models/Postnatal.js
const { query } = require('../config/database');

class Postnatal {
  

// Get all postnatal records (with soft delete filter)
static async getAll(options = {}) {
  const { page = 1, limit = 10, patientId = null, includeDeleted = false } = options;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let whereClause = 'WHERE 1=1';
  let params = [];
  let paramIndex = 1;
  
  //  Only show non-deleted records
  whereClause += ` AND (p.is_deleted = false OR p.is_deleted IS NULL)`;
  
  if (patientId) {
    whereClause += ` AND p.patient_id = $${paramIndex}`;
    params.push(patientId);
    paramIndex++;
  }
  
  if (!includeDeleted) {
    whereClause += ` AND p.deleted_at IS NULL`;
  }
  
  //  Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM postnatal_clinic_care p
    ${whereClause}
  `;
  
  //  Get data with pagination
  const dataQuery = `
    SELECT 
      p.*,
      pt.first_name,
      pt.last_name,
      pt.nic,
      pt.phone,
      pr.pregnancy_no
    FROM postnatal_clinic_care p
    LEFT JOIN patient pt ON p.patient_id = pt.patient_id
    LEFT JOIN pregnancy pr ON p.pregnancy_id = pr.pregnancy_id
    ${whereClause}
    ORDER BY p.visit_date DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  
  try {
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || 0);
    
    const dataParams = [...params, parseInt(limit), offset];
    const dataResult = await query(dataQuery, dataParams);
    
    return {
      data: dataResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  } catch (error) {
    console.error('Error in Postnatal.getAll:', error);
    throw error;
  }
}

  

// Get single postnatal record by ID
static async getById(id) {
  const queryText = `
    SELECT 
      p.*,
      pt.first_name,
      pt.last_name,
      pt.nic,
      pt.phone,
      pt.dob,
      pr.pregnancy_no,
      pr.registration_number
    FROM postnatal_clinic_care p
    LEFT JOIN patient pt ON p.patient_id = pt.patient_id
    LEFT JOIN pregnancy pr ON p.pregnancy_id = pr.pregnancy_id
    WHERE p.id = $1 
      AND (p.is_deleted = false OR p.is_deleted IS NULL)
      AND p.deleted_at IS NULL
  `;
  
  try {
    const result = await query(queryText, [id]);
    console.log('🔍 getById result:', result.rows[0]); // Debug log
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in Postnatal.getById:', error);
    throw error;
  }
}

  // Get postnatal records by patient ID
  static async getByPatientId(patientId) {
    const queryText = `
      SELECT 
        p.*,
        pr.pregnancy_no,
        pr.registration_number
      FROM postnatal_clinic_care p
      JOIN pregnancy pr ON p.pregnancy_id = pr.pregnancy_id
      WHERE p.patient_id = $1 
        AND p.is_deleted = false
        AND p.deleted_at IS NULL
      ORDER BY p.visit_date DESC
    `;
    
    const result = await query(queryText, [patientId]);
    return result.rows;
  }

  // Get postnatal records by pregnancy ID
  static async getByPregnancyId(pregnancyId) {
    const queryText = `
      SELECT 
        p.*,
        pt.first_name,
        pt.last_name
      FROM postnatal_clinic_care p
      JOIN patient pt ON p.patient_id = pt.patient_id
      WHERE p.pregnancy_id = $1 
        AND p.is_deleted = false
        AND p.deleted_at IS NULL
      ORDER BY p.visit_date DESC
    `;
    
    const result = await query(queryText, [pregnancyId]);
    return result.rows;
  }

  // Create new postnatal record
  static async create(data) {
    const {
      patient_id,
      pregnancy_id,
      clinic_id,
      visit_date,
      examined_by,
      breast_problems,
      abnormal_vaginal_discharge,
      excessive_vaginal_bleeding,
      pallor,
      icterus,
      oedema,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      cardiovascular_system,
      respiratory_system,
      abdominal_examination,
      vaginal_examination,
      mental_status_epds,
      other_mental_status,
      problems_identified,
      family_planning_method,
      reason_for_choice,
      clinic_place,
      clinic_date,
      clinic_time,
      special_notes,
      officer_signature,
      designation
    } = data;

    const queryText = `
      INSERT INTO postnatal_clinic_care (
        patient_id,
        pregnancy_id,
        clinic_id,
        visit_date,
        examined_by,
        breast_problems,
        abnormal_vaginal_discharge,
        excessive_vaginal_bleeding,
        pallor,
        icterus,
        oedema,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        cardiovascular_system,
        respiratory_system,
        abdominal_examination,
        vaginal_examination,
        mental_status_epds,
        other_mental_status,
        problems_identified,
        family_planning_method,
        reason_for_choice,
        clinic_place,
        clinic_date,
        clinic_time,
        special_notes,
        officer_signature,
        designation
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26,
        $27, $28
      )
      RETURNING *
    `;

    const values = [
      patient_id,
      pregnancy_id,
      clinic_id,
      visit_date,
      examined_by,
      breast_problems,
      abnormal_vaginal_discharge,
      excessive_vaginal_bleeding,
      pallor,
      icterus,
      oedema,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      cardiovascular_system,
      respiratory_system,
      abdominal_examination,
      vaginal_examination,
      mental_status_epds,
      other_mental_status,
      problems_identified,
      family_planning_method,
      reason_for_choice,
      clinic_place,
      clinic_date,
      clinic_time,
      special_notes,
      officer_signature,
      designation
    ];

    const result = await query(queryText, values);
    return result.rows[0];
  }

  // Update postnatal record
  static async update(id, data) {
    const {
      visit_date,
      examined_by,
      breast_problems,
      abnormal_vaginal_discharge,
      excessive_vaginal_bleeding,
      pallor,
      icterus,
      oedema,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      cardiovascular_system,
      respiratory_system,
      abdominal_examination,
      vaginal_examination,
      mental_status_epds,
      other_mental_status,
      problems_identified,
      family_planning_method,
      reason_for_choice,
      clinic_place,
      clinic_date,
      clinic_time,
      special_notes,
      officer_signature,
      designation
    } = data;

    const queryText = `
      UPDATE postnatal_clinic_care SET
        visit_date = COALESCE($1, visit_date),
        examined_by = COALESCE($2, examined_by),
        breast_problems = COALESCE($3, breast_problems),
        abnormal_vaginal_discharge = COALESCE($4, abnormal_vaginal_discharge),
        excessive_vaginal_bleeding = COALESCE($5, excessive_vaginal_bleeding),
        pallor = COALESCE($6, pallor),
        icterus = COALESCE($7, icterus),
        oedema = COALESCE($8, oedema),
        blood_pressure_systolic = COALESCE($9, blood_pressure_systolic),
        blood_pressure_diastolic = COALESCE($10, blood_pressure_diastolic),
        cardiovascular_system = COALESCE($11, cardiovascular_system),
        respiratory_system = COALESCE($12, respiratory_system),
        abdominal_examination = COALESCE($13, abdominal_examination),
        vaginal_examination = COALESCE($14, vaginal_examination),
        mental_status_epds = COALESCE($15, mental_status_epds),
        other_mental_status = COALESCE($16, other_mental_status),
        problems_identified = COALESCE($17, problems_identified),
        family_planning_method = COALESCE($18, family_planning_method),
        reason_for_choice = COALESCE($19, reason_for_choice),
        clinic_place = COALESCE($20, clinic_place),
        clinic_date = COALESCE($21, clinic_date),
        clinic_time = COALESCE($22, clinic_time),
        special_notes = COALESCE($23, special_notes),
        officer_signature = COALESCE($24, officer_signature),
        designation = COALESCE($25, designation)
      WHERE id = $26 
        AND is_deleted = false 
        AND deleted_at IS NULL
      RETURNING *
    `;

    const values = [
      visit_date,
      examined_by,
      breast_problems,
      abnormal_vaginal_discharge,
      excessive_vaginal_bleeding,
      pallor,
      icterus,
      oedema,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      cardiovascular_system,
      respiratory_system,
      abdominal_examination,
      vaginal_examination,
      mental_status_epds,
      other_mental_status,
      problems_identified,
      family_planning_method,
      reason_for_choice,
      clinic_place,
      clinic_date,
      clinic_time,
      special_notes,
      officer_signature,
      designation,
      id
    ];

    const result = await query(queryText, values);
    return result.rows[0] || null;
  }

  // Soft delete postnatal record
  static async softDelete(id) {
    const queryText = `
      UPDATE postnatal_clinic_care SET
        is_deleted = true,
        deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 
        AND is_deleted = false 
        AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await query(queryText, [id]);
    return result.rows[0] || null;
  }

  // Hard delete (permanent) - Admin only
  static async hardDelete(id) {
    const queryText = `
      DELETE FROM postnatal_clinic_care
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(queryText, [id]);
    return result.rows[0] || null;
  }
}

module.exports = Postnatal;
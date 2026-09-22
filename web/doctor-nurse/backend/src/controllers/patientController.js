// src/controllers/patientController.js
const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// ============================
// GET ALL PATIENTS WITH SEARCH - NO CLINIC FILTER
// ============================
const getAllPatients = async (req, res) => {
  try {
    const { search = '', status = 'approved', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let searchCondition = '';
    let params = [];
    let paramIndex = 1;

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      searchCondition = `AND (
        p.first_name ILIKE $${paramIndex} OR 
        p.last_name ILIKE $${paramIndex} OR 
        p.nic ILIKE $${paramIndex} OR 
        p.patient_id::text ILIKE $${paramIndex} OR
        CONCAT(p.first_name, ' ', p.last_name) ILIKE $${paramIndex}
      )`;
      params.push(searchTerm);
      paramIndex++;
    }

    let statusCondition = '';
    if (status) {
      statusCondition = `AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM patient p
      WHERE 1=1
      ${statusCondition}
      ${searchCondition}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || 0);

    const dataQuery = `
      SELECT 
        p.patient_id,
        p.first_name,
        p.last_name,
        p.nic,
        p.email,
        p.phone,
        p.dob,
        p.age,
        p.blood_group,
        p.status,
        p.registration_date,
        p.created_at,
        p.address,
        c.clinic_name,
        a.area_name,
        u.full_name as assigned_midwife_name
      FROM patient p
      LEFT JOIN clinics c ON p.clinic_id = c.clinic_id
      LEFT JOIN areas a ON p.area_id = a.area_id
      LEFT JOIN users u ON p.assigned_midwife_id = u.user_id
      WHERE 1=1
      ${statusCondition}
      ${searchCondition}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, parseInt(limit), offset];
    const dataResult = await query(dataQuery, dataParams);

    return successResponse(res, {
      patients: dataResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }, 'Patients retrieved successfully');

  } catch (error) {
    console.error('Error in getAllPatients:', error);
    return errorResponse(res, 'Failed to retrieve patients', 500);
  }
};

// ============================
// GET PATIENT BY ID
// ============================
const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    const queryText = `
      SELECT 
        p.*,
        c.clinic_name,
        a.area_name,
        u.full_name as assigned_midwife_name,
        u.email as midwife_email
      FROM patient p
      LEFT JOIN clinics c ON p.clinic_id = c.clinic_id
      LEFT JOIN areas a ON p.area_id = a.area_id
      LEFT JOIN users u ON p.assigned_midwife_id = u.user_id
      WHERE p.patient_id = $1
    `;

    const result = await query(queryText, [patientId]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Patient not found', 404);
    }

    return successResponse(res, result.rows[0], 'Patient retrieved successfully');

  } catch (error) {
    console.error('Error in getPatientById:', error);
    return errorResponse(res, 'Failed to retrieve patient', 500);
  }
};

// ============================
// UPDATE PATIENT
// ============================
const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      first_name,
      last_name,
      phone,
      email,
      address,
      blood_group,
      allergies,
      emergency_contact_name,
      emergency_contact_phone
    } = req.body;

    const queryText = `
      UPDATE patient SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        email = COALESCE($4, email),
        address = COALESCE($5, address),
        blood_group = COALESCE($6, blood_group),
        allergies = COALESCE($7, allergies),
        emergency_contact_name = COALESCE($8, emergency_contact_name),
        emergency_contact_phone = COALESCE($9, emergency_contact_phone)
      WHERE patient_id = $10
      RETURNING *
    `;

    const values = [
      first_name,
      last_name,
      phone,
      email,
      address,
      blood_group,
      allergies,
      emergency_contact_name,
      emergency_contact_phone,
      patientId
    ];

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Patient not found', 404);
    }

    return successResponse(res, result.rows[0], 'Patient updated successfully');

  } catch (error) {
    console.error('Error in updatePatient:', error);
    return errorResponse(res, 'Failed to update patient', 500);
  }
};

// ============================
// GET PATIENT WITH ALL DATA - FIXED
// ============================
const getPatientWithAllData = async (req, res) => {
  try {
    const { patientId } = req.params;

    // 1. Get Patient Details
    const patientResult = await query(
      `SELECT 
        p.patient_id,
        p.user_id,
        p.assigned_midwife_id,
        p.clinic_id,
        p.area_id,
        p.zone_id,
        p.first_name,
        p.last_name,
        p.nic,
        p.dob,
        p.age,
        p.blood_group,
        p.height_cm,
        p.bmi,
        p.allergies,
        p.phone,
        p.email,
        p.address,
        p.latitude,
        p.longitude,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.emergency_contact_address,
        p.spouse_name,
        p.spouse_age,
        p.patient_education,
        p.spouse_education,
        p.patient_occupation,
        p.spouse_occupation,
        p.age_at_marriage,
        p.phm_area,
        p.moh_area,
        p.grama_niladhari_division,
        p.field_clinic_name,
        p.hospital_clinic_name,
        p.consultant_obstetrician,
        p.registration_date,
        p.created_at,
        p.status,
        p.pregnancy_report_url,
        p.password,
        p.weight_kg,
        p.pregnant_mother_approved_date,
        p.antenatal_risk_conditions,
        c.clinic_name,
        a.area_name,
        u.full_name as assigned_midwife_name,
        u.email as midwife_email
      FROM patient p
      LEFT JOIN clinics c ON p.clinic_id = c.clinic_id
      LEFT JOIN areas a ON p.area_id = a.area_id
      LEFT JOIN users u ON p.assigned_midwife_id = u.user_id
      WHERE p.patient_id = $1`,
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return errorResponse(res, 'Patient not found', 404);
    }

    const patient = patientResult.rows[0];

    // 2. Get Current Pregnancy - FIXED
    const currentPregnancyResult = await query(
      `SELECT 
        pr.pregnancy_id,
        pr.patient_id,
        pr.pregnancy_no,
        pr.registration_number,
        pr.registration_date,
        pr.pregnant_mother_register_number,
        pr.pregnant_mother_register_date,
        pr.assigned_midwife_id,
        pr.clinic_id,
        pr.gravida,
        pr.parity,
        pr.living_children,
        pr.youngest_child_age,
        pr.lmp,
        pr.edd,
        pr.us_corrected_edd,
        pr.expected_delivery_date,
        pr.completion_40_weeks,
        pr.poa_at_registration,
        pr.poa_at_dating_scan,
        pr.quickening_date,
        pr.family_planning_before_pregnancy,
        pr.antenatal_risk_conditions,
        pr.pregnancy_status,
        pr.created_at,
        pr.pregnancy_outcome,
        pr.delivery_date,
        pr.delivery_method,
        pr.mother_condition,
        cps.*
      FROM pregnancy pr
      LEFT JOIN current_pregnancy_status cps ON pr.pregnancy_id = cps.pregnancy_id
      WHERE pr.patient_id = $1 
        AND pr.pregnancy_status = 'ACTIVE'
      ORDER BY pr.created_at DESC
      LIMIT 1`,
      [patientId]
    );

    // 3. Get Previous Pregnancies
    const previousPregnanciesResult = await query(
      `SELECT 
        pr.*,
        (SELECT COUNT(*) FROM past_obstetric_history poh 
         WHERE poh.pregnancy_id = pr.pregnancy_id) as past_history_count
      FROM pregnancy pr
      WHERE pr.patient_id = $1 
        AND pr.pregnancy_status != 'ACTIVE'
      ORDER BY pr.created_at DESC`,
      [patientId]
    );

    // 4. Get Medical History
    const medicalHistoryResult = await query(
      `SELECT * FROM medical_surgical_history 
       WHERE patient_id = $1`,
      [patientId]
    );

    // 5. Get Family History
    const familyHistoryResult = await query(
      `SELECT * FROM family_history 
       WHERE patient_id = $1`,
      [patientId]
    );

    // 6. Get Clinic Visits
    const clinicVisitsResult = await query(
      `SELECT 
        cc.*,
        pr.pregnancy_no
      FROM clinic_care cc
      JOIN pregnancy pr ON cc.pregnancy_id = pr.pregnancy_id
      WHERE pr.patient_id = $1
      ORDER BY cc.visit_date DESC`,
      [patientId]
    );

    // 7. Get Investigations
    const investigationsResult = await query(
      `SELECT 
        ri.*,
        pr.pregnancy_no
      FROM routine_investigations ri
      JOIN pregnancy pr ON ri.pregnancy_id = pr.pregnancy_id
      WHERE pr.patient_id = $1
      ORDER BY ri.created_at DESC`,
      [patientId]
    );

    // 8. Get Birth Plan
    const birthPlanResult = await query(
      `SELECT 
        bp.*,
        pr.pregnancy_no
      FROM birth_plan bp
      JOIN pregnancy pr ON bp.pregnancy_id = pr.pregnancy_id
      WHERE pr.patient_id = $1
      ORDER BY bp.created_at DESC
      LIMIT 1`,
      [patientId]
    );

    // 9. Get Appointments
    const appointmentsResult = await query(
      `SELECT 
        a.appointment_id,
        a.patient_id,
        a.appointment_date,
        a.appointment_time,
        a.appointment_type,
        a.status,
        a.created_at
      FROM appointments a
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [patientId]
    );

    // 10. Get Postnatal Records
    const postnatalResult = await query(
      `SELECT 
        pnc.*,
        pr.pregnancy_no
      FROM postnatal_clinic_care pnc
      LEFT JOIN pregnancy pr ON pnc.pregnancy_id = pr.pregnancy_id
      WHERE pnc.patient_id = $1 
        AND (pnc.is_deleted = false OR pnc.is_deleted IS NULL)
      ORDER BY pnc.visit_date DESC`,
      [patientId]
    );

    // 11. Get Past Obstetric History
    let pastObstetricHistoryResult = { rows: [] };
    try {
      pastObstetricHistoryResult = await query(
        `SELECT 
          poh.*,
          pr.pregnancy_no
        FROM past_obstetric_history poh
        JOIN pregnancy pr ON poh.pregnancy_id = pr.pregnancy_id
        WHERE pr.patient_id = $1
        ORDER BY pr.pregnancy_no, poh.year_of_delivery`,
        [patientId]
      );
    } catch (error) {
      console.warn('⚠️ Past Obstetric History query failed:', error.message);
      pastObstetricHistoryResult = { rows: [] };
    }

    // 12. Get PNC Visits
    let pncVisitsResult = { rows: [] };
    try {
      pncVisitsResult = await query(
        `SELECT 
          pv.*,
          pr.pregnancy_no
        FROM pnc_visits pv
        JOIN pregnancy pr ON pv.pregnancy_id = pr.pregnancy_id
        WHERE pr.patient_id = $1
        ORDER BY pv.visit_date DESC`,
        [patientId]
      );
    } catch (error) {
      console.warn('⚠️ PNC Visits query failed:', error.message);
      pncVisitsResult = { rows: [] };
    }

    // 13. Get Previous Pregnancies with full details
    const previousPregnanciesFullResult = await query(
      `SELECT 
        pr.pregnancy_id,
        pr.patient_id,
        pr.pregnancy_no,
        pr.registration_number,
        pr.registration_date,
        pr.pregnant_mother_register_number,
        pr.pregnant_mother_register_date,
        pr.assigned_midwife_id,
        pr.clinic_id,
        pr.gravida,
        pr.parity,
        pr.living_children,
        pr.youngest_child_age,
        pr.lmp,
        pr.edd,
        pr.us_corrected_edd,
        pr.expected_delivery_date,
        pr.completion_40_weeks,
        pr.poa_at_registration,
        pr.poa_at_dating_scan,
        pr.quickening_date,
        pr.family_planning_before_pregnancy,
        pr.antenatal_risk_conditions,
        pr.pregnancy_status,
        pr.created_at,
        pr.pregnancy_outcome,
        pr.delivery_date,
        pr.delivery_method,
        pr.mother_condition,
        (SELECT COUNT(*) FROM past_obstetric_history poh 
         WHERE poh.pregnancy_id = pr.pregnancy_id) as past_history_count,
        u.full_name as midwife_name
      FROM pregnancy pr
      LEFT JOIN users u ON pr.assigned_midwife_id = u.user_id
      WHERE pr.patient_id = $1 
        AND pr.pregnancy_status != 'ACTIVE'
      ORDER BY pr.pregnancy_no ASC`,
      [patientId]
    );

    return successResponse(res, {
      patient,
      currentPregnancy: currentPregnancyResult.rows[0] || null,
      previousPregnancies: previousPregnanciesFullResult.rows,
      medicalHistory: medicalHistoryResult.rows[0] || null,
      familyHistory: familyHistoryResult.rows[0] || null,
      clinicVisits: clinicVisitsResult.rows,
      investigations: investigationsResult.rows,
      birthPlan: birthPlanResult.rows[0] || null,
      appointments: appointmentsResult.rows,
      postnatalRecords: postnatalResult.rows,
      pncVisits: pncVisitsResult.rows,
      pastObstetricHistory: pastObstetricHistoryResult.rows
    }, 'Patient data retrieved successfully');

  } catch (error) {
    console.error('❌ Error in getPatientWithAllData:', error);
    return errorResponse(res, 'Failed to retrieve patient data', 500);
  }
};

// ============================
// UPDATE CURRENT PREGNANCY
// ============================
const updateCurrentPregnancy = async (req, res) => {
  try {
    const { pregnancyId } = req.params;
    const {
      registration_number,
      registration_date,
      pregnant_mother_register_number,
      pregnant_mother_register_date,
      gravida,
      parity,
      living_children,
      youngest_child_age,
      lmp,
      edd,
      us_corrected_edd,
      expected_delivery_date,
      completion_40_weeks,
      poa_at_registration,
      poa_at_dating_scan,
      quickening_date,
      family_planning_before_pregnancy,
      antenatal_risk_conditions,
      pregnancy_status,
      pregnancy_outcome,
      delivery_date,
      delivery_method,
      mother_condition
    } = req.body;

    const queryText = `
      UPDATE pregnancy SET
        registration_number = COALESCE($1, registration_number),
        registration_date = COALESCE($2, registration_date),
        pregnant_mother_register_number = COALESCE($3, pregnant_mother_register_number),
        pregnant_mother_register_date = COALESCE($4, pregnant_mother_register_date),
        gravida = COALESCE($5, gravida),
        parity = COALESCE($6, parity),
        living_children = COALESCE($7, living_children),
        youngest_child_age = COALESCE($8, youngest_child_age),
        lmp = COALESCE($9, lmp),
        edd = COALESCE($10, edd),
        us_corrected_edd = COALESCE($11, us_corrected_edd),
        expected_delivery_date = COALESCE($12, expected_delivery_date),
        completion_40_weeks = COALESCE($13, completion_40_weeks),
        poa_at_registration = COALESCE($14, poa_at_registration),
        poa_at_dating_scan = COALESCE($15, poa_at_dating_scan),
        quickening_date = COALESCE($16, quickening_date),
        family_planning_before_pregnancy = COALESCE($17, family_planning_before_pregnancy),
        antenatal_risk_conditions = COALESCE($18, antenatal_risk_conditions),
        pregnancy_status = COALESCE($19, pregnancy_status),
        pregnancy_outcome = COALESCE($20, pregnancy_outcome),
        delivery_date = COALESCE($21, delivery_date),
        delivery_method = COALESCE($22, delivery_method),
        mother_condition = COALESCE($23, mother_condition)
      WHERE pregnancy_id = $24
      RETURNING *
    `;

    const values = [
      registration_number,
      registration_date,
      pregnant_mother_register_number,
      pregnant_mother_register_date,
      gravida,
      parity,
      living_children,
      youngest_child_age,
      lmp,
      edd,
      us_corrected_edd,
      expected_delivery_date,
      completion_40_weeks,
      poa_at_registration,
      poa_at_dating_scan,
      quickening_date,
      family_planning_before_pregnancy,
      antenatal_risk_conditions,
      pregnancy_status,
      pregnancy_outcome,
      delivery_date,
      delivery_method,
      mother_condition,
      pregnancyId
    ];

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Pregnancy not found', 404);
    }

    return successResponse(res, result.rows[0], 'Pregnancy updated successfully');

  } catch (error) {
    console.error('Error in updateCurrentPregnancy:', error);
    return errorResponse(res, 'Failed to update pregnancy', 500);
  }
};

// ============================
// UPDATE MEDICAL HISTORY
// ============================
const updateMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      diabetes,
      hypertension,
      cardiac_disease,
      renal_disease,
      thyroid_disease,
      bronchial_asthma,
      epilepsy,
      psychiatric_illness,
      tuberculosis,
      malignancy,
      previous_dvt,
      previous_surgeries,
      blood_transfusion_history,
      drug_allergies,
      other_conditions
    } = req.body;

    const checkResult = await query(
      `SELECT history_id FROM medical_surgical_history WHERE patient_id = $1`,
      [patientId]
    );

    let result;

    if (checkResult.rows.length > 0) {
      const queryText = `
        UPDATE medical_surgical_history SET
          diabetes = COALESCE($1, diabetes),
          hypertension = COALESCE($2, hypertension),
          cardiac_disease = COALESCE($3, cardiac_disease),
          renal_disease = COALESCE($4, renal_disease),
          thyroid_disease = COALESCE($5, thyroid_disease),
          bronchial_asthma = COALESCE($6, bronchial_asthma),
          epilepsy = COALESCE($7, epilepsy),
          psychiatric_illness = COALESCE($8, psychiatric_illness),
          tuberculosis = COALESCE($9, tuberculosis),
          malignancy = COALESCE($10, malignancy),
          previous_dvt = COALESCE($11, previous_dvt),
          previous_surgeries = COALESCE($12, previous_surgeries),
          blood_transfusion_history = COALESCE($13, blood_transfusion_history),
          drug_allergies = COALESCE($14, drug_allergies),
          other_conditions = COALESCE($15, other_conditions)
        WHERE patient_id = $16
        RETURNING *
      `;
      const values = [
        diabetes, hypertension, cardiac_disease, renal_disease,
        thyroid_disease, bronchial_asthma, epilepsy, psychiatric_illness,
        tuberculosis, malignancy, previous_dvt, previous_surgeries,
        blood_transfusion_history, drug_allergies, other_conditions,
        patientId
      ];
      result = await query(queryText, values);
    } else {
      const queryText = `
        INSERT INTO medical_surgical_history (
          patient_id, diabetes, hypertension, cardiac_disease,
          renal_disease, thyroid_disease, bronchial_asthma,
          epilepsy, psychiatric_illness, tuberculosis,
          malignancy, previous_dvt, previous_surgeries,
          blood_transfusion_history, drug_allergies,
          other_conditions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `;
      const values = [
        patientId, diabetes, hypertension, cardiac_disease,
        renal_disease, thyroid_disease, bronchial_asthma,
        epilepsy, psychiatric_illness, tuberculosis,
        malignancy, previous_dvt, previous_surgeries,
        blood_transfusion_history, drug_allergies,
        other_conditions
      ];
      result = await query(queryText, values);
    }

    return successResponse(res, result.rows[0], 'Medical history updated successfully');

  } catch (error) {
    console.error('Error in updateMedicalHistory:', error);
    return errorResponse(res, 'Failed to update medical history', 500);
  }
};

// ============================
// UPDATE FAMILY HISTORY
// ============================
const updateFamilyHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      diabetes,
      hypertension,
      twin_pregnancies,
      congenital_disorders,
      thalassemia,
      sickle_cell_disease,
      genetic_disorders,
      psychiatric_illness,
      other_conditions
    } = req.body;

    const checkResult = await query(
      `SELECT history_id FROM family_history WHERE patient_id = $1`,
      [patientId]
    );

    let result;

    if (checkResult.rows.length > 0) {
      const queryText = `
        UPDATE family_history SET
          diabetes = COALESCE($1, diabetes),
          hypertension = COALESCE($2, hypertension),
          twin_pregnancies = COALESCE($3, twin_pregnancies),
          congenital_disorders = COALESCE($4, congenital_disorders),
          thalassemia = COALESCE($5, thalassemia),
          sickle_cell_disease = COALESCE($6, sickle_cell_disease),
          genetic_disorders = COALESCE($7, genetic_disorders),
          psychiatric_illness = COALESCE($8, psychiatric_illness),
          other_conditions = COALESCE($9, other_conditions)
        WHERE patient_id = $10
        RETURNING *
      `;
      const values = [
        diabetes, hypertension, twin_pregnancies,
        congenital_disorders, thalassemia, sickle_cell_disease,
        genetic_disorders, psychiatric_illness, other_conditions,
        patientId
      ];
      result = await query(queryText, values);
    } else {
      const queryText = `
        INSERT INTO family_history (
          patient_id, diabetes, hypertension, twin_pregnancies,
          congenital_disorders, thalassemia, sickle_cell_disease,
          genetic_disorders, psychiatric_illness, other_conditions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const values = [
        patientId, diabetes, hypertension, twin_pregnancies,
        congenital_disorders, thalassemia, sickle_cell_disease,
        genetic_disorders, psychiatric_illness, other_conditions
      ];
      result = await query(queryText, values);
    }

    return successResponse(res, result.rows[0], 'Family history updated successfully');

  } catch (error) {
    console.error('Error in updateFamilyHistory:', error);
    return errorResponse(res, 'Failed to update family history', 500);
  }
};

// ============================
// EXPORT ALL FUNCTIONS
// ============================
module.exports = {
  getAllPatients,
  getPatientById,
  updatePatient,
  getPatientWithAllData,
  updateCurrentPregnancy,
  updateMedicalHistory,
  updateFamilyHistory
};
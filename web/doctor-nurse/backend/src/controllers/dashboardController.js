// src/controllers/dashboardController.js
const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// ============================
// DOCTOR DASHBOARD - OLD VERSION (ALL DATA)
// ============================
const getDoctorDashboard = async (req, res) => {
  try {
    // 1. Total Patients (ALL approved - no clinic filter)
    const totalPatientsResult = await query(
      `SELECT COUNT(*) as count FROM patient WHERE status = 'approved'`
    );

    // 2. Today's Clinic Visits (ALL)
    const todayVisitsResult = await query(
      `SELECT COUNT(*) as count FROM clinic_care 
       WHERE visit_date = CURRENT_DATE`
    );

    // 3. Upcoming Clinic Visits (ALL)
    const upcomingVisitsResult = await query(
      `SELECT COUNT(*) as count FROM clinic_care 
       WHERE visit_date > CURRENT_DATE`
    );

    // 4. Active Pregnancies (ALL)
    const activePregnanciesResult = await query(
      `SELECT COUNT(*) as count FROM pregnancy 
       WHERE pregnancy_status = 'ACTIVE'`
    );

    // 5. High Risk Pregnancies (ALL)
    const highRiskPregnanciesResult = await query(
      `SELECT COUNT(*) as count FROM pregnancy 
       WHERE pregnancy_status = 'ACTIVE' 
       AND antenatal_risk_conditions IS NOT NULL 
       AND antenatal_risk_conditions != ''`
    );

    // 6. Visit Status (Pie Chart) - ALL
    const visitStatusResult = await query(
      `SELECT 
         CASE 
           WHEN visit_date < CURRENT_DATE THEN 'Completed'
           WHEN visit_date = CURRENT_DATE THEN 'Today'
           ELSE 'Upcoming'
         END as status,
         COUNT(*) as count
       FROM clinic_care
       GROUP BY status`
    );

    // 7. Pregnancy Risk (Bar Chart) - ALL
    const pregnancyRiskResult = await query(
      `SELECT 
         CASE 
           WHEN antenatal_risk_conditions IS NOT NULL AND antenatal_risk_conditions != '' THEN 'High Risk'
           ELSE 'Normal'
         END as risk_type,
         COUNT(*) as count
       FROM pregnancy
       WHERE pregnancy_status = 'ACTIVE'
       GROUP BY risk_type`
    );

    // 8. Upcoming Visits List - ALL
    const upcomingListResult = await query(
      `SELECT 
         CONCAT(pt.first_name, ' ', pt.last_name) as patient_name,
         cc.visit_date as date,
         cc.poa,
         COALESCE(c.clinic_name, 'No Clinic') as clinic,
         'Upcoming' as status
       FROM clinic_care cc
       JOIN pregnancy p ON cc.pregnancy_id = p.pregnancy_id
       JOIN patient pt ON p.patient_id = pt.patient_id
       LEFT JOIN clinics c ON pt.clinic_id = c.clinic_id
       WHERE cc.visit_date > CURRENT_DATE
       ORDER BY cc.visit_date ASC
       LIMIT 10`
    );

    // 9. Today's Visits List - ALL
    const todayListResult = await query(
      `SELECT 
         CONCAT(pt.first_name, ' ', pt.last_name) as patient_name,
         cc.visit_date as date,
         cc.poa,
         COALESCE(c.clinic_name, 'No Clinic') as clinic,
         'Today' as status
       FROM clinic_care cc
       JOIN pregnancy p ON cc.pregnancy_id = p.pregnancy_id
       JOIN patient pt ON p.patient_id = pt.patient_id
       LEFT JOIN clinics c ON pt.clinic_id = c.clinic_id
       WHERE cc.visit_date = CURRENT_DATE
       ORDER BY cc.visit_date ASC
       LIMIT 10`
    );

    // 10. Completed Visits List - ALL
    const completedListResult = await query(
      `SELECT 
         CONCAT(pt.first_name, ' ', pt.last_name) as patient_name,
         cc.visit_date as date,
         cc.poa,
         COALESCE(c.clinic_name, 'No Clinic') as clinic,
         'Completed' as status
       FROM clinic_care cc
       JOIN pregnancy p ON cc.pregnancy_id = p.pregnancy_id
       JOIN patient pt ON p.patient_id = pt.patient_id
       LEFT JOIN clinics c ON pt.clinic_id = c.clinic_id
       WHERE cc.visit_date < CURRENT_DATE
       ORDER BY cc.visit_date DESC
       LIMIT 10`
    );

    const stats = {
      totalPatients: parseInt(totalPatientsResult.rows[0]?.count || 0),
      todayVisits: parseInt(todayVisitsResult.rows[0]?.count || 0),
      upcomingVisits: parseInt(upcomingVisitsResult.rows[0]?.count || 0),
      activePregnancies: parseInt(activePregnanciesResult.rows[0]?.count || 0),
      highRiskPregnancies: parseInt(highRiskPregnanciesResult.rows[0]?.count || 0),
    };

    const visitStatus = visitStatusResult.rows.map(row => ({
      name: row.status || 'Unknown',
      value: parseInt(row.count)
    }));

    const pregnancyRisk = pregnancyRiskResult.rows.map(row => ({
      name: row.risk_type || 'Unknown',
      count: parseInt(row.count)
    }));

    return successResponse(res, {
      stats,
      visitStatus: visitStatus.length > 0 ? visitStatus : [
        { name: 'Upcoming', value: 0 },
        { name: 'Today', value: 0 },
        { name: 'Completed', value: 0 }
      ],
      pregnancyRisk: pregnancyRisk.length > 0 ? pregnancyRisk : [
        { name: 'Normal', count: 0 },
        { name: 'High Risk', count: 0 }
      ],
      upcomingVisits: upcomingListResult.rows,
      todayVisits: todayListResult.rows,
      completedVisits: completedListResult.rows
    }, 'Doctor dashboard data retrieved successfully');

  } catch (error) {
    console.error('Error in getDoctorDashboard:', error);
    return errorResponse(res, 'Failed to retrieve dashboard data', 500);
  }
};

// ============================
// NURSE DASHBOARD - OLD VERSION (ALL DATA)
// ============================
const getNurseDashboard = async (req, res) => {
  try {
    const totalPatientsResult = await query(
      `SELECT COUNT(*) as count FROM patient WHERE status = 'approved'`
    );

    const todayVisitsResult = await query(
      `SELECT COUNT(*) as count FROM clinic_care 
       WHERE visit_date = CURRENT_DATE`
    );

    const upcomingVisitsResult = await query(
      `SELECT COUNT(*) as count FROM clinic_care 
       WHERE visit_date > CURRENT_DATE`
    );

    const activePregnanciesResult = await query(
      `SELECT COUNT(*) as count FROM pregnancy 
       WHERE pregnancy_status = 'ACTIVE'`
    );

    const highRiskPregnanciesResult = await query(
      `SELECT COUNT(*) as count FROM pregnancy 
       WHERE pregnancy_status = 'ACTIVE' 
       AND antenatal_risk_conditions IS NOT NULL 
       AND antenatal_risk_conditions != ''`
    );

    const visitStatusResult = await query(
      `SELECT 
         CASE 
           WHEN visit_date < CURRENT_DATE THEN 'Completed'
           WHEN visit_date = CURRENT_DATE THEN 'Today'
           ELSE 'Upcoming'
         END as status,
         COUNT(*) as count
       FROM clinic_care
       GROUP BY status`
    );

    const pregnancyRiskResult = await query(
      `SELECT 
         CASE 
           WHEN antenatal_risk_conditions IS NOT NULL AND antenatal_risk_conditions != '' THEN 'High Risk'
           ELSE 'Normal'
         END as risk_type,
         COUNT(*) as count
       FROM pregnancy
       WHERE pregnancy_status = 'ACTIVE'
       GROUP BY risk_type`
    );

    const upcomingListResult = await query(
      `SELECT 
         CONCAT(pt.first_name, ' ', pt.last_name) as patient_name,
         cc.visit_date as date,
         cc.poa,
         COALESCE(c.clinic_name, 'No Clinic') as clinic,
         'Upcoming' as status
       FROM clinic_care cc
       JOIN pregnancy p ON cc.pregnancy_id = p.pregnancy_id
       JOIN patient pt ON p.patient_id = pt.patient_id
       LEFT JOIN clinics c ON pt.clinic_id = c.clinic_id
       WHERE cc.visit_date > CURRENT_DATE
       ORDER BY cc.visit_date ASC
       LIMIT 10`
    );

    const todayListResult = await query(
      `SELECT 
         CONCAT(pt.first_name, ' ', pt.last_name) as patient_name,
         cc.visit_date as date,
         cc.poa,
         COALESCE(c.clinic_name, 'No Clinic') as clinic,
         'Today' as status
       FROM clinic_care cc
       JOIN pregnancy p ON cc.pregnancy_id = p.pregnancy_id
       JOIN patient pt ON p.patient_id = pt.patient_id
       LEFT JOIN clinics c ON pt.clinic_id = c.clinic_id
       WHERE cc.visit_date = CURRENT_DATE
       ORDER BY cc.visit_date ASC
       LIMIT 10`
    );

    const completedListResult = await query(
      `SELECT 
         CONCAT(pt.first_name, ' ', pt.last_name) as patient_name,
         cc.visit_date as date,
         cc.poa,
         COALESCE(c.clinic_name, 'No Clinic') as clinic,
         'Completed' as status
       FROM clinic_care cc
       JOIN pregnancy p ON cc.pregnancy_id = p.pregnancy_id
       JOIN patient pt ON p.patient_id = pt.patient_id
       LEFT JOIN clinics c ON pt.clinic_id = c.clinic_id
       WHERE cc.visit_date < CURRENT_DATE
       ORDER BY cc.visit_date DESC
       LIMIT 10`
    );

    const stats = {
      totalPatients: parseInt(totalPatientsResult.rows[0]?.count || 0),
      todayVisits: parseInt(todayVisitsResult.rows[0]?.count || 0),
      upcomingVisits: parseInt(upcomingVisitsResult.rows[0]?.count || 0),
      activePregnancies: parseInt(activePregnanciesResult.rows[0]?.count || 0),
      highRiskPregnancies: parseInt(highRiskPregnanciesResult.rows[0]?.count || 0),
    };

    const visitStatus = visitStatusResult.rows.map(row => ({
      name: row.status || 'Unknown',
      value: parseInt(row.count)
    }));

    const pregnancyRisk = pregnancyRiskResult.rows.map(row => ({
      name: row.risk_type || 'Unknown',
      count: parseInt(row.count)
    }));

    return successResponse(res, {
      stats,
      visitStatus,
      pregnancyRisk,
      upcomingVisits: upcomingListResult.rows,
      todayVisits: todayListResult.rows,
      completedVisits: completedListResult.rows
    }, 'Nurse dashboard data retrieved successfully');

  } catch (error) {
    console.error('Error in getNurseDashboard:', error);
    return errorResponse(res, 'Failed to retrieve nurse dashboard data', 500);
  }
};

// ============================
// GET CLINIC VISIT TYPES - OLD VERSION
// ============================
const getClinicVisitTypes = async (req, res) => {
  try {
    const antenatalResult = await query(
      `SELECT COUNT(*) as count FROM clinic_care`
    );

    const postnatalResult = await query(
      `SELECT COUNT(*) as count FROM postnatal_clinic_care 
       WHERE (is_deleted = false OR is_deleted IS NULL)`
    );

    const antenatalPatientsResult = await query(
      `SELECT COUNT(DISTINCT patient_id) as count 
       FROM clinic_care cc
       JOIN pregnancy p ON cc.pregnancy_id = p.pregnancy_id`
    );

    const postnatalPatientsResult = await query(
      `SELECT COUNT(DISTINCT patient_id) as count 
       FROM postnatal_clinic_care 
       WHERE (is_deleted = false OR is_deleted IS NULL)`
    );

    const data = [
      {
        name: 'Antenatal Clinic Visit',
        value: parseInt(antenatalResult.rows[0]?.count || 0),
        patients: parseInt(antenatalPatientsResult.rows[0]?.count || 0),
        description: 'Pregnancy period clinic visits',
        color: '#f48fb1'
      },
      {
        name: 'Postnatal Clinic Visit',
        value: parseInt(postnatalResult.rows[0]?.count || 0),
        patients: parseInt(postnatalPatientsResult.rows[0]?.count || 0),
        description: 'After delivery clinic visits',
        color: '#f06292'
      }
    ];

    return successResponse(res, data, 'Clinic visit types retrieved successfully');

  } catch (error) {
    console.error('Error in getClinicVisitTypes:', error);
    return errorResponse(res, 'Failed to retrieve clinic visit types', 500);
  }
};

// ============================
// GET STATS ONLY - OLD VERSION
// ============================
const getStats = async (req, res) => {
  try {
    const totalPatientsResult = await query(
      `SELECT COUNT(*) as count FROM patient WHERE status = 'approved'`
    );

    const todayVisitsResult = await query(
      `SELECT COUNT(*) as count FROM clinic_care 
       WHERE visit_date = CURRENT_DATE`
    );

    const upcomingVisitsResult = await query(
      `SELECT COUNT(*) as count FROM clinic_care 
       WHERE visit_date > CURRENT_DATE`
    );

    const stats = {
      totalPatients: parseInt(totalPatientsResult.rows[0]?.count || 0),
      todayVisits: parseInt(todayVisitsResult.rows[0]?.count || 0),
      upcomingVisits: parseInt(upcomingVisitsResult.rows[0]?.count || 0),
    };

    return successResponse(res, stats, 'Stats retrieved successfully');

  } catch (error) {
    console.error('Error in getStats:', error);
    return errorResponse(res, 'Failed to retrieve stats', 500);
  }
};

module.exports = {
  getDoctorDashboard,
  getNurseDashboard,
  getClinicVisitTypes,
  getStats
};
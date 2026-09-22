// src/validations/postnatalValidation.js
const Joi = require('joi');

const createPostnatalSchema = Joi.object({
  patient_id: Joi.number().integer().positive().required(),
  pregnancy_id: Joi.number().integer().positive().allow(null),  
  clinic_id: Joi.number().integer().positive().allow(null),
  visit_date: Joi.date().required(),
  examined_by: Joi.string().max(255).allow(null, ''),
  breast_problems: Joi.string().max(255).allow(null, ''),
  abnormal_vaginal_discharge: Joi.string().max(255).allow(null, ''),
  excessive_vaginal_bleeding: Joi.string().max(255).allow(null, ''),
  pallor: Joi.string().max(50).allow(null, ''),
  icterus: Joi.string().max(50).allow(null, ''),
  oedema: Joi.string().max(50).allow(null, ''),
  blood_pressure_systolic: Joi.number().integer().min(60).max(250).allow(null),
  blood_pressure_diastolic: Joi.number().integer().min(40).max(160).allow(null),
  cardiovascular_system: Joi.string().allow(null, ''),
  respiratory_system: Joi.string().allow(null, ''),
  abdominal_examination: Joi.string().allow(null, ''),
  vaginal_examination: Joi.string().allow(null, ''),
  mental_status_epds: Joi.string().max(50).allow(null, ''),
  other_mental_status: Joi.string().allow(null, ''),
  problems_identified: Joi.string().allow(null, ''),
  family_planning_method: Joi.string().max(255).allow(null, ''),
  reason_for_choice: Joi.string().allow(null, ''),
  clinic_place: Joi.string().max(255).allow(null, ''),
  clinic_date: Joi.date().allow(null),
  clinic_time: Joi.string().allow(null, ''),
  special_notes: Joi.string().allow(null, ''),
  officer_signature: Joi.string().allow(null, ''),
  designation: Joi.string().max(255).allow(null, '')
});

const updatePostnatalSchema = Joi.object({
  visit_date: Joi.date().allow(null),
  examined_by: Joi.string().max(255).allow(null, ''),
  breast_problems: Joi.string().max(255).allow(null, ''),
  abnormal_vaginal_discharge: Joi.string().max(255).allow(null, ''),
  excessive_vaginal_bleeding: Joi.string().max(255).allow(null, ''),
  pallor: Joi.string().max(50).allow(null, ''),
  icterus: Joi.string().max(50).allow(null, ''),
  oedema: Joi.string().max(50).allow(null, ''),
  blood_pressure_systolic: Joi.number().integer().min(60).max(250).allow(null),
  blood_pressure_diastolic: Joi.number().integer().min(40).max(160).allow(null),
  cardiovascular_system: Joi.string().allow(null, ''),
  respiratory_system: Joi.string().allow(null, ''),
  abdominal_examination: Joi.string().allow(null, ''),
  vaginal_examination: Joi.string().allow(null, ''),
  mental_status_epds: Joi.string().max(50).allow(null, ''),
  other_mental_status: Joi.string().allow(null, ''),
  problems_identified: Joi.string().allow(null, ''),
  family_planning_method: Joi.string().max(255).allow(null, ''),
  reason_for_choice: Joi.string().allow(null, ''),
  clinic_place: Joi.string().max(255).allow(null, ''),
  clinic_date: Joi.date().allow(null),
  clinic_time: Joi.string().allow(null, ''),
  special_notes: Joi.string().allow(null, ''),
  officer_signature: Joi.string().allow(null, ''),
  designation: Joi.string().max(255).allow(null, '')
});

const validateCreate = (data) => {
  return createPostnatalSchema.validate(data, { abortEarly: false });
};

const validateUpdate = (data) => {
  return updatePostnatalSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreate,
  validateUpdate
};
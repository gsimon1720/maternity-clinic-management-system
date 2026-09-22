 import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) return next();
    const { error } = schema.validate(req.body || {}, { abortEarly: false, allowUnknown: true });
    if (error) {
      console.error('Validation error details for', req.method, req.originalUrl, error.details);
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      const detailedMsg = errors.map(e => `${e.field}: ${e.message}`).join('; ');
      return res.status(400).json({ success: false, message: `Validation failed - ${detailedMsg}`, errors });
    }
    next();
  };
};

export const schemas = {
  login: Joi.object().unknown(true),
  changePassword: Joi.object().unknown(true),
  updateProfile: Joi.object().unknown(true),
  registerClinic: Joi.object().unknown(true),
  registerStaff: Joi.object().unknown(true),
  updateClinic: Joi.object().unknown(true),
  addClinicAdmin: Joi.object().unknown(true),
  updateUser: Joi.object().unknown(true),
  createUser: Joi.object().unknown(true)
};

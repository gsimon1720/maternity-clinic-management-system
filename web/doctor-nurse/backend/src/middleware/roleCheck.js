// src/middleware/roleCheck.js
const { errorResponse } = require('../utils/responseHandler');

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied. Insufficient permissions', 403);
    }

    next();
  };
};

const isDoctor = authorize(['DOCTOR', 'SUPER_ADMIN', 'CLINIC_ADMIN']);
const isNurse = authorize(['NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']);
const isDoctorOrNurse = authorize(['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'CLINIC_ADMIN']);
const isAdmin = authorize(['SUPER_ADMIN', 'CLINIC_ADMIN']);

module.exports = {
  authorize,
  isDoctor,
  isNurse,
  isDoctorOrNurse,
  isAdmin
};
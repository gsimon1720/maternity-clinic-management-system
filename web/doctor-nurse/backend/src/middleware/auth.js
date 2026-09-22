// src/middleware/auth.js
const { verifyToken } = require('../utils/jwtUtils');
const { errorResponse } = require('../utils/responseHandler');

const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 'Invalid or expired token', 401);
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      clinicId: decoded.clinicId,
      areaId: decoded.areaId
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 401);
  }
};

module.exports = {
  authenticate
};
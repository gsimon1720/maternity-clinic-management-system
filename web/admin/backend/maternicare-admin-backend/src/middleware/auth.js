import { getMockUser, isMockToken, verifyToken } from '../config/jwt.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);

      req.user = {
        user_id: decoded.user_id,
        full_name: decoded.full_name || '',
        email: decoded.email || '',
        nic: decoded.nic || '',
        user_type: (decoded.user_type || decoded.role || 'super_admin').toLowerCase(),
        clinic_id: decoded.clinic_id ? parseInt(decoded.clinic_id, 10) : null
      };

      return next();
    } catch (error) {
      if (isMockToken(token)) {
        req.user = getMockUser();
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

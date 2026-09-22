// src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      clinicId: user.clinic_id,
      areaId: user.area_id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
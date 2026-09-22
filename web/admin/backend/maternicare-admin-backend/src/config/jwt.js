import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const isMockToken = (token) =>
  typeof token === 'string' && token.startsWith('mock-jwt-token-');

export const getMockUser = () => ({
  user_id: 1,
  full_name: 'Super Admin',
  email: 'superadmin@maternicare.com',
  user_type: 'super_admin',
  clinic_id: null
});

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  if (isMockToken(token)) {
    return getMockUser();
  }

  return jwt.verify(token, JWT_SECRET);
};

export { JWT_SECRET, JWT_EXPIRES_IN };

// src/controllers/authController.js
const { query } = require('../config/database');
const { comparePassword, hashPassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Find user by email
    const result = await query(
      `SELECT 
        user_id,
        email,
        password_hash,
        role,
        clinic_id,
        area_id,
        full_name,
        status,
        username
      FROM users
      WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return errorResponse(res, 'Account is not active. Please contact admin', 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      clinic_id: user.clinic_id,
      area_id: user.area_id
    });

    // Update last_login
    await query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1`,
      [user.user_id]
    );

    // Return user data (without password)
    const userData = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      username: user.username,
      clinicId: user.clinic_id,
      areaId: user.area_id
    };

    return successResponse(res, {
      user: userData,
      token
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        user_id,
        email,
        role,
        full_name,
        username,
        clinic_id,
        area_id,
        status
      FROM users
      WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, result.rows[0], 'User retrieved successfully');
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 'Failed to get user', 500);
  }
};

// Logout (client side will remove token)
const logout = (req, res) => {
  return successResponse(res, null, 'Logged out successfully');
};

module.exports = {
  login,
  getCurrentUser,
  logout
};
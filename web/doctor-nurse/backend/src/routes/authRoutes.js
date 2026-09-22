// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, getCurrentUser, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
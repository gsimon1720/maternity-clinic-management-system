// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./config/database');

const app = express();

// ============ Middleware ============
// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ Database Connection Test ============
(async () => {
  await testConnection();
})();

// ============ Routes ============

const authRoutes = require('./routes/authRoutes');
const postnatalRoutes = require('./routes/postnatalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const patientRoutes = require('./routes/patientRoutes');
const clinicCareRoutes = require('./routes/clinicCareRoutes');





// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/postnatal', postnatalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/clinic-visits', clinicCareRoutes); 

// Base route
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Maternity Clinic Management System API',
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ============ Error Handling ============
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============ Start Server ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});

module.exports = app;
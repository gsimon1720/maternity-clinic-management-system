// src/config/database.js
const { Pool } = require('pg');

// Supabase PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  
  }
});

// Connection test function
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('📅 Server time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Query helper function
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
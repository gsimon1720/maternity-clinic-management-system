const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ Supabase connection failed:", err.message);
  } else {
    console.log("✅ Connected to Supabase PostgreSQL");
    console.log(result.rows);
  }
});

module.exports = pool;
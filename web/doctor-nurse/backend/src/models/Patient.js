// src/models/Patient.js
const { query } = require('../config/database');

class Patient {
  static async getById(id) {
    const result = await query(
      'SELECT patient_id, first_name, last_name, nic, status FROM patient WHERE patient_id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = Patient;
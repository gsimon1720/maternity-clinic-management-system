// src/models/Pregnancy.js
const { query } = require('../config/database');

class Pregnancy {
  static async getById(id) {
    const result = await query(
      'SELECT pregnancy_id, patient_id, pregnancy_no, pregnancy_status FROM pregnancy WHERE pregnancy_id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = Pregnancy;
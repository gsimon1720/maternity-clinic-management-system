import { qualificationService } from '../services/qualificationService.js';

export const qualificationController = {
  getQualifications: async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
      }

      const result = await qualificationService.getQualificationsByUserId(userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  addQualification: async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
      }

      const result = await qualificationService.createQualification(userId, req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateQualification: async (req, res) => {
    try {
      const qualificationId = parseInt(req.params.qualificationId, 10);
      if (isNaN(qualificationId)) {
        return res.status(400).json({ success: false, message: 'Invalid qualification ID' });
      }

      const result = await qualificationService.updateQualification(qualificationId, req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteQualification: async (req, res) => {
    try {
      const qualificationId = parseInt(req.params.qualificationId, 10);
      if (isNaN(qualificationId)) {
        return res.status(400).json({ success: false, message: 'Invalid qualification ID' });
      }

      const result = await qualificationService.deleteQualification(qualificationId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

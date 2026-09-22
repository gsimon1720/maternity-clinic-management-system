import { staffService } from '../services/staffService.js';
import {
  assertCanManageUser,
  assertOwnClinic,
  isClinicAdmin,
} from '../utils/clinicAccess.js';
import { formatUser } from '../utils/formatters.js';

export const staffController = {
  registerStaff: async (req, res) => {
    try {
      const data = {
        clinic_id: isClinicAdmin(req.user)
          ? req.user.clinic_id
          : parseInt(req.body.clinic_id, 10),
        user_type: req.body.user_type,
        full_name: req.body.full_name,
        email: req.body.email,
        password: req.body.password,
        nic: req.body.nic,
        phone: req.body.phone,
        address: req.body.address,
        license_number: req.body.license_number,
        specialization: req.body.specialization,
        qualifications: req.body.qualifications,
        years_of_experience: req.body.years_of_experience
          ? parseInt(req.body.years_of_experience, 10)
          : null,
        department: req.body.department,
      };

      if (!data.clinic_id) {
        return res.status(400).json({
          success: false,
          message: 'Clinic is required',
        });
      }

      const result = await staffService.registerStaff(data);
      if (!result.success) return res.status(400).json(result);

      return res.status(201).json({
        success: true,
        data: formatUser(result.data),
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getStaffByClinic: async (req, res) => {
    try {
      const { clinic_id } = req.params;
      const clinicId = parseInt(clinic_id, 10);

      const denied = assertOwnClinic(req, clinicId);
      if (denied) return res.status(denied.status).json(denied.body);

      const statusFilter = req.query.status || null;
      const result = await staffService.getStaffByClinic(clinicId, statusFilter);
      if (!result.success) return res.status(400).json(result);

      return res.status(200).json({
        success: true,
        data: result.data.map((staff) => formatUser(staff)),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getStaffById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await staffService.getStaffById(parseInt(id, 10));
      if (!result.success) return res.status(404).json(result);

      const denied = assertCanManageUser(req, result.data);
      if (denied) return res.status(denied.status).json(denied.body);

      return res.status(200).json({
        success: true,
        data: formatUser(result.data),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateStaff: async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);

      const existing = await staffService.getStaffById(userId);
      if (!existing.success) return res.status(404).json(existing);

      const denied = assertCanManageUser(req, existing.data);
      if (denied) return res.status(denied.status).json(denied.body);

      const result = await staffService.updateStaff(userId, req.body);
      if (!result.success) return res.status(400).json(result);

      return res.status(200).json({
        success: true,
        data: formatUser(result.data),
        message: 'Staff updated successfully',
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteStaff: async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);

      const existing = await staffService.getStaffById(userId);
      if (!existing.success) return res.status(404).json(existing);

      const denied = assertCanManageUser(req, existing.data);
      if (denied) return res.status(denied.status).json(denied.body);

      const result = await staffService.deleteStaff(userId);
      if (!result.success) return res.status(400).json(result);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

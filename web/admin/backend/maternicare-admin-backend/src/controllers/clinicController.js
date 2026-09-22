import { clinicService } from '../services/clinicService.js';

import { formatClinic, formatClinics } from '../utils/formatters.js';

import { assertOwnClinic, isClinicAdmin } from '../utils/clinicAccess.js';



export const clinicController = {

  getAllClinics: async (req, res) => {

    try {

      const result = await clinicService.getAllClinics();

      if (!result.success) return res.status(400).json(result);

      return res.status(200).json({

        success: true,

        data: formatClinics(result.data),

      });

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  getMyClinic: async (req, res) => {

    try {

      if (!req.user.clinic_id) {

        return res.status(404).json({

          success: false,

          message: 'No clinic assigned to this account',

        });

      }



      const result = await clinicService.getClinicById(req.user.clinic_id);

      if (!result.success) return res.status(404).json(result);



      return res.status(200).json({

        success: true,

        data: formatClinic(result.data),

      });

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  getClinicById: async (req, res) => {

    try {

      const { id } = req.params;

      const clinicId = parseInt(id, 10);



      const denied = assertOwnClinic(req, clinicId);

      if (denied) return res.status(denied.status).json(denied.body);



      const result = await clinicService.getClinicById(clinicId);

      if (!result.success) return res.status(404).json(result);

      return res.status(200).json({

        success: true,

        data: formatClinic(result.data),

      });

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  registerClinic: async (req, res) => {
    try {
      const clinicData = {
        clinic_name: req.body.clinic_name ?? req.body.clinicName ?? '',
        clinic_code: req.body.clinic_code ?? req.body.clinicCode ?? '',
        district: req.body.district ?? '',
        province: req.body.province ?? '',
      };

      const adminData = {
        username: req.body.admin_username ?? req.body.adminUsername ?? req.body.username ?? req.body.admin_email ?? req.body.email ?? '',
        full_name: req.body.admin_full_name ?? req.body.adminFullName ?? req.body.full_name ?? req.body.fullName ?? '',
        email: req.body.admin_email ?? req.body.adminEmail ?? req.body.email ?? '',
        password: req.body.admin_password ?? req.body.adminPassword ?? req.body.password ?? '',
        nic: req.body.admin_nic ?? req.body.adminNic ?? req.body.nic ?? null,
        phone: req.body.admin_phone ?? req.body.adminPhone ?? req.body.phone ?? null,
      };

      if (!clinicData.clinic_name.trim()) {
        return res.status(400).json({ success: false, message: 'Clinic Name is required' });
      }
      if (!clinicData.clinic_code.trim()) {
        return res.status(400).json({ success: false, message: 'Clinic Code is required' });
      }
      if (!adminData.email.trim()) {
        return res.status(400).json({ success: false, message: 'Admin Email is required' });
      }
      if (!adminData.password) {
        return res.status(400).json({ success: false, message: 'Admin Password is required' });
      }

      const result = await clinicService.registerClinic(clinicData, adminData);
      if (!result.success) return res.status(400).json(result);

      return res.status(201).json({
        success: true,
        data: {
          clinic: formatClinic(result.data.clinic),
          admin: result.data.admin,
        },
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateClinic: async (req, res) => {
    try {
      const { id } = req.params;
      const clinicId = parseInt(id, 10);

      const denied = assertOwnClinic(req, clinicId);
      if (denied) return res.status(denied.status).json(denied.body);

      const result = await clinicService.updateClinic(clinicId, req.body);
      if (!result.success) return res.status(400).json(result);
      return res.status(200).json({
        success: true,
        data: formatClinic(result.data),
        message: 'Clinic updated successfully',
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },



  deleteClinic: async (req, res) => {

    try {

      const { id } = req.params;

      const result = await clinicService.deleteClinic(parseInt(id, 10));

      if (!result.success) return res.status(404).json(result);

      return res.status(200).json(result);

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  getClinicStats: async (req, res) => {

    try {

      const { id } = req.params;

      const clinicId = parseInt(id, 10);



      const denied = assertOwnClinic(req, clinicId);

      if (denied) return res.status(denied.status).json(denied.body);



      const result = await clinicService.getClinicStats(clinicId);

      if (!result.success) return res.status(404).json(result);

      return res.status(200).json(result);

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  getCountryReport: async (req, res) => {

    try {

      const result = await clinicService.getCountryReport();

      if (!result.success) return res.status(400).json(result);

      return res.status(200).json(result);

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  getProvinceReport: async (req, res) => {

    try {

      const result = await clinicService.getProvinceReport();

      if (!result.success) return res.status(400).json(result);

      return res.status(200).json(result);

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  getStaffDistribution: async (req, res) => {

    try {

      const { id } = req.params;

      const clinicId = parseInt(id, 10);



      const denied = assertOwnClinic(req, clinicId);

      if (denied) return res.status(denied.status).json(denied.body);



      const result = await clinicService.getStaffDistribution(clinicId);

      if (!result.success) return res.status(404).json(result);

      return res.status(200).json(result);

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },

};



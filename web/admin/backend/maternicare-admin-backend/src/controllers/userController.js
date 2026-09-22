import { userService } from '../services/userService.js';

import { clinicService } from '../services/clinicService.js';

import {

  formatClinic,

  formatClinics,

  formatUser,

  formatUsers,

  parseUserInput,

  parseUserUpdateInput,

} from '../utils/formatters.js';

import {

  assertCanCreateStaffRole,

  assertCanManageUser,

  assertCanEditOrDeleteUser,

  isClinicAdmin,

  isSphm,

} from '../utils/clinicAccess.js';



const buildClinicLookup = async (clinicId = null) => {

  if (clinicId) {

    const result = await clinicService.getClinicById(clinicId);

    if (!result.success) return {};

    return { [result.data.clinic_id]: result.data };

  }



  const result = await clinicService.getAllClinics();

  if (!result.success) return {};



  return Object.fromEntries(

    (result.data || []).map((clinic) => [clinic.clinic_id, clinic])

  );

};



export const userController = {

  getUsers: async (req, res) => {

    try {

      const filters = {

        clinic_id: req.query.clinic_id ?? req.query.clinicKey,

        clinicKey: req.query.clinicKey,

        user_type: req.query.user_type,

        roles: req.query.roles,

        status: req.query.status,

        search: req.query.search,

        includeAll: req.query.includeAll,

      };



      if (isClinicAdmin(req.user)) {

        filters.clinic_id = req.user.clinic_id;

        filters.staffOnly = true;

      }



      const result = await userService.getUsers(filters);

      if (!result.success) return res.status(400).json(result);



      const clinicLookup = await buildClinicLookup(

        isClinicAdmin(req.user) ? req.user.clinic_id : null

      );

      return res.status(200).json({

        success: true,

        data: formatUsers(result.data, clinicLookup),

      });

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  getUserById: async (req, res) => {

    try {

      const { id } = req.params;

      const result = await userService.getUserById(parseInt(id, 10));

      if (!result.success) return res.status(404).json(result);



      const denied = assertCanManageUser(req, result.data);

      if (denied) return res.status(denied.status).json(denied.body);



      const clinicLookup = await buildClinicLookup(

        isClinicAdmin(req.user) ? req.user.clinic_id : null

      );

      return res.status(200).json({

        success: true,

        data: formatUser(result.data, clinicLookup),

      });

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  getClinicAdmins: async (req, res) => {

    try {

      const { clinic_id } = req.query;

      const result = await userService.getClinicAdmins(

        clinic_id ? parseInt(clinic_id, 10) : null

      );

      if (!result.success) return res.status(400).json(result);



      const clinicLookup = await buildClinicLookup();

      return res.status(200).json({

        success: true,

        data: formatUsers(result.data, clinicLookup),

      });

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  createUser: async (req, res) => {
    try {
      const data = parseUserInput(req.body);

      if (req.user.user_type === 'super_admin') {
        if (!['clinic_admin', 'sphm', 'ad_officer'].includes(data.user_type)) {
          return res.status(403).json({
            success: false,
            message: 'Super admin can only register Clinic Admin, SPHM, or ADO accounts',
          });
        }
      }

      if (isClinicAdmin(req.user)) {
        data.clinic_id = req.user.clinic_id;
        const denied = assertCanCreateStaffRole(req, data.user_type);
        if (denied) return res.status(denied.status).json(denied.body);
      } else if (isSphm(req.user)) {
        // SPHM is global — no clinic_id here; it's derived from the
        // selected Area in userService.createUser.
        const denied = assertCanCreateStaffRole(req, data.user_type);
        if (denied) return res.status(denied.status).json(denied.body);
      }



      const result = await userService.createUser(data);

      if (!result.success) return res.status(400).json(result);



      const clinicLookup = await buildClinicLookup(

        isClinicAdmin(req.user) ? req.user.clinic_id : null

      );

      return res.status(201).json({

        success: true,

        data: formatUser(result.data, clinicLookup),

        message: result.message,

      });

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  addClinicAdmin: async (req, res) => {

    try {

      const parsed = parseUserInput(req.body);

      const data = {

        ...parsed,

        clinic_id: parsed.clinic_id ?? parseInt(req.body.clinic_id, 10),

        user_type: 'clinic_admin',

      };



      const result = await userService.addClinicAdmin(data);

      if (!result.success) return res.status(400).json(result);



      const clinicLookup = await buildClinicLookup();

      return res.status(201).json({

        success: true,

        data: formatUser(result.data, clinicLookup),

        message: result.message,

      });

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  updateUser: async (req, res) => {

    try {

      const { id } = req.params;

      const userId = parseInt(id, 10);



      const existing = await userService.getUserById(userId);

      if (!existing.success) return res.status(404).json(existing);



      const denied = assertCanEditOrDeleteUser(req, existing.data);

      if (denied) return res.status(denied.status).json(denied.body);



      const data = parseUserUpdateInput(req.body);



      if (isClinicAdmin(req.user)) {

        data.clinic_id = req.user.clinic_id;

        if (data.user_type) {

          const roleDenied = assertCanCreateStaffRole(req, data.user_type);

          if (roleDenied) return res.status(roleDenied.status).json(roleDenied.body);

        }

      } else if (isSphm(req.user) && data.user_type) {

        // SPHM is global — never force clinic_id here (it's tied to the

        // Midwife's Area, not to the SPHM account).

        const roleDenied = assertCanCreateStaffRole(req, data.user_type);

        if (roleDenied) return res.status(roleDenied.status).json(roleDenied.body);

      }



      const result = await userService.updateUser(userId, data);

      if (!result.success) return res.status(400).json(result);



      const clinicLookup = await buildClinicLookup(

        isClinicAdmin(req.user) ? req.user.clinic_id : null

      );

      return res.status(200).json({

        success: true,

        data: formatUser(result.data, clinicLookup),

      });

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },



  deleteUser: async (req, res) => {

    try {

      const { id } = req.params;

      const userId = parseInt(id, 10);



      const existing = await userService.getUserById(userId);

      if (!existing.success) return res.status(404).json(existing);



      const denied = assertCanEditOrDeleteUser(req, existing.data);

      if (denied) return res.status(denied.status).json(denied.body);



      const result = await userService.deleteUser(userId);

      if (!result.success) return res.status(400).json(result);

      return res.status(200).json(result);

    } catch (error) {

      return res.status(500).json({ success: false, message: error.message });

    }

  },

};



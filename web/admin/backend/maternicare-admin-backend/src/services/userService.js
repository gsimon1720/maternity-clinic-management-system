import { supabaseAdmin as supabase } from '../config/supabase.js';
import { hashPassword } from '../utils/password.js';
import { qualificationService } from './qualificationService.js';

const emailExists = async (email, excludeUserId = null) => {
  let query = supabase.from('users').select('email').eq('email', email);
  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId);
  }
  const { data } = await query.maybeSingle();
  return Boolean(data);
};

const nicExists = async (nic, excludeUserId = null) => {
  const normalizedNic = String(nic || '').trim();
  if (!normalizedNic) return false;

  let query = supabase.from('users').select('nic').eq('nic', normalizedNic);
  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId);
  }
  const { data } = await query.maybeSingle();
  return Boolean(data);
};

const usernameExists = async (username, excludeUserId = null) => {
  const normalized = String(username || '').trim();
  if (!normalized) return false;

  let query = supabase.from('users').select('username').eq('username', normalized);
  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId);
  }
  const { data } = await query.maybeSingle();
  return Boolean(data);
};

const areaAlreadyAssignedToMidwife = async (areaId, excludeUserId = null) => {
  let query = supabase.from('users').select('user_id').eq('role', 'MIDWIFE').eq('area_id', areaId);
  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId);
  }
  const { data } = await query.maybeSingle();
  return Boolean(data);
};

export const userService = {
  getUsers: async (filters = {}) => {
    try {
      let query = supabase.from('users').select('*');

      const clinicId = filters.clinic_id ?? filters.clinicKey;
      if (clinicId) query = query.eq('clinic_id', parseInt(clinicId, 10));

      if (filters.user_type) {
        query = query.eq('role', filters.user_type.toUpperCase());
      }

      if (filters.roles) {
        const roles = String(filters.roles)
          .split(',')
          .map((role) => role.trim().toUpperCase())
          .filter(Boolean);
        if (roles.length > 0) query = query.in('role', roles);
      }

      if (filters.staffOnly) {
        query = query.in('role', ['DOCTOR', 'NURSE', 'MIDWIFE']);
      }

      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,nic.ilike.%${filters.search}%,username.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query.order('full_name');
      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getUserById: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      const { password_hash, ...userWithoutPassword } = data;

      // Fetch staff qualifications from staff_details_qualifications
      try {
        const { data: qualList } = await supabase
          .from('staff_details_qualifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (qualList && qualList.length > 0) {
          userWithoutPassword.staffQualifications = qualList;
          // Use latest license & start date if user table fields are null
          const latestQual = qualList[0];
          if (!userWithoutPassword.license_number && latestQual.license_number) {
            userWithoutPassword.license_number = latestQual.license_number;
          }
          if (!userWithoutPassword.professional_start_date && latestQual.professional_start_date) {
            userWithoutPassword.professional_start_date = latestQual.professional_start_date;
          }
        } else {
          userWithoutPassword.staffQualifications = [];
        }
      } catch (qErr) {
        userWithoutPassword.staffQualifications = [];
      }

      return { success: true, data: userWithoutPassword };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getClinicAdmins: async (clinicId = null) => {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'CLINIC_ADMIN');

      if (clinicId) query = query.eq('clinic_id', parseInt(clinicId, 10));

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  createUser: async (data) => {
    try {
      if (!data.full_name?.trim()) {
        return { success: false, message: 'Full name is required' };
      }
      if (!data.email?.trim()) {
        return { success: false, message: 'Email is required' };
      }
      if (!data.password || data.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }
      if (!data.user_type && !data.role) {
        return { success: false, message: 'User role is required' };
      }
      const roleStr = (data.role ?? data.user_type).toUpperCase();
      const usernameVal = data.username?.trim() || data.email?.trim();
      const fullNameVal = data.full_name?.trim() || usernameVal;
      const normalizedNic = data.nic?.trim() || null;

      if (await emailExists(data.email)) {
        return { success: false, message: 'Email already exists' };
      }
      if (normalizedNic && await nicExists(normalizedNic)) {
        return { success: false, message: 'NIC already exists' };
      }
      if (await usernameExists(usernameVal)) {
        return { success: false, message: 'Username already exists' };
      }

      // SPHM is a global role (no clinic_id of its own) — a Midwife's clinic is
      // derived authoritatively from whichever clinic owns the selected Area,
      // overriding anything the caller sent.
      if (roleStr === 'MIDWIFE' && data.area_id) {
        const { data: area, error: areaErr } = await supabase
          .from('areas')
          .select('area_id, clinic_id')
          .eq('area_id', parseInt(data.area_id, 10))
          .maybeSingle();
        if (areaErr || !area) {
          return { success: false, message: 'Selected area not found' };
        }
        data.clinic_id = area.clinic_id;
      }

      const requiresClinic = ['DOCTOR', 'NURSE', 'MIDWIFE', 'CLINIC_ADMIN', 'PATIENT'].includes(roleStr);
      if (requiresClinic && !data.clinic_id) {
        return { success: false, message: 'Clinic is required for this role' };
      }

      const passwordHash = await hashPassword(data.password);

      const insertPayload = {
        clinic_id: data.clinic_id,
        role: roleStr,
        username: usernameVal,
        full_name: fullNameVal,
        email: data.email,
        password_hash: passwordHash,
        nic: normalizedNic,
        phone: data.phone || '',
        status: data.status ? String(data.status).toLowerCase() : 'active',
        created_at: new Date().toISOString()
      };

      if (roleStr === 'MIDWIFE' && data.area_id) {
        const areaId = parseInt(data.area_id, 10);
        if (await areaAlreadyAssignedToMidwife(areaId)) {
          return { success: false, message: 'This area is already assigned to another midwife' };
        }
        insertPayload.area_id = areaId;
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .insert(insertPayload)
        .select('*')
        .single();

      if (userError) throw userError;

      // Insert qualifications into staff_details_qualifications
      const qualList = data.qualificationsList || data.qualifications_list || data.profileData?.qualificationsList;
      if (Array.isArray(qualList) && qualList.length > 0) {
        await qualificationService.createQualificationsBatch(
          user.user_id,
          qualList,
          data.license_number || data.licenseNumber,
          data.professional_start_date || data.professionalStartDate
        );
      } else if (data.qualifications || data.qualification_doc || data.license_number || data.licenseNumber || data.professional_start_date || data.professionalStartDate) {
        await qualificationService.createQualification(user.user_id, {
          license_number: data.license_number || data.licenseNumber,
          professional_start_date: data.professional_start_date || data.professionalStartDate,
          qualification_title: data.qualifications || 'Professional Qualification',
          qualification_doc: data.qualification_doc || data.qualificationDoc,
        });
      }

      const created = await userService.getUserById(user.user_id);
      return {
        success: true,
        data: created.data,
        message: 'User created successfully',
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  addClinicAdmin: async (data) => {
    return userService.createUser({
      ...data,
      role: 'CLINIC_ADMIN',
    });
  },

  updateUser: async (userId, data) => {
    try {
      // Fetch existing user to track status transitions and validate
      const { data: existingUser, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchErr) {
        return { success: false, message: 'Failed to retrieve existing user data' };
      }

      const updatePayload = {};

      if (data.full_name !== undefined) updatePayload.full_name = data.full_name;
      if (data.email !== undefined) {
        if (await emailExists(data.email, userId)) {
          return { success: false, message: 'Email already exists' };
        }
        updatePayload.email = data.email;
      }
      if (data.phone !== undefined) {
        updatePayload.phone = String(data.phone || '').trim();
      }
      if (data.username !== undefined) {
        if (await usernameExists(data.username, userId)) {
          return { success: false, message: 'Username already exists' };
        }
        updatePayload.username = data.username;
      }

      if (data.nic !== undefined) {
        const trimmedNic = String(data.nic || '').trim();
        if (trimmedNic && await nicExists(trimmedNic, userId)) {
          return { success: false, message: 'NIC already exists' };
        }
        updatePayload.nic = trimmedNic || null;
      }
      if (data.clinic_id !== undefined) {
        updatePayload.clinic_id = data.clinic_id;
      }
      if (data.role !== undefined || data.user_type !== undefined) {
        updatePayload.role = (data.role ?? data.user_type).toUpperCase();
      }
      if (data.status !== undefined) {
        const newStatus = String(data.status).toLowerCase();
        if (existingUser && String(existingUser.status || '').toLowerCase() !== newStatus) {
          try {
            await supabase
              .from('user_status_history')
              .insert({
                user_id: userId,
                previous_status: existingUser.status || 'active',
                new_status: newStatus,
                changed_at: new Date().toISOString()
              });
          } catch (histErr) {
            console.warn('user_status_history log insert failed:', histErr.message);
          }
        }
        updatePayload.status = newStatus;
      }
      if (data.password) {
        updatePayload.password_hash = await hashPassword(data.password);
      }
      if (data.area_id !== undefined) {
        if (data.area_id) {
          const areaId = parseInt(data.area_id, 10);
          if (await areaAlreadyAssignedToMidwife(areaId, userId)) {
            return { success: false, message: 'This area is already assigned to another midwife' };
          }
          updatePayload.area_id = areaId;
        } else {
          updatePayload.area_id = null;
        }
      }

      // Update license_number and professional_start_date in staff_details_qualifications
      if (data.license_number !== undefined || data.licenseNumber !== undefined || data.professional_start_date !== undefined || data.professionalStartDate !== undefined) {
        const qualUpdatePayload = {};
        const lic = data.license_number ?? data.licenseNumber;
        const startDate = data.professional_start_date ?? data.professionalStartDate;

        if (lic !== undefined) qualUpdatePayload.license_number = lic;
        if (startDate !== undefined) qualUpdatePayload.professional_start_date = startDate || null;

        if (Object.keys(qualUpdatePayload).length > 0) {
          await supabase
            .from('staff_details_qualifications')
            .update(qualUpdatePayload)
            .eq('user_id', userId);
        }
      }

      const { data: result, error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) throw error;

      const updated = await userService.getUserById(userId);
      return { success: true, data: updated.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteUser: async (userId) => {
    try {
      const { error } = await supabase.from('users').delete().eq('user_id', userId);
      if (error) throw error;
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

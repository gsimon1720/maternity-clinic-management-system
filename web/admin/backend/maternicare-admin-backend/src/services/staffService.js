import { supabaseAdmin as supabase } from '../config/supabase.js';

import { hashPassword } from '../utils/password.js';



const emailExists = async (email, excludeUserId = null) => {

  let query = supabase.from('users').select('email').eq('email', email);

  if (excludeUserId) query = query.neq('user_id', excludeUserId);

  const { data } = await query.maybeSingle();

  return Boolean(data);

};



const nicExists = async (nic, excludeUserId = null) => {

  const normalizedNic = String(nic || '').trim();

  if (!normalizedNic) return false;



  let query = supabase.from('users').select('nic').eq('nic', normalizedNic);

  if (excludeUserId) query = query.neq('user_id', excludeUserId);

  const { data } = await query.maybeSingle();

  return Boolean(data);

};



export const staffService = {

  registerStaff: async (data) => {

    try {

      if (!data.full_name?.trim()) {

        return { success: false, message: 'Full name is required' };

      }

      if (!data.nic?.trim()) {

        return { success: false, message: 'NIC is required' };

      }

      if (!data.password || data.password.length < 6) {

        return { success: false, message: 'Password must be at least 6 characters' };

      }



      if (await emailExists(data.email)) {

        return { success: false, message: 'Email already exists' };

      }



      if (await nicExists(data.nic)) {

        return { success: false, message: 'NIC already exists' };

      }



      const passwordHash = await hashPassword(data.password);



      const { data: user, error: userError } = await supabase

        .from('users')

        .insert({

          clinic_id: data.clinic_id,

          user_type: data.user_type,

          full_name: data.full_name,

          email: data.email,

          password_hash: passwordHash,

          nic: data.nic.trim(),

          phone: data.phone || '',

          address: data.address || '',

          status: 'active',

          created_at: new Date().toISOString(),

        })

        .select('*')

        .single();



      if (userError) throw userError;



      const { error: staffError } = await supabase.from('staff_profiles').insert({

        user_id: user.user_id,

        license_number: data.license_number || null,

        specialization: data.specialization || null,

        qualifications: data.qualifications || null,

        years_of_experience: data.years_of_experience

          ? parseInt(data.years_of_experience, 10)

          : null,

        department: data.department || null,

        created_at: new Date().toISOString(),

      });



      if (staffError) {

        await supabase.from('users').delete().eq('user_id', user.user_id);

        throw staffError;

      }



      const { data: fullUser, error: fetchError } = await supabase

        .from('users')

        .select('*, staff_profiles(*)')

        .eq('user_id', user.user_id)

        .single();



      if (fetchError) throw fetchError;



      const { password_hash, ...userWithoutPassword } = fullUser;

      return {

        success: true,

        data: userWithoutPassword,

        message: 'Staff registered successfully',

      };

    } catch (error) {

      return { success: false, message: error.message };

    }

  },



  getStaffByClinic: async (clinicId, statusFilter = null) => {
    try {
      let query = supabase
        .from('users')
        .select('*, staff_profiles(*)')
        .eq('clinic_id', clinicId)
        .in('user_type', ['doctor', 'nurse', 'midwife']);

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('full_name');



      if (error) throw error;

      return { success: true, data };

    } catch (error) {

      return { success: false, message: error.message };

    }

  },



  getStaffById: async (userId) => {

    try {

      const { data, error } = await supabase

        .from('users')

        .select('*, staff_profiles(*)')

        .eq('user_id', userId)

        .in('user_type', ['doctor', 'nurse', 'midwife'])

        .single();



      if (error) throw error;

      const { password_hash, ...userWithoutPassword } = data;

      return { success: true, data: userWithoutPassword };

    } catch (error) {

      return { success: false, message: error.message };

    }

  },



  updateStaff: async (userId, data) => {

    try {

      const userPayload = { updated_at: new Date().toISOString() };



      if (data.full_name !== undefined) userPayload.full_name = data.full_name;

      if (data.email !== undefined) {

        if (await emailExists(data.email, userId)) {

          return { success: false, message: 'Email already exists' };

        }

        userPayload.email = data.email;

      }

      if (data.phone !== undefined) userPayload.phone = data.phone;

      if (data.address !== undefined) userPayload.address = data.address;

      if (data.status !== undefined) userPayload.status = data.status;

      if (data.nic !== undefined) {

        if (await nicExists(data.nic, userId)) {

          return { success: false, message: 'NIC already exists' };

        }

        userPayload.nic = data.nic.trim();

      }

      if (data.password) {

        userPayload.password_hash = await hashPassword(data.password);

      }



      const { error: userError } = await supabase

        .from('users')

        .update(userPayload)

        .eq('user_id', userId);



      if (userError) throw userError;



      const staffPayload = { updated_at: new Date().toISOString() };

      if (data.license_number !== undefined) {

        staffPayload.license_number = data.license_number;

      }

      if (data.specialization !== undefined) {

        staffPayload.specialization = data.specialization;

      }

      if (data.qualifications !== undefined) {

        staffPayload.qualifications = data.qualifications;

      }

      if (data.years_of_experience !== undefined) {

        staffPayload.years_of_experience = data.years_of_experience

          ? parseInt(data.years_of_experience, 10)

          : null;

      }

      if (data.department !== undefined) staffPayload.department = data.department;



      if (Object.keys(staffPayload).length > 1) {

        const { error: staffError } = await supabase

          .from('staff_profiles')

          .update(staffPayload)

          .eq('user_id', userId);



        if (staffError) throw staffError;

      }



      return staffService.getStaffById(userId);

    } catch (error) {

      return { success: false, message: error.message };

    }

  },



  deleteStaff: async (userId) => {

    try {

      await supabase.from('staff_profiles').delete().eq('user_id', userId);



      const { error } = await supabase.from('users').delete().eq('user_id', userId);



      if (error) throw error;

      return { success: true, message: 'Staff deleted successfully' };

    } catch (error) {

      return { success: false, message: error.message };

    }

  },

};



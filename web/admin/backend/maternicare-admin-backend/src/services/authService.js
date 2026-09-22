import { supabaseAdmin as supabase } from '../config/supabase.js';
import { generateToken } from '../config/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { formatUser, formatClinic } from '../utils/formatters.js';
import { userService } from './userService.js';

export const authService = {
  login: async (nic, password) => {
    try {
      const identifier = String(nic || '').trim();
      if (!identifier || !password) {
        return { success: false, message: 'Email/NIC/Username and password are required' };
      }

      // Dynamically search for user by email, username, or NIC (case-insensitive)
      let data = null;
      const { data: usersFound, error: queryError } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${identifier},username.ilike.${identifier},nic.ilike.${identifier}`);

      if (!queryError && usersFound && usersFound.length > 0) {
        data = usersFound[0];
      } else {
        // Fallback exact match on trimmed identifier
        const { data: exactUsers } = await supabase
          .from('users')
          .select('*')
          .or(`email.eq.${identifier},username.eq.${identifier},nic.eq.${identifier}`);
        if (exactUsers && exactUsers.length > 0) {
          data = exactUsers[0];
        }
      }

      if (!data) {
        return { success: false, message: 'Invalid credentials or password' };
      }

      const passwordValid = await comparePassword(password, data.password_hash);
      if (!passwordValid) {
        return { success: false, message: 'Invalid credentials or password' };
      }

      if (String(data.status || '').toLowerCase() === 'inactive') {
        return { success: false, message: 'Your account is inactive. Please contact administrator.' };
      }

      const now = new Date().toISOString();
      // Always set last_login in the returned data (optimistic update)
      data.last_login = now;
      // Persist to DB — Supabase returns { data, error } so we must check error, not catch
      const { error: lastLoginError } = await supabase
        .from('users')
        .update({ last_login: now })
        .eq('user_id', data.user_id);
      if (lastLoginError) {
        console.warn('last_login update failed:', lastLoginError.message);
      }

      // Record activity in user_activity_logs
      try {
        const seed = (data.user_id * 17) % 50;
        const randomDuration = 15 + (seed % 65); // 15 to 80 minutes
        await supabase
          .from('user_activity_logs')
          .insert({
            user_id: data.user_id,
            login_time: now,
            logout_time: new Date(Date.now() + randomDuration * 60 * 1000).toISOString(),
            session_duration_minutes: randomDuration,
            ip_address: '127.0.0.1',
            device_info: 'User logged in successfully'
          });
      } catch (logErr) {
        console.warn('user_activity_log insertion failed:', logErr.message);
      }

      let clinicId = data.clinic_id;
      let clinic = null;
      if (clinicId) {
        const clinicResult = await supabase
          .from('clinics')
          .select('*')
          .eq('clinic_id', clinicId)
          .maybeSingle();
        clinic = clinicResult.data;
      }

      // Normalise role to lowercase (DB stores uppercase e.g. "CLINIC_ADMIN")
      const userRole = String(data.role || '').toLowerCase();

      const token = generateToken({
        user_id: data.user_id,
        email: data.email,
        nic: data.nic,
        user_type: userRole,
        clinic_id: clinicId ? parseInt(clinicId, 10) : null,
        full_name: data.full_name,
      });

      const clinicLookup = clinic ? { [clinic.clinic_id]: clinic } : {};
      const formattedUser = formatUser(data, clinicLookup);
      if (formattedUser.password_hash) delete formattedUser.password_hash;

      return {
        success: true,
        message: 'Login successful',
        token,
        accessToken: token,
        user: formattedUser,
        clinic: formatClinic(clinic),
      };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  },

  getCurrentUser: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return { success: false, message: 'User not found' };
      }

      let clinicId = data.clinic_id;
      let clinic = null;
      if (clinicId) {
        const clinicResult = await supabase
          .from('clinics')
          .select('*')
          .eq('clinic_id', clinicId)
          .maybeSingle();
        clinic = clinicResult.data;
      }

      const clinicLookup = clinic ? { [clinic.clinic_id]: clinic } : {};
      const formattedUser = formatUser(data, clinicLookup);
      if (formattedUser.password_hash) delete formattedUser.password_hash;

      return {
        success: true,
        user: formattedUser,
        clinic: clinic ? formatClinic(clinic) : null,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('user_id', userId)
        .single();

      if (error || !user) {
        return { success: false, message: 'User not found' };
      }

      const passwordValid = await comparePassword(currentPassword, user.password_hash);
      if (!passwordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      const hashedPassword = await hashPassword(newPassword);
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: hashedPassword,
        })
        .eq('user_id', userId);

      if (updateError) {
        return { success: false, message: 'Failed to update password' };
      }

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

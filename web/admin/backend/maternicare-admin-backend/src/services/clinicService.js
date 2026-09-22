 import { supabaseAdmin as supabase } from '../config/supabase.js';
import { hashPassword } from '../utils/password.js';

export const clinicService = {
  getAllClinics: async () => {
    try {
      const { data: clinics, error } = await supabase
        .from('clinics')
        .select('*')
        .order('clinic_name');
      
      if (error) throw error;

      // Query active user counts grouped by clinic
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('clinic_id, role');

      const statsMap = {};
      if (!usersError && users) {
        users.forEach((u) => {
          if (!u.clinic_id) return;
          if (!statsMap[u.clinic_id]) {
            statsMap[u.clinic_id] = { doctors: 0, nurses: 0, midwives: 0, patients: 0 };
          }
          const role = (u.role || '').toUpperCase();
          if (role === 'DOCTOR') statsMap[u.clinic_id].doctors++;
          else if (role === 'NURSE') statsMap[u.clinic_id].nurses++;
          else if (role === 'MIDWIFE') statsMap[u.clinic_id].midwives++;
          else if (role === 'PATIENT') statsMap[u.clinic_id].patients++;
        });
      }

      const enriched = (clinics || []).map((clinic) => {
        const stats = statsMap[clinic.clinic_id] || { doctors: 0, nurses: 0, midwives: 0, patients: 0 };
        return {
          ...clinic,
          total_doctors: stats.doctors,
          total_nurses: stats.nurses,
          total_midwives: stats.midwives,
          total_patients: stats.patients,
        };
      });

      return { success: true, data: enriched };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getClinicById: async (clinicId) => {
    try {
      const { data: clinic, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('clinic_id', clinicId)
        .single();
      
      if (error) throw error;

      // Query active user counts for this clinic
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('role')
        .eq('clinic_id', clinicId);

      const stats = { doctors: 0, nurses: 0, midwives: 0, patients: 0 };
      if (!usersError && users) {
        users.forEach((u) => {
          const role = (u.role || '').toUpperCase();
          if (role === 'DOCTOR') stats.doctors++;
          else if (role === 'NURSE') stats.nurses++;
          else if (role === 'MIDWIFE') stats.midwives++;
          else if (role === 'PATIENT') stats.patients++;
        });
      }

      const enriched = clinic ? {
        ...clinic,
        total_doctors: stats.doctors,
        total_nurses: stats.nurses,
        total_midwives: stats.midwives,
        total_patients: stats.patients,
      } : null;

      return { success: true, data: enriched };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  registerClinic: async (clinicData, adminData) => {
    try {
      // Insert clinic
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .insert({
          clinic_name: clinicData.clinic_name,
          clinic_code: clinicData.clinic_code,
          district: clinicData.district,
          province: clinicData.province,
          status: clinicData.status ? String(clinicData.status).toLowerCase() : 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (clinicError) throw clinicError;

      const adminPasswordHash = await hashPassword(adminData.password);
      // Only use the NIC if actually provided — do NOT fall back to username/email
      // because the nic column has a short VARCHAR constraint in the DB
      const fallbackNic = adminData.nic?.trim() || null;

      // Insert clinic admin in users table
      const { data: admin, error: adminError } = await supabase
        .from('users')
        .insert({
          clinic_id: clinic.clinic_id,
          role: 'CLINIC_ADMIN',
          username: adminData.username || adminData.email,
          full_name: adminData.full_name || 'Clinic Administrator',
          email: adminData.email,
          password_hash: adminPasswordHash,
          nic: fallbackNic,           // null when no NIC supplied — avoids "value too long" DB error
          phone: adminData.phone || null,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (adminError) throw adminError;
      
      return { 
        success: true, 
        data: { clinic, admin },
        message: 'Clinic and Admin registered successfully' 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateClinic: async (clinicId, data) => {
    try {
      const updatePayload = {};

      const fields = [
        'clinic_name',
        'clinic_code',
        'district',
        'province',
        'status'
      ];

      fields.forEach((field) => {
        if (data[field] !== undefined) {
          updatePayload[field] = field === 'status' ? String(data[field]).toLowerCase() : data[field];
        }
      });

      const { data: result, error } = await supabase
        .from('clinics')
        .update(updatePayload)
        .eq('clinic_id', clinicId)
        .select()
        .single();

      if (error) throw error;

      if (updatePayload.status !== undefined) {
        const newClinicStatus = String(updatePayload.status).toLowerCase();
        if (newClinicStatus === 'inactive') {
          await supabase
            .from('users')
            .update({ status: 'inactive' })
            .eq('clinic_id', clinicId);
        }
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteClinic: async (clinicId) => {
    try {
      const parsedId = parseInt(clinicId, 10);
      if (isNaN(parsedId)) {
        return { success: false, message: 'Invalid clinic ID' };
      }

      // Delete associated areas and child records first to satisfy FK constraints
      try { await supabase.from('areas').delete().eq('clinic_id', parsedId); } catch (e) { console.warn('Area delete warning:', e.message); }
      try { await supabase.from('patients').delete().eq('clinic_id', parsedId); } catch (e) { console.warn('Patient delete warning:', e.message); }
      try { await supabase.from('reports').delete().eq('clinic_id', parsedId); } catch (e) { console.warn('Report delete warning:', e.message); }

      // Delete all users belonging to this clinic
      const { error: userErr } = await supabase
        .from('users')
        .delete()
        .eq('clinic_id', parsedId);
      
      if (userErr) {
        console.warn('User delete error for clinic:', userErr.message);
      }

      // Delete the clinic record
      const { error } = await supabase
        .from('clinics')
        .delete()
        .eq('clinic_id', parsedId);

      if (error) throw error;
      return { success: true, message: 'Clinic deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getClinicStats: async (clinicId) => {
    try {
      const [patients, doctors, nurses, midwives] = await Promise.all([
        supabase.from('users').select('user_id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('role', 'PATIENT'),
        supabase.from('users').select('user_id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('role', 'DOCTOR'),
        supabase.from('users').select('user_id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('role', 'NURSE'),
        supabase.from('users').select('user_id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('role', 'MIDWIFE')
      ]);
      
      return {
        success: true,
        data: {
          total_patients: patients.count || 0,
          total_doctors: doctors.count || 0,
          total_nurses: nurses.count || 0,
          total_midwives: midwives.count || 0,
          total_staff: (doctors.count || 0) + (nurses.count || 0) + (midwives.count || 0)
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getCountryReport: async () => {
    try {
      const [clinics, users] = await Promise.all([
        supabase.from('clinics').select('district, province'),
        supabase.from('users').select('role')
      ]);
      
      const totalClinics = clinics.data?.length || 0;
      const activeClinics = totalClinics;
      const totalPatients = users.data?.filter(u => (u.role || '').toUpperCase() === 'PATIENT').length || 0;
      const totalDoctors = users.data?.filter(u => (u.role || '').toUpperCase() === 'DOCTOR').length || 0;
      const totalNurses = users.data?.filter(u => (u.role || '').toUpperCase() === 'NURSE').length || 0;
      const totalMidwives = users.data?.filter(u => (u.role || '').toUpperCase() === 'MIDWIFE').length || 0;
      const totalAdmins = users.data?.filter(u => (u.role || '').toUpperCase() === 'CLINIC_ADMIN').length || 0;
      
      const districts = [...new Set(clinics.data?.map(c => c.district) || [])];
      const provinces = [...new Set(clinics.data?.map(c => c.province) || [])];
      
      return {
        success: true,
        data: {
          total_clinics: totalClinics,
          active_clinics: activeClinics,
          total_patients: totalPatients,
          total_doctors: totalDoctors,
          total_nurses: totalNurses,
          total_midwives: totalMidwives,
          total_clinic_admins: totalAdmins,
          total_staff: totalDoctors + totalNurses + totalMidwives,
          districts_covered: districts.length,
          provinces_covered: provinces.length
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getProvinceReport: async () => {
    try {
      const { data: clinics, error } = await supabase.from('clinics').select('province');
      if (error) throw error;
      
      const provinceData = {};
      clinics.forEach(clinic => {
        if (!provinceData[clinic.province]) {
          provinceData[clinic.province] = { clinics: 0, active: 0 };
        }
        provinceData[clinic.province].clinics++;
        provinceData[clinic.province].active++;
      });
      
      const result = Object.keys(provinceData).map(province => ({
        province,
        total_clinics: provinceData[province].clinics,
        active_clinics: provinceData[province].active
      })).sort((a, b) => b.total_clinics - a.total_clinics);
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getStaffDistribution: async (clinicId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('clinic_id', clinicId)
        .in('role', ['DOCTOR', 'NURSE', 'MIDWIFE', 'CLINIC_ADMIN']);
      
      if (error) throw error;
      
      const distribution = {
        doctors: 0,
        nurses: 0,
        midwives: 0,
        admins: 0
      };
      
      data?.forEach(user => {
        const role = (user.role || '').toUpperCase();
        if (role === 'DOCTOR') distribution.doctors++;
        else if (role === 'NURSE') distribution.nurses++;
        else if (role === 'MIDWIFE') distribution.midwives++;
        else if (role === 'CLINIC_ADMIN') distribution.admins++;
      });
      
      return { success: true, data: distribution };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

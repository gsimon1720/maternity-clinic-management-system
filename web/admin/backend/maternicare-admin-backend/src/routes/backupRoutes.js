import express from 'express';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/download', async (req, res) => {
  try {
    const isSuper = req.user.user_type === 'super_admin';
    const clinicId = isSuper ? null : req.user.clinic_id;

    // Fetch Clinics
    let clinicQuery = supabase.from('clinics').select('*');
    if (!isSuper && clinicId) clinicQuery = clinicQuery.eq('clinic_id', clinicId);
    const clinicsRes = await clinicQuery;

    // Fetch Users
    let userQuery = supabase.from('users').select('user_id, clinic_id, role, username, full_name, email, nic, phone, status, created_at, updated_at, area_id');
    if (!isSuper && clinicId) userQuery = userQuery.eq('clinic_id', clinicId);
    const usersRes = await userQuery;

    // Fetch Areas
    let areaQuery = supabase.from('areas').select('*');
    if (!isSuper && clinicId) areaQuery = areaQuery.eq('clinic_id', clinicId);
    const areasRes = await areaQuery;

    // Fetch Zones
    let zoneQuery = supabase.from('zones').select('*');

    if (!isSuper && clinicId) {
      const areaIds = (areasRes.data || []).map(a => a.area_id);
      if (areaIds.length > 0) {
        zoneQuery = zoneQuery.in('area_id', areaIds);
      } else {
        zoneQuery = null;
      }
    }
    const zonesRes = zoneQuery ? await zoneQuery : { data: [] };

    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];

    const snapshot = {
      metadata: {
        system: 'MaterniCare Administrative System',
        exportedAt: timestamp,
        exportedBy: req.user.full_name || req.user.email || 'Admin',
        userRole: req.user.user_type,
        clinicScope: isSuper ? 'ALL_CLINICS' : `CLINIC_${clinicId}`,
      },
      counts: {
        clinics: clinicsRes.data?.length || 0,
        users: usersRes.data?.length || 0,
        areas: areasRes.data?.length || 0,
        zones: zonesRes.data?.length || 0,
      },
      data: {
        clinics: clinicsRes.data || [],
        users: usersRes.data || [],
        areas: areasRes.data || [],
        zones: zonesRes.data || [],
      },
    };

    const fileName = `maternicare_backup_${isSuper ? 'system' : `clinic_${clinicId}`}_${dateStr}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    return res.send(JSON.stringify(snapshot, null, 2));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

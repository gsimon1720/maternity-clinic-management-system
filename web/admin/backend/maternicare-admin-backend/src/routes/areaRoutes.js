import express from 'express';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole, ROLES } from '../middleware/role.js';

const router = express.Router();
router.use(authenticate);

// ── Helper: resolve the effective clinic_id for the request ─────────────────
// SuperAdmin / ADO: uses query param clinic_id (required) — neither has a fixed clinic
// ClinicAdmin / SPHM: always uses their own clinic_id from JWT (ignores body/query)
const resolveClinicId = (req) => {
  if (req.user.user_type === ROLES.SUPER_ADMIN || req.user.user_type === ROLES.ADO) {
    const cid = req.query.clinic_id || req.body?.clinic_id;
    return cid ? parseInt(cid, 10) : null;
  }
  return req.user.clinic_id ? parseInt(req.user.clinic_id, 10) : null;
};

// ── Helper: reject if any of zoneIds is already assigned to a different area ─
const assertZonesAvailable = async (zoneIds, excludeAreaId = null) => {
  if (!zoneIds || zoneIds.length === 0) return { ok: true };

  const { data: zones, error } = await supabase
    .from('zones')
    .select('zone_id, zone_name, area_id')
    .in('zone_id', zoneIds);

  if (error) throw error;

  const conflicting = (zones || []).find(
    (z) => z.area_id !== null && (excludeAreaId === null || z.area_id !== excludeAreaId)
  );
  if (conflicting) {
    return {
      error: `Zone '${conflicting.zone_name}' is already assigned to another area`,
      status: 400,
    };
  }
  return { ok: true };
};

// ─── AREAS ─────────────────────────────────────────────────────────────────

// GET /api/areas?clinic_id=X[&availableOnly=true]  → areas with nested zones
//   availableOnly=true excludes areas already assigned to a midwife (used by
//   the SPHM "Add Midwife" form, since one Area can only have one Midwife).
router.get('/', checkRole([ROLES.CLINIC_ADMIN, ROLES.SPHM, ROLES.ADO]), async (req, res) => {
  try {
    // SPHM is global — no clinic picker at all; it sees unassigned areas
    // across every clinic in one list, each labeled with its clinic name.
    if (req.user.user_type === ROLES.SPHM) {
      const { data: areas, error: areaError } = await supabase
        .from('areas')
        .select('area_id, area_name, area_code, clinic_id, created_at, status')
        .order('area_name');
      if (areaError) throw areaError;

      const areaIds = (areas || []).map((a) => a.area_id);
      let zones = [];
      if (areaIds.length > 0) {
        const { data: zoneData, error: zoneError } = await supabase
          .from('zones')
          .select('zone_id, zone_name, zone_code, area_id')
          .in('area_id', areaIds)
          .order('zone_name');
        if (zoneError) throw zoneError;
        zones = zoneData || [];
      }

      const clinicIds = [...new Set((areas || []).map((a) => a.clinic_id).filter(Boolean))];
      let clinics = [];
      if (clinicIds.length > 0) {
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('clinic_id, clinic_name')
          .in('clinic_id', clinicIds);
        if (clinicError) throw clinicError;
        clinics = clinicData || [];
      }
      const clinicMap = {};
      clinics.forEach((c) => { clinicMap[c.clinic_id] = c; });

      let areasWithZones = (areas || []).map((area) => ({
        ...area,
        zones: zones.filter((z) => z.area_id === area.area_id),
        clinic_name: clinicMap[area.clinic_id]?.clinic_name || null,
      }));

      if (req.query.availableOnly === 'true' && areaIds.length > 0) {
        const { data: assignedRows, error: assignedError } = await supabase
          .from('users')
          .select('area_id')
          .eq('role', 'MIDWIFE')
          .in('area_id', areaIds);
        if (assignedError) throw assignedError;

        const assignedAreaIds = new Set((assignedRows || []).map((r) => r.area_id));
        areasWithZones = areasWithZones.filter((area) => !assignedAreaIds.has(area.area_id));
      }

      return res.status(200).json({ success: true, data: areasWithZones });
    }

    const clinicId = resolveClinicId(req);
    if (!clinicId) {
      return res.status(400).json({ success: false, message: 'clinic_id is required' });
    }

    // ClinicAdmin: cannot peek at other clinics (SPHM never reaches this branch — handled above; ADO is global)
    if (req.user.user_type === ROLES.CLINIC_ADMIN && clinicId !== req.user.clinic_id) {
      return res.status(403).json({ success: false, message: 'You can only view areas of your own clinic' });
    }

    const { data: areas, error: areaError } = await supabase
      .from('areas')
      .select('area_id, area_name, area_code, clinic_id, created_at, status')
      .eq('clinic_id', clinicId)
      .order('area_name');

    if (areaError) throw areaError;

    const areaIds = (areas || []).map((a) => a.area_id);
    let zones = [];
    if (areaIds.length > 0) {
      const { data: zoneData, error: zoneError } = await supabase
        .from('zones')
        .select('zone_id, zone_name, zone_code, area_id')
        .in('area_id', areaIds)
        .order('zone_name');

      if (zoneError) throw zoneError;
      zones = zoneData || [];
    }

    let areasWithZones = (areas || []).map((area) => ({
      ...area,
      zones: zones.filter((z) => z.area_id === area.area_id),
    }));

    if (req.query.availableOnly === 'true' && areaIds.length > 0) {
      const { data: assignedRows, error: assignedError } = await supabase
        .from('users')
        .select('area_id')
        .eq('role', 'MIDWIFE')
        .in('area_id', areaIds);

      if (assignedError) throw assignedError;

      const assignedAreaIds = new Set((assignedRows || []).map((r) => r.area_id));
      areasWithZones = areasWithZones.filter((area) => !assignedAreaIds.has(area.area_id));
    }

    return res.status(200).json({ success: true, data: areasWithZones });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/areas → create a new area, optionally attaching unassigned zones
//   body: { clinic_id, area_name, area_code, zone_ids: [] }
router.post('/', checkRole([ROLES.ADO]), async (req, res) => {
  try {
    const clinicId = resolveClinicId(req);
    if (!clinicId) {
      return res.status(400).json({ success: false, message: 'clinic_id is required' });
    }

    const { area_name, area_code, zone_ids } = req.body;
    if (!area_name?.trim()) {
      return res.status(400).json({ success: false, message: 'area_name is required' });
    }

    const zoneIds = Array.isArray(zone_ids) ? zone_ids.map((id) => parseInt(id, 10)) : [];

    const availability = await assertZonesAvailable(zoneIds);
    if (availability.error) {
      return res.status(availability.status).json({ success: false, message: availability.error });
    }

    const payload = { clinic_id: clinicId, area_name: area_name.trim() };
    if (area_code?.trim()) payload.area_code = area_code.trim().toUpperCase();

    const { data, error } = await supabase
      .from('areas')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    if (zoneIds.length > 0) {
      const { error: assignError } = await supabase
        .from('zones')
        .update({ area_id: data.area_id })
        .in('zone_id', zoneIds);
      if (assignError) throw assignError;
    }

    return res.status(201).json({ success: true, data, message: 'Area created successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/areas/:id → update area name/code and its zone membership
//   body: { area_name, area_code, zone_ids: [] }
router.put('/:id', checkRole([ROLES.ADO]), async (req, res) => {
  try {
    const areaId = parseInt(req.params.id, 10);
    const { area_name, area_code, zone_ids } = req.body;
    if (!area_name?.trim()) {
      return res.status(400).json({ success: false, message: 'area_name is required' });
    }

    const zoneIds = Array.isArray(zone_ids) ? zone_ids.map((id) => parseInt(id, 10)) : [];

    const availability = await assertZonesAvailable(zoneIds, areaId);
    if (availability.error) {
      return res.status(availability.status).json({ success: false, message: availability.error });
    }

    const payload = { area_name: area_name.trim() };
    if (area_code !== undefined) {
      payload.area_code = area_code?.trim() ? area_code.trim().toUpperCase() : null;
    }

    const { data, error } = await supabase
      .from('areas')
      .update(payload)
      .eq('area_id', areaId)
      .select()
      .single();

    if (error) throw error;

    // Release zones that were assigned to this area but are no longer selected
    const { error: releaseError } = await supabase
      .from('zones')
      .update({ area_id: null })
      .eq('area_id', areaId)
      .not('zone_id', 'in', `(${zoneIds.length > 0 ? zoneIds.join(',') : '0'})`);
    if (releaseError) throw releaseError;

    // Assign the currently-selected zones to this area
    if (zoneIds.length > 0) {
      const { error: assignError } = await supabase
        .from('zones')
        .update({ area_id: areaId })
        .in('zone_id', zoneIds);
      if (assignError) throw assignError;
    }

    return res.status(200).json({ success: true, data, message: 'Area updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/areas/:id → delete area (zones are released back to the
//   unassigned pool via the zones.area_id FK's ON DELETE SET NULL)
router.delete('/:id', checkRole([ROLES.ADO]), async (req, res) => {
  try {
    const areaId = parseInt(req.params.id, 10);

    const { error } = await supabase.from('areas').delete().eq('area_id', areaId);
    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Area deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

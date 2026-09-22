import express from 'express';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole, ROLES } from '../middleware/role.js';

const router = express.Router();
router.use(authenticate);
router.use(checkRole([ROLES.ADO]));

// GET /api/zones[?unassigned=true]  → all zones, or only unassigned ones
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('zones')
      .select('zone_id, zone_name, zone_code, area_id')
      .order('zone_name');

    if (req.query.unassigned === 'true') {
      query = query.is('area_id', null);
    }

    const { data: zones, error } = await query;
    if (error) throw error;

    const areaIds = [...new Set((zones || []).map((z) => z.area_id).filter((id) => id !== null))];
    let areaMap = {};
    if (areaIds.length > 0) {
      const { data: areas, error: areaError } = await supabase
        .from('areas')
        .select('area_id, area_name')
        .in('area_id', areaIds);
      if (areaError) throw areaError;
      (areas || []).forEach((a) => { areaMap[a.area_id] = a; });
    }

    const enriched = (zones || []).map((z) => ({
      ...z,
      area: z.area_id ? (areaMap[z.area_id] || null) : null,
    }));

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/zones → create a standalone (unassigned) zone
router.post('/', async (req, res) => {
  try {
    const { zone_name, zone_code } = req.body;
    if (!zone_name?.trim()) {
      return res.status(400).json({ success: false, message: 'zone_name is required' });
    }

    const payload = { zone_name: zone_name.trim(), area_id: null };
    if (zone_code?.trim()) payload.zone_code = zone_code.trim().toUpperCase();

    const { data, error } = await supabase
      .from('zones')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data, message: 'Zone created successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/zones/:id → update zone name/code (area membership is managed via /api/areas)
router.put('/:id', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id, 10);
    const { zone_name, zone_code } = req.body;
    if (!zone_name?.trim()) {
      return res.status(400).json({ success: false, message: 'zone_name is required' });
    }

    const payload = { zone_name: zone_name.trim() };
    if (zone_code !== undefined) {
      payload.zone_code = zone_code?.trim() ? zone_code.trim().toUpperCase() : null;
    }

    const { data, error } = await supabase
      .from('zones')
      .update(payload)
      .eq('zone_id', zoneId)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data, message: 'Zone updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/zones/:id → delete a zone
router.delete('/:id', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id, 10);
    const { error } = await supabase.from('zones').delete().eq('zone_id', zoneId);
    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Zone deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

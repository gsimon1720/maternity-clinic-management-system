import request from './api';

// ─── Areas ────────────────────────────────────────────────────────────────
export const getAreas = (clinicId) =>
  request(`/areas${clinicId ? `?clinic_id=${clinicId}` : ''}`);

export const createArea = (clinicId, area_name, area_code, zoneIds = []) =>
  request('/areas', {
    method: 'POST',
    body: JSON.stringify({ clinic_id: clinicId, area_name, area_code: area_code || '', zone_ids: zoneIds }),
  });

export const updateArea = (areaId, area_name, area_code, zoneIds = []) =>
  request(`/areas/${areaId}`, {
    method: 'PUT',
    body: JSON.stringify({ area_name, area_code: area_code ?? '', zone_ids: zoneIds }),
  });

export const deleteArea = (areaId) =>
  request(`/areas/${areaId}`, { method: 'DELETE' });

// ─── Zones (standalone — created independently of any Area) ───────────────
export const getZones = (unassignedOnly = false) =>
  request(`/zones${unassignedOnly ? '?unassigned=true' : ''}`);

export const createZone = (zone_name, zone_code) =>
  request('/zones', {
    method: 'POST',
    body: JSON.stringify({ zone_name, zone_code: zone_code || '' }),
  });

export const updateZone = (zoneId, zone_name, zone_code) =>
  request(`/zones/${zoneId}`, {
    method: 'PUT',
    body: JSON.stringify({ zone_name, zone_code: zone_code ?? '' }),
  });

export const deleteZone = (zoneId) =>
  request(`/zones/${zoneId}`, { method: 'DELETE' });

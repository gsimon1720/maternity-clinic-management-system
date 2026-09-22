import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Map, Plus, Trash2, Edit2, Check, X,
  Building2, RefreshCw, Layers, AlertCircle, Search, Eye, CheckSquare
} from 'lucide-react';
import {
  getAreas, createArea, updateArea, deleteArea,
  getZones, createZone, updateZone, deleteZone,
} from '../../services/areaService';
import { getClinics } from '../../services/clinicService';
import toast from 'react-hot-toast';

const C = {
  pink50: '#fdf2f8', pink100: '#fce7f3', pink200: '#fbcfe8',
  pink600: '#db2777', pink800: '#9d174d', pink900: '#831843',
  purple50: '#fdf2f8', purple100: '#fce7f3', purple200: '#fbcfe8',
  purple600: '#db2777', purple700: '#be185d', purple900: '#831843',
};

const inputBase = {
  padding: '10px 14px', border: `2px solid ${C.pink200}`, borderRadius: '10px',
  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
  color: C.pink900, background: 'white', boxSizing: 'border-box',
};

const Btn = ({ onClick, disabled, children, bg = C.pink600, color = 'white', border, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '9px 16px', background: bg, color, border: border || 'none',
      borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap',
      opacity: disabled ? 0.6 : 1, transition: 'opacity 0.2s', ...style,
    }}
  >
    {children}
  </button>
);

const Field = ({ label, value, onChange, placeholder, onKeyDown, autoFocus, style = {} }) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: C.pink800, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {label}
    </label>
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      style={{ ...inputBase, width: '100%', ...style }}
    />
  </div>
);

const formatDate = (ts) => {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return ts;
  }
};

const AreaZoneManagement = () => {
  const [activeTab, setActiveTab] = useState('areas');

  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [loadingClinics, setLoadingClinics] = useState(true);

  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [areaSearch, setAreaSearch] = useState('');

  const [allZones, setAllZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);

  const [unassignedZones, setUnassignedZones] = useState([]);

  // Add Area form
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaCode, setNewAreaCode] = useState('');
  const [newAreaZoneIds, setNewAreaZoneIds] = useState(new Set());
  const [savingArea, setSavingArea] = useState(false);

  // Edit Area  { id, name, code, zoneIds: Set }
  const [editArea, setEditArea] = useState(null);
  const [editAreaZoneOptions, setEditAreaZoneOptions] = useState([]);

  // Add Zone form
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCode, setNewZoneCode] = useState('');
  const [savingZone, setSavingZone] = useState(false);

  // Edit Zone  { id, name, code }
  const [editZone, setEditZone] = useState(null);

  // ── load clinics ─────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingClinics(true);
    getClinics()
      .then((raw) => {
        const list = Array.isArray(raw) ? raw : [];
        setClinics(list);
        if (list.length > 0) {
          setSelectedClinicId(String(list[0].clinic_id ?? list[0].id ?? ''));
        }
      })
      .catch(() => toast.error('Failed to load clinics'))
      .finally(() => setLoadingClinics(false));
  }, []);

  // ── fetch areas for selected clinic ─────────────────────────────────────
  const fetchAreas = useCallback(async (clinicId) => {
    const cid = String(clinicId || '').trim();
    if (!cid) return;
    setLoadingAreas(true);
    setFetchError('');
    try {
      const raw = await getAreas(cid);
      setAreas(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setFetchError(err.message || 'Failed to load areas');
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }, []);

  useEffect(() => { if (selectedClinicId) fetchAreas(selectedClinicId); }, [selectedClinicId, fetchAreas]);

  // ── fetch all zones (Zones tab) ──────────────────────────────────────────
  const fetchAllZones = useCallback(async () => {
    setLoadingZones(true);
    try {
      const raw = await getZones(false);
      setAllZones(Array.isArray(raw) ? raw : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load zones');
      setAllZones([]);
    } finally {
      setLoadingZones(false);
    }
  }, []);

  useEffect(() => { fetchAllZones(); }, [fetchAllZones]);

  // ── fetch unassigned zones (for Add Area picker) ────────────────────────
  const fetchUnassignedZones = useCallback(async () => {
    try {
      const raw = await getZones(true);
      setUnassignedZones(Array.isArray(raw) ? raw : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load unassigned zones');
      setUnassignedZones([]);
    }
  }, []);

  useEffect(() => { fetchUnassignedZones(); }, [fetchUnassignedZones]);

  // ── Area CRUD ─────────────────────────────────────────────────────────────
  const handleAddArea = async () => {
    if (!newAreaName.trim()) return toast.error('Area name is required');
    if (!selectedClinicId) return toast.error('Select a clinic first');
    setSavingArea(true);
    try {
      await createArea(parseInt(selectedClinicId, 10), newAreaName.trim(), newAreaCode.trim(), [...newAreaZoneIds]);
      toast.success(`Area "${newAreaName.trim()}" added!`);
      setNewAreaName(''); setNewAreaCode(''); setNewAreaZoneIds(new Set());
      await Promise.all([fetchAreas(selectedClinicId), fetchUnassignedZones(), fetchAllZones()]);
    } catch (err) {
      toast.error(err.message || 'Failed to add area');
    } finally {
      setSavingArea(false);
    }
  };

  const toggleNewAreaZone = (zoneId) => {
    setNewAreaZoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId); else next.add(zoneId);
      return next;
    });
  };

  const startEditArea = (area) => {
    setEditArea({
      id: area.area_id,
      name: area.area_name,
      code: area.area_code || '',
      zoneIds: new Set((area.zones || []).map((z) => z.zone_id)),
    });
    // Zone options for editing = currently unassigned zones + this area's own zones
    const ownZones = area.zones || [];
    const merged = [...ownZones, ...unassignedZones.filter((z) => !ownZones.some((o) => o.zone_id === z.zone_id))];
    setEditAreaZoneOptions(merged);
  };

  const toggleEditAreaZone = (zoneId) => {
    setEditArea((prev) => {
      const next = new Set(prev.zoneIds);
      if (next.has(zoneId)) next.delete(zoneId); else next.add(zoneId);
      return { ...prev, zoneIds: next };
    });
  };

  const handleSaveArea = async () => {
    if (!editArea?.name?.trim()) return toast.error('Area name is required');
    try {
      await updateArea(editArea.id, editArea.name.trim(), editArea.code ?? '', [...editArea.zoneIds]);
      toast.success('Area updated');
      setEditArea(null);
      await Promise.all([fetchAreas(selectedClinicId), fetchUnassignedZones(), fetchAllZones()]);
    } catch (err) {
      toast.error(err.message || 'Failed to update area');
    }
  };

  const handleDeleteArea = async (areaId, name) => {
    if (!window.confirm(`Delete area "${name}"? Its zones will be released back to the unassigned pool.`)) return;
    try {
      await deleteArea(areaId);
      toast.success('Area deleted');
      await Promise.all([fetchAreas(selectedClinicId), fetchUnassignedZones(), fetchAllZones()]);
    } catch (err) {
      toast.error(err.message || 'Failed to delete area');
    }
  };

  // ── Zone CRUD (standalone) ───────────────────────────────────────────────
  const handleAddZone = async () => {
    if (!newZoneName.trim()) return toast.error('Zone name is required');
    setSavingZone(true);
    try {
      await createZone(newZoneName.trim(), newZoneCode.trim());
      toast.success(`Zone "${newZoneName.trim()}" added!`);
      setNewZoneName(''); setNewZoneCode('');
      await Promise.all([fetchAllZones(), fetchUnassignedZones()]);
    } catch (err) {
      toast.error(err.message || 'Failed to add zone');
    } finally {
      setSavingZone(false);
    }
  };

  const handleSaveZone = async () => {
    if (!editZone?.name?.trim()) return toast.error('Zone name is required');
    try {
      await updateZone(editZone.id, editZone.name.trim(), editZone.code ?? '');
      toast.success('Zone updated');
      setEditZone(null);
      await Promise.all([fetchAllZones(), fetchUnassignedZones(), fetchAreas(selectedClinicId)]);
    } catch (err) {
      toast.error(err.message || 'Failed to update zone');
    }
  };

  const handleDeleteZone = async (zoneId, name) => {
    if (!window.confirm(`Delete zone "${name}"?`)) return;
    try {
      await deleteZone(zoneId);
      toast.success('Zone deleted');
      await Promise.all([fetchAllZones(), fetchUnassignedZones(), fetchAreas(selectedClinicId)]);
    } catch (err) {
      toast.error(err.message || 'Failed to delete zone');
    }
  };

  const totalZonesInClinic = areas.reduce((s, a) => s + (a.zones?.length || 0), 0);
  const selectedClinic = clinics.find((c) => String(c.clinic_id ?? c.id) === String(selectedClinicId));
  const filteredAreas = areas.filter((a) => a.area_name.toLowerCase().includes(areaSearch.toLowerCase()));
  const unassignedCount = allZones.filter((z) => !z.area_id).length;

  return (
    <div style={{ padding: '8px 0' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${C.pink600}, ${C.pink900})`, borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '8px' }}><Layers size={24} /></div>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0 }}>Area &amp; Zone Management</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '14px', margin: 0 }}>Define administrative divisions across clinics — used for midwife assignment</p>
        </div>
        <Btn onClick={() => { fetchAreas(selectedClinicId); fetchAllZones(); fetchUnassignedZones(); }} bg="rgba(255,255,255,0.15)" border="1px solid rgba(255,255,255,0.3)">
          <RefreshCw size={16} /> Refresh
        </Btn>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Clinics', value: clinics.length, icon: Building2, color: C.pink600, bg: C.pink50 },
          { label: 'Areas (this clinic)', value: areas.length, icon: Map, color: C.purple600, bg: C.purple50 },
          { label: 'Total Zones', value: allZones.length, icon: MapPin, color: '#059669', bg: '#f0fdf4' },
          { label: 'Unassigned Zones', value: unassignedCount, icon: AlertCircle, color: '#d97706', bg: '#fffbeb' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: `1px solid ${C.pink200}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: bg, borderRadius: '12px', padding: '12px' }}><Icon size={22} color={color} /></div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: C.pink900 }}>{value}</div>
              <div style={{ fontSize: '12px', color: C.pink800 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'areas', label: 'Areas' },
          { id: 'zones', label: 'Zones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '14px',
              background: activeTab === tab.id ? `linear-gradient(135deg, ${C.pink600}, ${C.pink900})` : 'white',
              color: activeTab === tab.id ? 'white' : C.pink800,
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(219,39,119,0.25)' : `0 1px 3px rgba(0,0,0,0.05)`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'zones' && (
        <div>
          {/* ── Add Zone ─────────────────────────────────────────────── */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: `1px solid ${C.pink200}`, marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: C.pink900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color={C.pink600} /> Add New Zone
            </h2>
            <p style={{ fontSize: '12px', color: C.pink800, marginBottom: '16px' }}>
              Zones start out unassigned — group them into an Area from the Areas tab.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <Field
                label="Zone Name *"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddZone()}
                placeholder="e.g., North Ward"
              />
              <Field
                label="Zone Code"
                value={newZoneCode}
                onChange={(e) => setNewZoneCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAddZone()}
                placeholder="e.g., Z-01"
                style={{ maxWidth: '160px' }}
              />
              <Btn
                onClick={handleAddZone}
                disabled={savingZone || !newZoneName.trim()}
                bg={`linear-gradient(135deg, ${C.pink600}, ${C.pink900})`}
                style={{ padding: '11px 20px' }}
              >
                <Plus size={16} /> {savingZone ? 'Adding…' : 'Add Zone'}
              </Btn>
            </div>
          </div>

          {/* ── Zones Table ──────────────────────────────────────────── */}
          <div style={{ background: 'white', borderRadius: '16px', border: `1px solid ${C.pink200}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.pink50 }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: C.pink800 }}>ZONE NAME</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: C.pink800 }}>CODE</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: C.pink800 }}>ASSIGNED AREA</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: C.pink800 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loadingZones ? (
                  <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: C.pink800 }}>Loading zones…</td></tr>
                ) : allZones.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: C.pink800 }}>No zones yet. Add one above.</td></tr>
                ) : (
                  allZones.map((zone) => (
                    <tr key={zone.zone_id} style={{ borderTop: `1px solid ${C.pink100}` }}>
                      {editZone?.id === zone.zone_id ? (
                        <td colSpan="4" style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <Field
                              label="Zone Name *" value={editZone.name}
                              onChange={(e) => setEditZone((p) => ({ ...p, name: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveZone(); if (e.key === 'Escape') setEditZone(null); }}
                              autoFocus placeholder="Zone name"
                            />
                            <Field
                              label="Zone Code" value={editZone.code || ''}
                              onChange={(e) => setEditZone((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveZone(); if (e.key === 'Escape') setEditZone(null); }}
                              placeholder="e.g., Z-01" style={{ maxWidth: '160px' }}
                            />
                            <Btn onClick={handleSaveZone} bg="#10B981" style={{ padding: '11px 16px' }}><Check size={15} /> Save</Btn>
                            <Btn onClick={() => setEditZone(null)} bg="#f3f4f6" color="#6b7280" style={{ padding: '11px 16px' }}><X size={15} /> Cancel</Btn>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: C.pink900 }}>{zone.zone_name}</td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: C.pink800 }}>{zone.zone_code || '—'}</td>
                          <td style={{ padding: '14px 20px' }}>
                            {zone.area ? (
                              <span style={{ fontSize: '12px', background: C.purple100, color: C.purple900, padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>{zone.area.area_name}</span>
                            ) : (
                              <span style={{ fontSize: '12px', background: '#fffbeb', color: '#d97706', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>Unassigned</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => setEditZone({ id: zone.zone_id, name: zone.zone_name, code: zone.zone_code || '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.purple600 }} title="Edit zone">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteZone(zone.zone_id, zone.zone_name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete zone">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'areas' && (
        <div>
          {/* ── Clinic Selector + Add Area ──────────────────────────────── */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: `1px solid ${C.pink200}`, marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: C.pink900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color={C.pink600} /> Select Clinic &amp; Add New Area
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: C.pink800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Clinic</label>
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                style={{ ...inputBase, width: '100%', maxWidth: '480px', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239d174d' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '40px' }}
              >
                {loadingClinics ? <option>Loading clinics…</option>
                  : clinics.length === 0 ? <option>No clinics found</option>
                    : clinics.map((c) => {
                      const cid = c.clinic_id ?? c.id;
                      return <option key={cid} value={String(cid)}>[{cid}] {c.clinic_name}{c.district ? ` — ${c.district}` : ''}</option>;
                    })}
              </select>
              {selectedClinic && (
                <p style={{ fontSize: '11px', color: C.pink800, marginTop: '5px' }}>
                  Clinic ID: <strong>{selectedClinicId}</strong> · Province: {selectedClinic.province || '—'}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
              <Field
                label="Area Name *"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="e.g., Colombo North"
              />
              <Field
                label="Area Code"
                value={newAreaCode}
                onChange={(e) => setNewAreaCode(e.target.value.toUpperCase())}
                placeholder="e.g., COL-N"
                style={{ maxWidth: '180px' }}
              />
              <Btn
                onClick={handleAddArea}
                disabled={savingArea || !selectedClinicId || !newAreaName.trim()}
                bg={`linear-gradient(135deg, ${C.pink600}, ${C.pink900})`}
                style={{ padding: '11px 20px' }}
              >
                <Plus size={16} /> {savingArea ? 'Adding…' : 'Add Area'}
              </Btn>
            </div>

            {/* Zone checkbox picker — only currently-unassigned zones */}
            <div style={{ background: C.purple50, borderRadius: '12px', padding: '16px', border: `1px solid ${C.purple200}` }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: C.purple700, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckSquare size={14} /> Select Zones for this Area ({unassignedZones.length} available, unassigned)
              </p>
              {unassignedZones.length === 0 ? (
                <p style={{ fontSize: '13px', color: C.purple700, margin: 0 }}>No unassigned zones — add one from the Zones tab first.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {unassignedZones.map((zone) => (
                    <label key={zone.zone_id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: `1px solid ${C.purple200}`, borderRadius: '10px', padding: '6px 12px', fontSize: '13px', color: C.purple900, cursor: 'pointer' }}>
                      <input type="checkbox" checked={newAreaZoneIds.has(zone.zone_id)} onChange={() => toggleNewAreaZone(zone.zone_id)} />
                      {zone.zone_name}{zone.zone_code ? ` (${zone.zone_code})` : ''}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Search ───────────────────────────────────────────────── */}
          <div style={{ position: 'relative', maxWidth: '350px', marginBottom: '16px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.pink800 }} />
            <input
              value={areaSearch}
              onChange={(e) => setAreaSearch(e.target.value)}
              placeholder="Search areas by name…"
              style={{ ...inputBase, width: '100%', paddingLeft: '38px' }}
            />
          </div>

          {fetchError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="#ef4444" />
              <span style={{ fontSize: '14px', color: '#dc2626' }}>{fetchError}</span>
            </div>
          )}

          {/* ── Areas Table ──────────────────────────────────────────── */}
          {loadingAreas ? (
            <div style={{ textAlign: 'center', padding: '60px', color: C.pink800 }}>
              <div style={{ width: '40px', height: '40px', border: `3px solid ${C.pink200}`, borderTopColor: C.pink600, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 16px' }} />
              <p>Loading areas…</p>
            </div>
          ) : filteredAreas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: `2px dashed ${C.pink200}` }}>
              <Map size={56} color={C.pink200} style={{ marginBottom: '16px' }} />
              <h3 style={{ color: C.pink900, marginBottom: '8px' }}>
                {areas.length === 0 ? `No areas yet for ${selectedClinic?.clinic_name || `clinic ${selectedClinicId}`}` : 'No areas match your search'}
              </h3>
              <p style={{ color: C.pink800, fontSize: '14px' }}>{areas.length === 0 ? 'Use the form above to add the first area.' : 'Try a different search term.'}</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '16px', border: `1px solid ${C.pink200}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.pink50 }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: C.pink800 }}>AREA NAME</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: C.pink800 }}># ZONES</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: C.pink800 }}>ASSIGNED ZONES</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: C.pink800 }}>CREATED</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: C.pink800 }}>STATUS</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: C.pink800 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAreas.map((area) => {
                    const isEditingArea = editArea?.id === area.area_id;
                    return (
                      <tr key={area.area_id} style={{ borderTop: `1px solid ${C.pink100}` }}>
                        {isEditingArea ? (
                          <td colSpan="6" style={{ padding: '16px 20px', background: C.purple50 }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '12px' }}>
                              <Field
                                label="Area Name *" value={editArea.name}
                                onChange={(e) => setEditArea((p) => ({ ...p, name: e.target.value }))}
                                autoFocus placeholder="Area name"
                              />
                              <Field
                                label="Area Code" value={editArea.code || ''}
                                onChange={(e) => setEditArea((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                                placeholder="e.g., COL-N" style={{ maxWidth: '160px' }}
                              />
                              <Btn onClick={handleSaveArea} bg="#10B981" style={{ padding: '11px 16px' }}><Check size={15} /> Save</Btn>
                              <Btn onClick={() => setEditArea(null)} bg="#f3f4f6" color="#6b7280" style={{ padding: '11px 16px' }}><X size={15} /> Cancel</Btn>
                            </div>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: C.purple700, margin: '0 0 8px' }}>Zones in this Area:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              {editAreaZoneOptions.length === 0 ? (
                                <p style={{ fontSize: '13px', color: C.purple700, margin: 0 }}>No zones available.</p>
                              ) : editAreaZoneOptions.map((zone) => (
                                <label key={zone.zone_id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: `1px solid ${C.purple200}`, borderRadius: '10px', padding: '6px 12px', fontSize: '13px', color: C.purple900, cursor: 'pointer' }}>
                                  <input type="checkbox" checked={editArea.zoneIds.has(zone.zone_id)} onChange={() => toggleEditAreaZone(zone.zone_id)} />
                                  {zone.zone_name}{zone.zone_code ? ` (${zone.zone_code})` : ''}
                                </label>
                              ))}
                            </div>
                          </td>
                        ) : (
                          <>
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: C.pink900 }}>{area.area_name}</div>
                              {area.area_code && <span style={{ fontSize: '11px', background: C.purple200, color: C.purple900, borderRadius: '4px', padding: '1px 6px', fontWeight: '700' }}>{area.area_code}</span>}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '14px', color: C.pink800 }}>{area.zones?.length || 0}</td>
                            <td style={{ padding: '14px 20px' }}>
                              {(area.zones?.length || 0) > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '320px' }}>
                                  {area.zones.map((z) => (
                                    <span key={z.zone_id} style={{ fontSize: '11px', background: C.purple50, border: `1px solid ${C.purple200}`, color: C.purple700, borderRadius: '10px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                      <MapPin size={10} />{z.zone_name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>No zones</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: C.pink800 }}>{formatDate(area.created_at)}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: (area.status || 'active') === 'active' ? '#10B981' : '#6b7280', textTransform: 'capitalize' }}>
                                {area.status || 'active'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }} title="View area details" onClick={() => toast(`${area.area_name}: ${area.zones?.length || 0} zone(s)`, { icon: '📍' })}>
                                  <Eye size={16} />
                                </button>
                                <button onClick={() => startEditArea(area)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.purple600 }} title="Edit area">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteArea(area.area_id, area.area_name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete area">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ fontSize: '11px', color: C.pink800, marginTop: '10px' }}>
            {totalZonesInClinic} zone{totalZonesInClinic !== 1 ? 's' : ''} assigned across {areas.length} area{areas.length !== 1 ? 's' : ''} in this clinic.
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AreaZoneManagement;

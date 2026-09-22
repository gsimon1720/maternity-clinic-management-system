import request from './api';

const normalizeRole = (role) => String(role || '').toLowerCase();

// Used for user CREATION — sends all required fields
const mapUserToApiPayload = (userData) => {
  const {
    fullName,
    email,
    phoneNumber,
    nic,
    password,
    role,
    clinicId,
    clinicKey,
    clinic_id,
    area_id,
    status,
    ...rest
  } = userData;

  const profileData = { ...(rest.profileData || {}) };

  [
    'licenseNumber',
    'specialization',
    'qualifications',
    'professionalStartDate',
    'emergencyName',
    'emergencyPhone',
    'emergencyRelation',
    'bloodGroup',
    'dateOfBirth',
    'address',
  ].forEach((field) => {
    if (rest[field] !== undefined && rest[field] !== '') {
      profileData[field] = rest[field];
    }
  });

  return {
    fullName: fullName || userData.username,
    username: userData.username || fullName,
    email,
    phoneNumber: phoneNumber ?? rest.phone,
    nic,
    password,
    role: normalizeRole(role),
    clinicId: clinicId ?? clinic_id,
    clinicKey: clinicKey ?? clinicId ?? clinic_id,
    area_id: area_id ? parseInt(area_id, 10) : null,
    status: status || 'active',
    qualificationsList: userData.qualificationsList || rest.qualificationsList || null,
    profileData,
  };
};

// Used for user UPDATES — only sends fields that are explicitly provided.
// This is critical for partial updates like status-only toggle.
const mapUserToUpdatePayload = (userData) => {
  const payload = {};

  if (userData.username !== undefined) payload.username = userData.username;
  if (userData.fullName !== undefined) payload.fullName = userData.fullName;
  if (userData.email !== undefined) payload.email = userData.email;
  if (userData.password !== undefined && userData.password !== '') {
    payload.password = userData.password;
  }
  if (userData.role !== undefined) payload.role = normalizeRole(userData.role);
  if (userData.status !== undefined) payload.status = userData.status;
  if (userData.area_id !== undefined) {
    payload.area_id = userData.area_id ? parseInt(userData.area_id, 10) : null;
  }
  if (userData.licenseNumber !== undefined) payload.licenseNumber = userData.licenseNumber;
  if (userData.specialization !== undefined) payload.specialization = userData.specialization;
  if (userData.qualifications !== undefined) payload.qualifications = userData.qualifications;
  if (userData.qualificationDoc !== undefined) payload.qualificationDoc = userData.qualificationDoc;
  if (userData.professionalStartDate !== undefined) payload.professionalStartDate = userData.professionalStartDate;

  const clinicId = userData.clinicId ?? userData.clinic_id ?? userData.clinicKey;
  if (clinicId !== undefined) payload.clinicKey = clinicId;

  return payload;
};

export const getClinicUsers = async ({ clinicId, search, status, roles, includeAll = false } = {}) => {
  const params = new URLSearchParams();

  if (clinicId !== undefined && clinicId !== null) params.set('clinicKey', clinicId);
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (roles && roles.length > 0) params.set('roles', roles.join(','));
  if (includeAll) params.set('includeAll', 'true');

  const query = params.toString();
  return request(`/users${query ? `?${query}` : ''}`);
};

export const getClinicAreas = async (clinicId, availableOnly = false) => {
  const params = new URLSearchParams();
  if (clinicId) params.set('clinic_id', clinicId);
  if (availableOnly) params.set('availableOnly', 'true');
  return request(`/areas?${params.toString()}`);
};

// SPHM is global — no clinic_id param; returns unassigned areas across every clinic.
export const getAllUnassignedAreas = async () => request('/areas?availableOnly=true');

export const getMidwives = async () => request('/users/midwives');

export const getClinicUserById = async (id) => request(`/users/${id}`);

export const createClinicUser = async (userData) =>
  request('/users', {
    method: 'POST',
    body: JSON.stringify(mapUserToApiPayload(userData)),
  });

// Uses mapUserToUpdatePayload (not the create payload) so partial updates work correctly
export const updateClinicUser = async (id, userData) =>
  request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapUserToUpdatePayload(userData)),
  });

export const getAllUsers = async ({ clinicId, search, status, roles, includeAll = true } = {}) =>
  getClinicUsers({ clinicId, search, status, roles, includeAll });

export const deleteClinicUser = async (id) =>
  request(`/users/${id}`, {
    method: 'DELETE',
  });

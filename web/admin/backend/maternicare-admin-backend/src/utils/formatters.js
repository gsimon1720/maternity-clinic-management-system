const STAFF_TYPES = new Set(['doctor', 'nurse', 'midwife']);

/**
 * Calculates complete years of professional experience from a start date to today.
 * @param {string|null} startDate - ISO date string (e.g., '2015-06-01')
 * @returns {number|null}
 */
const calculateYearsOfExperience = (startDate) => {
  if (!startDate) return null;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const monthDiff = now.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) years--;
  return Math.max(0, years);
};

export const formatClinic = (clinic) => {
  if (!clinic) return null;

  return {
    ...clinic,
    id: clinic.clinic_id ?? clinic.id,
    clinic_id: clinic.clinic_id ?? clinic.id,
    clinic_name: clinic.clinic_name || '',
    clinic_code: clinic.clinic_code || '',
    district: clinic.district || '',
    province: clinic.province || '',
    
    // Obsolete fields fallback to avoid UI breakage
    registration_no: clinic.clinic_code || '',
    address: `${clinic.district || ''}, ${clinic.province || ''}`,
    city: clinic.district || '',
    phone: '',
    email: '',
    status: clinic.status ?? 'active'
  };
};

export const formatClinics = (clinics = []) => clinics.map(formatClinic);

export const formatUser = (user, clinicLookup = {}) => {
  if (!user) return null;

  const clinicId = user.clinic_id ?? user.clinicId ?? null;
  const clinic = clinicLookup[clinicId] || user.clinics || null;
  
  const userRole = (user.role ?? user.user_type ?? '').toLowerCase();
  const nameVal = user.full_name ?? user.fullName ?? user.username ?? user.email ?? '';

  return {
    ...user,
    id: user.user_id ?? user.id,
    user_id: user.user_id ?? user.id,
    username: user.username ?? user.email ?? '',
    fullName: nameVal,
    full_name: nameVal,
    email: user.email ?? '',
    phoneNumber: user.phone ?? user.phoneNumber ?? '',
    phone: user.phone ?? user.phoneNumber ?? '',
    role: userRole,
    user_type: userRole,
    clinicId,
    clinic_id: clinicId,
    clinicName: clinic?.clinic_name ?? user.clinicName ?? '—',
    clinicCity: clinic?.district ?? user.clinicCity ?? '',
    clinicRegistrationNo: clinic?.clinic_code ?? user.clinicRegistrationNo ?? '',
    status: user.status ?? 'active',
    nic: user.nic ?? '',
    lastLogin: user.last_login ?? user.lastLogin ?? null,
    last_login: user.last_login ?? user.lastLogin ?? null,
    licenseNumber: user.license_number ?? user.licenseNumber ?? '',
    license_number: user.license_number ?? user.licenseNumber ?? '',
    specialization: user.specialization ?? '',
    qualifications: user.qualifications ?? '',
    qualificationDoc: user.qualification_doc ?? user.qualificationDoc ?? '',
    qualification_doc: user.qualification_doc ?? user.qualificationDoc ?? '',
    professionalStartDate: user.professional_start_date ?? user.professionalStartDate ?? null,
    professional_start_date: user.professional_start_date ?? user.professionalStartDate ?? null,
    staffQualifications: user.staffQualifications ?? user.staff_qualifications ?? [],
    yearsOfExperience: calculateYearsOfExperience(user.professional_start_date ?? user.professionalStartDate) ?? user.years_of_experience ?? user.yearsOfExperience ?? '',
    years_of_experience: user.years_of_experience ?? user.yearsOfExperience ?? '',
    createdAt: user.created_at ?? user.createdAt ?? '',
  };
};

export const formatUsers = (users = [], clinicLookup = {}) =>
  users.map((user) => formatUser(user, clinicLookup));

export const parseUserInput = (body = {}) => {
  const profileData = body.profileData || {};
  const userType = (body.user_type ?? body.role ?? '').toLowerCase();
  const usernameVal = body.username ?? body.email ?? '';

  return {
    clinic_id:
      parseInt(
        body.clinic_id ?? body.clinicId ?? body.clinicKey ?? profileData.clinicId,
        10
      ) || null,
    area_id: body.area_id ? parseInt(body.area_id, 10) : null,
    user_type: userType || undefined,
    role: (body.role ?? userType ?? '').toUpperCase(),
    username: usernameVal,
    full_name: body.full_name ?? body.fullName ?? usernameVal,
    email: body.email ?? '',
    password: body.password ?? '',
    nic: body.nic ?? '',
    phone: body.phone ?? body.phoneNumber ?? '',
    status: body.status ?? 'active',
    license_number:
      body.license_number ??
      body.licenseNumber ??
      profileData.licenseNumber ??
      null,
    specialization:
      body.specialization ?? profileData.specialization ?? null,
    qualifications:
      body.qualifications ?? profileData.qualifications ?? null,
    qualification_doc:
      body.qualification_doc ??
      body.qualificationDoc ??
      profileData.qualificationDoc ??
      null,
    professional_start_date:
      body.professional_start_date ??
      body.professionalStartDate ??
      profileData.professionalStartDate ??
      null,
    qualificationsList:
      body.qualificationsList ??
      body.qualifications_list ??
      profileData.qualificationsList ??
      null,
  };
};

export const parseUserUpdateInput = (body = {}) => {
  const profileData = body.profileData || {};
  const parsed = {};

  const clinicValue =
    body.clinic_id ?? body.clinicId ?? body.clinicKey ?? profileData.clinicId;
  if (clinicValue !== undefined && clinicValue !== '') {
    parsed.clinic_id = parseInt(clinicValue, 10) || null;
  }

  if (body.user_type !== undefined || body.role !== undefined) {
    parsed.user_type = String(body.user_type ?? body.role).toLowerCase();
  }
  if (body.full_name !== undefined || body.fullName !== undefined || body.username !== undefined) {
    parsed.full_name = body.full_name ?? body.fullName ?? body.username;
  }
  if (body.username !== undefined) parsed.username = body.username;
  if (body.email !== undefined) parsed.email = body.email;
  if (body.password !== undefined && body.password !== '') parsed.password = body.password;
  if (body.nic !== undefined) parsed.nic = body.nic;
  if (body.phone !== undefined || body.phoneNumber !== undefined) {
    parsed.phone = body.phone ?? body.phoneNumber;
  }
  if (body.status !== undefined) parsed.status = body.status;
  if (body.area_id !== undefined) parsed.area_id = body.area_id ? parseInt(body.area_id, 10) : null;

  const assignProfileField = (snakeKey, camelKey, profileKey) => {
    if (
      body[snakeKey] !== undefined ||
      body[camelKey] !== undefined ||
      profileData[profileKey] !== undefined
    ) {
      parsed[snakeKey] = body[snakeKey] ?? body[camelKey] ?? profileData[profileKey];
    }
  };

  assignProfileField('license_number', 'licenseNumber', 'licenseNumber');
  assignProfileField('specialization', 'specialization', 'specialization');
  assignProfileField('qualifications', 'qualifications', 'qualifications');
  assignProfileField('qualification_doc', 'qualificationDoc', 'qualificationDoc');
  assignProfileField(
    'professional_start_date',
    'professionalStartDate',
    'professionalStartDate'
  );

  return parsed;
};

export const isStaffType = (userType) => STAFF_TYPES.has(userType);

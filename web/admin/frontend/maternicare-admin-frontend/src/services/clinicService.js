import request from './api';

export const getClinics = async ({ search, status } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const query = params.toString();
  return request(`/clinics${query ? `?${query}` : ''}`);
};

export const getClinicById = async (id) => request(`/clinics/${id}`);

export const createClinic = async (clinicData) =>
  request('/clinics', {
    method: 'POST',
    body: JSON.stringify(clinicData),
  });

export const updateClinic = async (id, clinicData) =>
  request(`/clinics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clinicData),
  });

export const deleteClinic = async (id) =>
  request(`/clinics/${id}`, {
    method: 'DELETE',
  });

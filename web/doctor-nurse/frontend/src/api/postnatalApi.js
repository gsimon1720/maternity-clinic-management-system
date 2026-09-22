// src/api/postnatalApi.js
import axiosInstance from './axiosConfig';

export const postnatalApi = {
  // Get all postnatal records
  getAll: async (params = {}) => {
    const { page = 1, limit = 10, patientId = null } = params;
    const response = await axiosInstance.get('/postnatal', {
      params: { page, limit, patientId }
    });
    return response.data;
  },

  // Get postnatal by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/postnatal/${id}`);
    return response.data;
  },

  // Get postnatal by patient ID
  getByPatient: async (patientId) => {
    const response = await axiosInstance.get(`/postnatal/patient/${patientId}`);
    return response.data;
  },

  // Get postnatal by pregnancy ID
  getByPregnancy: async (pregnancyId) => {
    const response = await axiosInstance.get(`/postnatal/pregnancy/${pregnancyId}`);
    return response.data;
  },

  // Create postnatal record (Doctor only)
  create: async (data) => {
    const response = await axiosInstance.post('/postnatal', data);
    return response.data;
  },

  // Update postnatal record (Doctor & Nurse)
  update: async (id, data) => {
    const response = await axiosInstance.put(`/postnatal/${id}`, data);
    return response.data;
  },

  // Delete postnatal record (Soft Delete - Doctor only)
  delete: async (id) => {
    const response = await axiosInstance.delete(`/postnatal/${id}`);
    return response.data;
  },
};
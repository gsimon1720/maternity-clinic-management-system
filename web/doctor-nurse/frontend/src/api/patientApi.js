// src/api/patientApi.js
import axiosInstance from './axiosConfig';

export const patientApi = {
  getAll: async (params = {}) => {
    const { search = '', status = 'approved', page = 1, limit = 10 } = params;
    const response = await axiosInstance.get('/patients', {
      params: { search, status, page, limit }
    });
    return response.data;
  },

  getById: async (patientId) => {
    const response = await axiosInstance.get(`/patients/${patientId}`);
    return response.data;
  },

  getPatientWithAllData: async (patientId) => {
    const response = await axiosInstance.get(`/patients/${patientId}/full`);
    return response.data;
  },

  update: async (patientId, data) => {
    const response = await axiosInstance.put(`/patients/${patientId}`, data);
    return response.data;
  },

  updateCurrentPregnancy: async (patientId, pregnancyId, data) => {
    const response = await axiosInstance.put(
      `/patients/${patientId}/pregnancy/${pregnancyId}`,
      data
    );
    return response.data;
  },

  updateMedicalHistory: async (patientId, data) => {
    const response = await axiosInstance.put(
      `/patients/${patientId}/medical-history`,
      data
    );
    return response.data;
  },

  updateFamilyHistory: async (patientId, data) => {
    const response = await axiosInstance.put(
      `/patients/${patientId}/family-history`,
      data
    );
    return response.data;
  },

  
};
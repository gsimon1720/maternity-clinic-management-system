// src/api/clinicCareApi.js
import axiosInstance from './axiosConfig';

export const clinicCareApi = {
  // Get all clinic visits
  getAll: async (params = {}) => {
    const { type = 'all', page = 1, limit = 20 } = params;
    const response = await axiosInstance.get('/clinic-visits', {
      params: { type, page, limit }
    });
    return response.data;
  },

  // Get clinic visit by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/clinic-visits/${id}`);
    return response.data;
  },
};
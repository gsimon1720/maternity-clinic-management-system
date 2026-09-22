// src/api/dashboardApi.js
import axiosInstance from './axiosConfig';

export const dashboardApi = {
  // Doctor Dashboard
  getDoctorDashboard: async () => {
    const response = await axiosInstance.get('/dashboard/doctor');
    return response.data;
  },

  // Nurse Dashboard
  getNurseDashboard: async () => {
    const response = await axiosInstance.get('/dashboard/nurse');
    return response.data;
  },

  // Get dashboard stats
  getStats: async () => {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
  },

  //  Get Clinic Visit Types
  getClinicVisitTypes: async () => {
    const response = await axiosInstance.get('/dashboard/clinic-visit-types');
    return response.data;
  },
};
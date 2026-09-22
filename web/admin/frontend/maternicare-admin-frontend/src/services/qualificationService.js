import request from './api';

export const getStaffQualifications = async (userId) => {
  return request(`/users/${userId}/qualifications`);
};

export const addStaffQualification = async (userId, qualificationData) => {
  return request(`/users/${userId}/qualifications`, {
    method: 'POST',
    body: JSON.stringify(qualificationData),
  });
};

export const updateStaffQualification = async (qualificationId, qualificationData) => {
  return request(`/users/qualifications/${qualificationId}`, {
    method: 'PUT',
    body: JSON.stringify(qualificationData),
  });
};

export const deleteStaffQualification = async (qualificationId) => {
  return request(`/users/qualifications/${qualificationId}`, {
    method: 'DELETE',
  });
};

import { apiClient } from './apiClient.js';

export async function listUsers() {
  return apiClient.request('/users');
}

export async function getUser(id) {
  return apiClient.request(`/users/${id}`);
}

export async function updateUser(id, data) {
  return apiClient.request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateUserRole(id, roleId) {
  return apiClient.request(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ roleId }),
  });
}

export async function updateUserDepartment(id, departmentId) {
  return apiClient.request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ departmentId }),
  });
}

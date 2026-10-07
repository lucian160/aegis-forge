import { apiClient } from './apiClient.js';

export async function submitApplication(application) {
  return apiClient.request('/applications', {
    method: 'POST',
    body: JSON.stringify(application),
  }, { auth: false });
}
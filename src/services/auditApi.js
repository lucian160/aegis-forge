import { apiClient } from './apiClient.js';

export async function getAuditEntries(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return apiClient.request(`/audit?${query.toString()}`);
}

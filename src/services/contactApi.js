import { apiClient } from './apiClient.js';

export async function submitContactMessage(contact) {
  return apiClient.request('/contact', {
    method: 'POST',
    body: JSON.stringify(contact),
  }, { auth: false });
}
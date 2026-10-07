import { apiClient } from './apiClient.js';

const domain = (name) => `/domains/${name}`;

export async function getDepartments() {
  return apiClient.request(domain('departments'));
}

export async function getProjects() {
  return apiClient.request(domain('projects'));
}

export async function getProject(id) {
  return apiClient.request(domain(`projects/${id}`));
}

export async function createProject(data) {
  return apiClient.request(domain('projects'), { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProject(id, data) {
  return apiClient.request(domain(`projects/${id}`), { method: 'PUT', body: JSON.stringify(data) });
}

export async function getTasks() {
  return apiClient.request(domain('tasks'));
}

export async function updateTask(id, data) {
  return apiClient.request(domain(`tasks/${id}`), { method: 'PUT', body: JSON.stringify(data) });
}

export async function getComments(taskId) {
  return apiClient.request(domain('comments') + (taskId ? `?task=${taskId}` : ''));
}

export async function createComment(data) {
  return apiClient.request(domain('comments'), { method: 'POST', body: JSON.stringify(data) });
}

export async function getDocuments() {
  return apiClient.request(domain('documents'));
}

export async function getDocument(id) {
  return apiClient.request(domain(`documents/${id}`));
}

export async function getKnowledgeArticles() {
  return apiClient.request(domain('knowledge'));
}

export async function getKnowledgeArticle(id) {
  return apiClient.request(domain(`knowledge/${id}`));
}

export async function getResearchProjects() {
  return apiClient.request(domain('researchProjects'));
}

export async function getResearchProject(id) {
  return apiClient.request(domain(`researchProjects/${id}`));
}

export async function getApplications() {
  return apiClient.request(domain('applications'));
}

export async function getApplication(id) {
  return apiClient.request(domain(`applications/${id}`));
}

export async function getMeetings() {
  return apiClient.request('/meetings');
}

export async function getMeeting(id) {
  return apiClient.request(`/meetings/${id}`);
}

export async function createMeeting(data) {
  return apiClient.request('/meetings', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMeeting(id, data) {
  return apiClient.request(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function cancelMeeting(id) {
  return apiClient.request(`/meetings/${id}/cancel`, { method: 'PATCH' });
}

export async function getNotifications() {
  return apiClient.request(domain('notifications'));
}

export async function updateNotification(id, data) {
  return apiClient.request(domain(`notifications/${id}`), { method: 'PUT', body: JSON.stringify(data) });
}

export async function getActivities() {
  return apiClient.request(domain('activities'));
}

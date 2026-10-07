import { apiClient } from './apiClient.js';

const request = (path) => apiClient.request(path);

export async function getReportingData({ includeApplications = true } = {}) {
  const endpoints = [
    ['users', request('/users')],
    ['departments', request('/domains/departments')],
    ['projects', request('/domains/projects')],
    ['tasks', request('/domains/tasks')],
    ['meetings', request('/meetings')],
    ['activities', request('/domains/activities')],
  ];

  if (includeApplications) endpoints.push(['applications', request('/domains/applications')]);

  const results = await Promise.all(endpoints.map(([name, promise]) => promise.then((value) => [name, value])));
  return Object.fromEntries(results);
}

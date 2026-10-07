import { apiClient } from './apiClient.js';

const request = (path) => apiClient.request(path);

export async function getReportingData() {
  const endpoints = [
    ['users', request('/users')],
    ['departments', request('/domains/departments')],
    ['projects', request('/domains/projects')],
    ['tasks', request('/domains/tasks')],
    ['meetings', request('/meetings')],
    ['applications', request('/domains/applications')],
    ['activities', request('/domains/activities')],
  ];

  const results = await Promise.allSettled(endpoints.map(([name, promise]) => promise.then((value) => [name, value])));
  return Object.fromEntries(results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []));
}

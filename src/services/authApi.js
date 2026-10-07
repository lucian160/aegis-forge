import { apiClient } from './apiClient.js';

export async function login(email, password) {
  if (!email || !password) throw new Error('Email and password are required.');
  return apiClient.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, { auth: false });
}

export async function register(user) {
  return apiClient.request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user),
  }, { auth: false });
}

export async function resendVerification(email) {
  return apiClient.request('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, { auth: false });
}

export async function verifyEmail(token) {
  return apiClient.request(`/auth/verify-email?token=${encodeURIComponent(token)}`, {}, { auth: false });
}

export async function requestPasswordReset(email) {
  return apiClient.request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, { auth: false });
}

export async function resetPassword(token, password) {
  return apiClient.request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }, { auth: false });
}

export async function refreshSession() {
  return apiClient.request('/auth/refresh', { method: 'POST' }, { auth: false });
}

export async function logout() {
  const logoutRequest = apiClient.request('/auth/logout', { method: 'POST' }, { auth: true });
  apiClient.clearSession();
  try {
    await logoutRequest;
  } finally {
    apiClient.clearSession();
  }
}

export async function getProfile() {
  return apiClient.request('/auth/profile');
}

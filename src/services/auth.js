import { apiClient } from './apiClient.js';
import {
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession as refreshRequest,
  register as registerRequest,
  requestPasswordReset as requestPasswordResetRequest,
  resendVerification as resendVerificationRequest,
  resetPassword as resetPasswordRequest,
  verifyEmail as verifyEmailRequest,
} from './authApi.js';

class AuthService {
  async login(email, password) {
    const session = await loginRequest(email, password);
    return apiClient.setSession(session);
  }

  async logout() {
    await logoutRequest();
  }

  getSession() {
    return apiClient.getSession();
  }

  async refreshSession() {
    try {
      const refreshed = await refreshRequest();
      return apiClient.setSession(refreshed);
    } catch (error) {
      if (error.status === 401) apiClient.clearSession();
      return null;
    }
  }

  async register(user) {
    return registerRequest(user);
  }

  async resendVerification(email) {
    return resendVerificationRequest(email);
  }

  async verifyEmail(token) {
    return verifyEmailRequest(token);
  }

  async getProfile() {
    return getProfile();
  }

  async resetPassword(email) {
    if (!email) throw new Error('Email is required.');
    return requestPasswordResetRequest(email);
  }

  async completePasswordReset(token, password) {
    return resetPasswordRequest(token, password);
  }
}

export const authService = new AuthService();

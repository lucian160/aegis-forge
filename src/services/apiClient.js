const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export class ApiClient {
  constructor({ apiBaseUrl = API_BASE_URL } = {}) {
    this.apiBaseUrl = apiBaseUrl;
    this.accessToken = null;
    this.session = null;
    this.refreshPromise = null;
  }

  getAccessToken() {
    return this.accessToken;
  }

  getSession() {
    return this.session;
  }

  setSession(session) {
    this.accessToken = session.accessToken;
    this.session = session.user;
    return session.user;
  }

  clearSession() {
    this.accessToken = null;
    this.session = null;
  }

  async parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : await response.text();

    if (!response.ok) {
      const message = typeof body === 'object'
        ? body.error || body.message || 'The request failed.'
        : body || 'The request failed.';
      const code = typeof body === 'object' ? body.code : undefined;
      throw new ApiError(message, response.status, code);
    }

    return body;
  }

  async request(path, options = {}, { auth = true, retry = true } = {}) {
    const accessToken = auth ? this.getAccessToken() : null;
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });

    if (response.status === 401 && retry && auth && path !== '/auth/refresh') {
      return this.refreshAndRetry(path, options);
    }

    return this.parseResponse(response);
  }

  async refreshAndRetry(path, options) {
    if (!this.refreshPromise) {
      this.refreshPromise = this.request('/auth/refresh', { method: 'POST' }, { auth: false, retry: false })
        .then((session) => {
          this.setSession(session);
          return session;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    try {
      await this.refreshPromise;
      return this.request(path, options, { auth: true, retry: false });
    } catch (error) {
      if (error.status === 401) this.clearSession();
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

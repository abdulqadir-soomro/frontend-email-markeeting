// API Client for Backend Communication
const API_URL = (process as any).env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Set auth token in localStorage
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Remove auth token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Base fetch wrapper with auth
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    // Handle network errors gracefully
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: (email: string, password: string, name?: string) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  googleAuth: (googleId: string, email: string, name: string, avatar?: string) =>
    apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ googleId, email, name, avatar }),
    }),

  getMe: () => apiFetch('/auth/me'),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

// Campaign API
export const campaignAPI = {
  create: (data: any) =>
    apiFetch('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/campaigns?${query}`);
  },

  get: (id: string) => apiFetch(`/campaigns/${id}`),

  send: (id: string, sendingMethod: 'ses' | 'gmail') =>
    apiFetch(`/campaigns/${id}/send`, {
      method: 'POST',
      body: JSON.stringify({ sendingMethod }),
    }),

  delete: (id: string) =>
    apiFetch(`/campaigns/${id}`, { method: 'DELETE' }),

  getRecipients: (id: string) => apiFetch(`/campaigns/${id}/recipients`),

  getAnalytics: (id: string) => apiFetch(`/campaigns/${id}/analytics`),

  quickSend: (data: any) =>
    apiFetch('/campaigns/quick-send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Subscriber API
export const subscriberAPI = {
  add: (data: any) =>
    apiFetch('/subscribers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/subscribers?${query}`);
  },

  get: (id: string) => apiFetch(`/subscribers/${id}`),

  update: (id: string, data: any) =>
    apiFetch(`/subscribers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/subscribers/${id}`, { method: 'DELETE' }),

  bulkDelete: (ids: string[]) =>
    apiFetch('/subscribers/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  uploadCSV: (csvData: string) =>
    apiFetch('/subscribers/upload', {
      method: 'POST',
      body: JSON.stringify({ csvData }),
    }),

  getStats: () => apiFetch('/subscribers/stats'),
};

// Template API
export const templateAPI = {
  create: (data: any) =>
    apiFetch('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/templates?${query}`);
  },

  get: (id: string) => apiFetch(`/templates/${id}`),

  update: (id: string, data: any) =>
    apiFetch(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/templates/${id}`, { method: 'DELETE' }),

  seed: () => apiFetch('/templates/seed', { method: 'POST' }),
};

// Domain API
export const domainAPI = {
  add: (domain: string) =>
    apiFetch('/domains', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    }),

  list: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/domains?${query}`);
  },

  get: (id: string) => apiFetch(`/domains/${id}`),

  verify: (id: string) =>
    apiFetch(`/domains/${id}/verify`, { method: 'POST' }),

  delete: (id: string) =>
    apiFetch(`/domains/${id}`, { method: 'DELETE' }),

  addEmail: (id: string, email: string) =>
    apiFetch(`/domains/${id}/emails`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  removeEmail: (id: string, email: string) =>
    apiFetch(`/domains/${id}/emails`, {
      method: 'DELETE',
      body: JSON.stringify({ email }),
    }),

  // Manual verification
  verifyManual: (id: string, data: { verificationMethod: string; dnsRecords: any[] }) =>
    apiFetch(`/domains/${id}/verify-manual`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get DNS records for manual verification
  getDNSRecords: (id: string) => apiFetch(`/domains/${id}/dns-records`),
  resetVerification: (id: string) => apiFetch(`/domains/${id}/reset-verification`, {
    method: 'POST',
  }),
};

// Gmail API
export const gmailAPI = {
  connect: (email: string, appPassword: string) =>
    apiFetch('/gmail/connect', {
      method: 'POST',
      body: JSON.stringify({ email, appPassword }),
    }),

  getStatus: () => apiFetch('/gmail/status'),

  disconnect: () => apiFetch('/gmail/disconnect', { method: 'DELETE' }),

  test: () => apiFetch('/gmail/test'),
};

// Admin API
export const adminAPI = {
  getStats: () => apiFetch('/admin/stats'),
  getUsers: () => apiFetch('/admin/users'),
  getCampaigns: () => apiFetch('/admin/campaigns'),
};

export default {
  auth: authAPI,
  campaigns: campaignAPI,
  subscribers: subscriberAPI,
  templates: templateAPI,
  domains: domainAPI,
  gmail: gmailAPI,
};
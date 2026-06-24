const API_BASE = import.meta.env.VITE_API_BASE || 'https://safepulse-production-4e0d.up.railway.app';

export const AUTH_ENDPOINTS = {
  SIGNUP: `${API_BASE}/api/auth/signup/`,
  LOGIN: `${API_BASE}/api/auth/login/`,
  LOGOUT: `${API_BASE}/api/auth/logout/`,
  PROFILE: `${API_BASE}/api/auth/profile/`,
  REFRESH: `${API_BASE}/api/auth/refresh/`,
  ORG_SEARCH: `${API_BASE}/api/auth/organisations/search/`,
};

export const INCIDENT_ENDPOINTS = {
  LIST: `${API_BASE}/api/incidents/incidents/`,
  SUBMIT: `${API_BASE}/api/incidents/incidents/submit/`,
  STATS: `${API_BASE}/api/incidents/incidents/stats/`,
  ACKNOWLEDGE: (id) => `${API_BASE}/api/incidents/incidents/${id}/acknowledge/`,
  DETAIL: (id) => `${API_BASE}/api/incidents/incidents/${id}/`,
  DASHBOARD: `${API_BASE}/api/incidents/dashboard/`,
  COORDINATOR_DASHBOARD: `${API_BASE}/api/incidents/coordinator-dashboard/`,
};

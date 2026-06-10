export const API_BASE_URL = "https://safepulse-production-4e0d.up.railway.app";

export const AUTH_ENDPOINTS = {
  SIGNUP: '/api/auth/signup/',
  LOGIN: '/api/auth/login/',
  LOGOUT: '/api/auth/logout/',
  PROFILE: '/api/auth/profile/',
  REFRESH: '/api/auth/refresh/',
  ORG_SEARCH: '/api/auth/organisations/search/',
};

export const INCIDENT_ENDPOINTS = {
  LIST: '/api/incidents/',
  SUBMIT: '/api/incidents/submit/',
  STATS: '/api/incidents/stats/',
  ACKNOWLEDGE: (id) => `/api/incidents/${id}/acknowledge/`,
  DETAIL: (id) => `/api/incidents/${id}/`,
  DASHBOARD: '/api/incidents/dashboard/',
  COORDINATOR_DASHBOARD: '/api/incidents/coordinator-dashboard/',
};

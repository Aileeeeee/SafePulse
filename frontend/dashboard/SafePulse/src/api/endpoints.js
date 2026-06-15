export const AUTH_ENDPOINTS = {
  SIGNUP: '/api/auth/signup/',
  LOGIN: '/api/auth/login/',
  LOGOUT: '/api/auth/logout/',
  PROFILE: '/api/auth/profile/',
  REFRESH: '/api/auth/refresh/',
  ORG_SEARCH: '/api/auth/organisations/search/',
};

export const INCIDENT_ENDPOINTS = {
  LIST: '/api/incidents/incidents/',
  SUBMIT: '/api/incidents/incidents/submit/',
  STATS: '/api/incidents/incidents/stats/',
  ACKNOWLEDGE: (id) => `/api/incidents/incidents/${id}/acknowledge/`,
  DETAIL: (id) => `/api/incidents/incidents/${id}/`,
  DASHBOARD: '/api/incidents/dashboard/',
  COORDINATOR_DASHBOARD: '/api/incidents/coordinator-dashboard/',
};

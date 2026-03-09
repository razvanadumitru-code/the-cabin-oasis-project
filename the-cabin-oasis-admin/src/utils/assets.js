const API_BASE = (import.meta.env?.VITE_API_BASE || 'http://127.0.0.1:3000').replace(/\/$/, '');

export const apiUrl = (path = '') => {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};

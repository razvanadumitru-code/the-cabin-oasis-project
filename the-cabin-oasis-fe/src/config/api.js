const normalizePath = (path = '') => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
};

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
export const apiUrl = (path = '') => `${API_BASE}${normalizePath(path)}`;

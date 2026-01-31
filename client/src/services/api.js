import axios from 'axios';

/**
 * Axios instance
 * Priority:
 * 1) VITE_API_BASE_URL (Vercel – production)
 * 2) VITE_API_URL (legacy fallback)
 * 3) localhost (development)
 */
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ======================
   Upload CSV
====================== */
export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/imports/upload', formData);
};

/* ======================
   Imports
====================== */
export const getImports = () => api.get('/api/imports');
export const getImport = (id) => api.get(`/api/imports/${id}`);

/* ======================
   Leads - FIXED ENDPOINT
   Backend uses /api/leads (NOT /api/leads/search)
====================== */
export const getLeads = (params = {}) => {
  return api.get('/api/leads', { params });
};

/* ======================
   Stats
====================== */
export const getStats = () => api.get('/api/stats');

/* ======================
   AI Email Generation
====================== */
export const generateEmail = (lead, emailType) =>
  api.post('/api/leads/generate-email', { lead, emailType });

export default api;
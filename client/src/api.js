import axios from 'axios';

// Client HTTP centralisé pour toutes les requêtes vers le backend
// - En local: utiliser le backend local si VITE_API_URL n'est pas défini
// - En prod: utiliser VITE_API_URL si défini
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://web-production-17c8b.up.railway.app');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
    'X-Admin-Key': 'ZENDO_ADMIN_2026',
  },
});

export default api;


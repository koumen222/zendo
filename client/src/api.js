import axios from 'axios';

// Client HTTP centralisé pour toutes les requêtes vers le backend
// - En local: pointe vers le backend local
// - En prod: utiliser VITE_API_URL (ex: Railway)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;


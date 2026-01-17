import axios from 'axios';

// Client HTTP centralisé pour toutes les requêtes vers le backend
// - En local: utiliser l'URL Railway par defaut
// - En prod: utiliser VITE_API_URL si defini
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://web-production-17c8b.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;


import axios from 'axios';

// Client HTTP centralisé pour toutes les requêtes vers le backend Railway
const api = axios.create({
  baseURL: 'https://web-production-17c8b.up.railway.app',
  headers: { 'Content-Type': 'application/json' },
});

export default api;


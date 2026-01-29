import axios from 'axios';

// URL de base de l'API :
// - En production : définir VITE_API_URL dans le .env de Vite (ex: l'URL Railway)
// - En développement : laisser vide pour utiliser le proxy Vite (/api -> backend local)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // Timeout global pour éviter les requêtes bloquantes
});

// Log en console si une requête est lente (utile pour détecter la latence)
const SLOW_REQUEST_THRESHOLD_MS = 1500;

api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

api.interceptors.response.use(
  (response) => {
    const startTime = response.config?.metadata?.startTime;
    if (startTime) {
      const duration = Date.now() - startTime;
      if (duration >= SLOW_REQUEST_THRESHOLD_MS) {
        console.warn(
          `[LATENCE] ${response.config?.method?.toUpperCase()} ${response.config?.url} - ${duration}ms`
        );
      }
    }
    return response;
  },
  (error) => {
    const startTime = error.config?.metadata?.startTime;
    if (startTime) {
      const duration = Date.now() - startTime;
      if (duration >= SLOW_REQUEST_THRESHOLD_MS) {
        console.warn(
          `[LATENCE] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`
        );
      }
    }
    const status = error.response?.status;
    console.error('[API ERROR]', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);


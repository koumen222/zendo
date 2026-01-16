import { api } from './api';
import { isPageLoaded } from './pageLoader';

/**
 * Track a page visit (seulement après chargement de la page)
 */
export const trackVisit = async (path) => {
  // Attendre que la page soit chargée avant de tracker
  if (!isPageLoaded()) {
    // Retry après un court délai
    setTimeout(() => trackVisit(path), 500);
    return;
  }

  try {
    await api.post('/api/analytics/track-visit', {
      path: path || window.location.pathname,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent || '',
    });
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.debug('Visit tracking failed:', error);
  }
};

/**
 * Track page view on component mount
 */
export const usePageTracking = () => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    trackVisit(path);
  }
};

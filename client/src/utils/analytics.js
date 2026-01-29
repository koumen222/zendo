import { api } from './api';

const isProduction = import.meta.env.PROD; // Désactive le tracking en production
let hasUserInteracted = false;

// Diffère le tracking jusqu'à une interaction utilisateur (non bloquant)
const deferUntilInteraction = (callback) => {
  if (hasUserInteracted) {
    callback();
    return;
  }

  const trigger = () => {
    if (hasUserInteracted) return;
    hasUserInteracted = true;
    window.removeEventListener('pointerdown', trigger);
    window.removeEventListener('keydown', trigger);
    window.removeEventListener('scroll', trigger);
    window.removeEventListener('touchstart', trigger);
    callback();
  };

  window.addEventListener('pointerdown', trigger, { once: true, passive: true });
  window.addEventListener('keydown', trigger, { once: true, passive: true });
  window.addEventListener('scroll', trigger, { once: true, passive: true });
  window.addEventListener('touchstart', trigger, { once: true, passive: true });

  if ('requestIdleCallback' in window) {
    requestIdleCallback(trigger, { timeout: 4000 });
  } else {
    setTimeout(trigger, 4000);
  }
};

/**
 * Track a page visit (chaque visite compte)
 */
export const trackVisit = async (path) => {
  if (isProduction) {
    return;
  }

  deferUntilInteraction(async () => {
    try {
      await api.post(
        '/api/analytics/track-visit',
        {
          path: path || window.location.pathname,
          referrer: document.referrer || '',
          userAgent: navigator.userAgent || '',
        },
        { timeout: 3000 }
      );
    } catch (error) {
      // Silently fail - don't interrupt user experience
      if (!isProduction) {
        console.debug('Visit tracking failed:', error);
      }
    }
  });
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

/**
 * Système de chargement de page qui bloque tous les scripts non essentiels
 * jusqu'à ce que les images critiques soient chargées
 */

let pageLoaded = false;
let imageLoadPromises = [];

/**
 * Attend que les images critiques soient chargées
 */
export const waitForCriticalImages = () => {
  if (pageLoaded) return Promise.resolve();

  return new Promise((resolve) => {
    const criticalImages = [
      '/ChatGPT Image 13 janv. 2026, 17_11_57.png',
      '/images/ChatGPT Image 13 janv. 2026, 17_25_05.png',
    ];

    const loadPromises = criticalImages.map((src) => {
      return new Promise((imgResolve) => {
        const img = new Image();
        img.onload = () => imgResolve();
        img.onerror = () => imgResolve(); // Continue même si erreur
        img.src = src;
      });
    });

    Promise.all(loadPromises).then(() => {
      pageLoaded = true;
      resolve();
    });
  });
};

/**
 * Initialise le chargement de page
 */
export const initPageLoad = () => {
  // Désactiver temporairement Meta Pixel jusqu'au chargement
  if (typeof window !== 'undefined' && window.fbq) {
    const originalFbq = window.fbq;
    window.fbq = function(...args) {
      if (pageLoaded) {
        originalFbq.apply(window, args);
      }
    };
  }

  return waitForCriticalImages();
};

/**
 * Marque la page comme chargée
 */
export const markPageAsLoaded = () => {
  pageLoaded = true;
};

/**
 * Vérifie si la page est chargée
 */
export const isPageLoaded = () => pageLoaded;

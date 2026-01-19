import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CODForm from '../components/CODForm';
import { waitForCriticalImages, markPageAsLoaded } from '../utils/pageLoader';

const MAX_IMAGE_WIDTH = 1080;
const IMAGE_QUALITY = 0.72;
const MAX_DATA_URL_LENGTH = 900000; // ~900 KB

const useOptimizedImage = (src, maxWidth = MAX_IMAGE_WIDTH, quality = IMAGE_QUALITY) => {
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  useEffect(() => {
    if (!src || typeof window === 'undefined') return;
    if (!src.startsWith('/')) {
      setOptimizedSrc(src);
      return;
    }

    const cacheKey = `img-opt:${src}:${maxWidth}:${quality}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setOptimizedSrc(cached);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.src = src;
    image.onload = () => {
      if (cancelled) return;
      const scale = Math.min(1, maxWidth / image.width);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, width, height);

      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/webp', quality);
      } catch {
        dataUrl = '';
      }
      if (!dataUrl || dataUrl === 'data:,') {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      if (dataUrl && dataUrl.length <= MAX_DATA_URL_LENGTH) {
        try {
          sessionStorage.setItem(cacheKey, dataUrl);
        } catch {
          // Ignore cache errors (quota)
        }
        setOptimizedSrc(dataUrl);
      } else {
        setOptimizedSrc(src);
      }
    };

    return () => {
      cancelled = true;
    };
  }, [src, maxWidth, quality]);

  return optimizedSrc;
};

const OptimizedImage = ({ src, alt, loading = 'lazy', fetchPriority, className, style }) => {
  const optimizedSrc = useOptimizedImage(src);
  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      style={style}
    />
  );
};

const BBL_IMAGES = [
  new URL('../../bbl product/BBL1.png', import.meta.url).href,
  new URL('../../bbl product/BBL2.png', import.meta.url).href,
  new URL('../../bbl product/BLL3.png', import.meta.url).href,
];
const GUMIES_IMAGES = [
  new URL('../../Images gumies/i1.png', import.meta.url).href,
  new URL('../../Images gumies/i2.png', import.meta.url).href,
  new URL('../../Images gumies/i3.png', import.meta.url).href,
  new URL('../../Images gumies/i4.png', import.meta.url).href,
  new URL('../../Images gumies/i5.jpg', import.meta.url).href,
  new URL('../../Images gumies/i6.png', import.meta.url).href,
  new URL('../../Images gumies/i7.png', import.meta.url).href,
  new URL('../../Images gumies/8.png', import.meta.url).href,
];
const GUMIES_FORM_FOOTER = new URL('../../Gummies-Equilibre-Intime_12 (1).jpg', import.meta.url).href;
const GUMIES_OFFERS = [
  { qty: 1, label: '1 Boite - 16 000 FCFA', priceValue: 16000 },
  { qty: 2, label: '2 Boites - 25 000 FCFA', priceValue: 25000 },
  { qty: 3, label: '3 Boites - 31 000 FCFA', priceValue: 31000 },
];

function ProductPage() {
  const { slug } = useParams();
  const isBblProduct = (slug || '').toLowerCase() === 'bbl';
  const isGumiesProduct = (slug || '').toLowerCase() === 'gumies';
  const galleryImages = isBblProduct ? BBL_IMAGES : isGumiesProduct ? GUMIES_IMAGES : [];
  const formBgColor =
    isBblProduct || isGumiesProduct ? 'rgba(219, 39, 119, 0.15)' : 'rgba(139, 92, 246, 0.15)';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Fonction pour scroller vers le formulaire avec effet visuel
  const scrollToForm = () => {
    const formElement = document.getElementById('order-form');
    if (formElement) {
      const headerOffset = 80; // Offset pour le header
      const elementPosition = formElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Effet visuel : highlight du formulaire
      setTimeout(() => {
        formElement.classList.add('ring-4', 'ring-primary-400', 'ring-opacity-50');
        setTimeout(() => {
          formElement.classList.remove('ring-4', 'ring-primary-400', 'ring-opacity-50');
        }, 2000);
      }, 500);
    }
  };

  useEffect(() => {
    if (isBblProduct || isGumiesProduct) {
      setProductData({
        name: isGumiesProduct ? 'Gumies' : 'BBL',
        price: 'Prix sur demande',
        images: galleryImages,
        description: '',
        shortDesc: '',
        benefits: [],
        usage: '',
        deliveryInfo: '',
        reviews: [],
        stock: 'En stock',
        rating: 0,
        reviewCount: 0,
        sections: [],
        faq: [],
        whyItWorks: null,
        guarantee: '',
      });
    } else {
      // Données hardcodées pour Hismile uniquement
      setProductData({
        name: 'Hismile™ – Le Sérum Qui Blanchis tes dents dès le premier jour',
        price: 'Prix sur demande',
        images: [],
        description: '',
        shortDesc: 'Sérum correcteur de teinte pour les dents. Effet instantané, sans peroxyde.',
        benefits: [],
        usage: '',
        deliveryInfo: '',
        reviews: [],
        stock: 'En stock',
        rating: 4.8,
        reviewCount: 252,
        sections: [],
        faq: [],
        whyItWorks: null,
        guarantee: 'Il est recommandé par les dentistes du Cameroun et du monde entier.',
      });
    }

    if (isBblProduct || isGumiesProduct) {
      const criticalImages = galleryImages.slice(0, 2);
      const loadPromises = criticalImages.map(
        (src) =>
          new Promise((imgResolve) => {
            const img = new Image();
            img.onload = () => imgResolve();
            img.onerror = () => imgResolve();
            img.src = src;
          })
      );

      Promise.all(loadPromises).then(() => {
        setImagesLoaded(true);
        setLoading(false);
        markPageAsLoaded();
      });
    } else {
      // Attendre que les images critiques soient chargées avant d'afficher la page
      waitForCriticalImages().then(() => {
        setImagesLoaded(true);
        setLoading(false);
        markPageAsLoaded();

        // Meta Pixel - ViewContent pour la page produit (seulement après chargement)
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
          window.fbq('track', 'ViewContent', {
            content_ids: [slug],
            content_type: 'product',
            content_name: 'Hismile - Sérum blanchissant dents',
          });
        }
      });
    }

    // Timeout de sécurité (max 3 secondes)
    const timeout = setTimeout(() => {
      if (!imagesLoaded) {
        setImagesLoaded(true);
        setLoading(false);
        markPageAsLoaded();
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [slug, imagesLoaded]);

  if (loading || !imagesLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement des images...</p>
          <p className="text-gray-400 text-sm mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-primary-600 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (isBblProduct || isGumiesProduct) {
    return (
      <div className="min-h-screen bg-white">
        {galleryImages.map((src, index) => (
          <div key={src} className="relative w-full max-w-4xl mx-auto bg-white">
            <OptimizedImage
              src={src}
              alt={`${isGumiesProduct ? 'Gumies' : 'BBL'} ${index + 1}`}
              className="w-full h-auto object-top"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : undefined}
              style={{
                width: '100%',
                maxWidth: '1080px',
                objectFit: 'cover',
                objectPosition: 'top',
                margin: '0 auto',
                display: 'block',
              }}
            />
          </div>
        ))}

        <section id="order" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div id="order-form" className="p-8 md:p-12 rounded-2xl" style={{ backgroundColor: formBgColor }}>
                <CODForm productSlug={slug} offers={isGumiesProduct ? GUMIES_OFFERS : undefined} />
              </div>
            </div>
          </div>
        </section>
        {isGumiesProduct && (
          <div className="relative w-full max-w-4xl mx-auto bg-white">
            <OptimizedImage
              src={GUMIES_FORM_FOOTER}
              alt="Gumies avantages"
              className="w-full h-auto object-top"
              loading="lazy"
              style={{
                width: '100%',
                maxWidth: '1080px',
                objectFit: 'cover',
                objectPosition: 'top',
                margin: '0 auto',
                display: 'block',
              }}
            />
          </div>
        )}
        {isGumiesProduct && (
          <button
            onClick={scrollToForm}
            className="fixed bottom-4 right-4 text-white px-6 py-4 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 z-50 hover:scale-110"
            style={{
              backgroundColor: '#db2777',
              boxShadow: '0 10px 25px rgba(219, 39, 119, 0.4)',
            }}
          >
            Commander
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Bannière Cameroun */}
      <section className="bg-primary-600 text-white py-3 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-3">
            <img
              src="https://flagcdn.com/w160/cm.png"
              alt="Cameroun"
              className="w-8 h-6 object-cover rounded"
              onError={(e) => {
                // Fallback si l'image ne charge pas
                e.target.style.display = 'none';
              }}
            />
            <span className="font-semibold text-sm md:text-base">
              Disponible partout au Cameroun
            </span>
            <img
              src="https://flagcdn.com/w160/cm.png"
              alt="Cameroun"
              className="w-8 h-6 object-cover rounded"
              onError={(e) => {
                // Fallback si l'image ne charge pas
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </section>

      {/* Images - Optimisées pour chargement ultra-rapide */}
      {/* Première image - Chargement prioritaire (above the fold) */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="/ChatGPT Image 13 janv. 2026, 17_11_57.png"
          alt={productData?.name || 'Produit Zendo'}
          className="w-full h-auto object-top"
          loading="eager"
          fetchPriority="high"
          style={{
            width: '100%',
            maxWidth: '1080px',
            objectFit: 'cover',
            objectPosition: 'top',
            margin: '0 auto',
            display: 'block',
          }}
        />
      </div>
      
      {/* Deuxième image - Chargement prioritaire */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="/images/ChatGPT Image 13 janv. 2026, 17_25_05.png"
          alt={productData?.name || 'Produit Zendo'}
          className="w-full h-auto object-top"
          loading="eager"
          fetchPriority="high"
          style={{
            width: '100%',
            maxWidth: '1080px',
            objectFit: 'cover',
            objectPosition: 'top',
            margin: '0 auto',
            display: 'block',
          }}
        />
      </div>
      
      {/* Troisième image - Lazy loading pour les images suivantes */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="/images/ChatGPT Image 13 janv. 2026, 17_38_17.png"
          alt={productData?.name || 'Produit Zendo'}
          className="w-full h-auto object-top"
          loading="lazy"
          style={{
            width: '100%',
            maxWidth: '1080px',
            objectFit: 'cover',
            objectPosition: 'top',
            margin: '0 auto',
            display: 'block',
          }}
        />
      </div>
      
      {/* Quatrième image - Lazy loading */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="/images/bf.png"
          alt={productData?.name || 'Produit Zendo'}
          className="w-full h-auto object-top"
          loading="lazy"
          style={{
            width: '100%',
            maxWidth: '1080px',
            objectFit: 'cover',
            objectPosition: 'top',
            margin: '0 auto',
            display: 'block',
          }}
        />
      </div>
      
      {/* Cinquième image - Avis clients - Lazy loading */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="/images/e4c87fd5-acaf-4a1c-9170-4fcb392af042.png"
          alt="Avis clients Zendo"
          className="w-full h-auto object-top"
          loading="lazy"
          style={{
            width: '100%',
            maxWidth: '1080px',
            objectFit: 'cover',
            objectPosition: 'top',
            margin: '0 auto',
            display: 'block',
          }}
        />
      </div>
      
      {/* Sixième image - Offres - Lazy loading */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="/images/7563d5bf-b451-4ef9-97c3-b969f41d17e5.png"
          alt="Offres exclusives Zendo"
          className="w-full h-auto object-top"
          loading="lazy"
          style={{
            width: '100%',
            maxWidth: '1080px',
            objectFit: 'cover',
            objectPosition: 'top',
            margin: '0 auto',
            display: 'block',
          }}
        />
      </div>

      {/* Image recommandation experte - Lazy loading */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="/images/681a01b9-c2cd-4eba-84b0-3a81622c0afc.png"
          alt="Recommandation experte dentaire"
          className="w-full h-auto object-top"
          loading="lazy"
          style={{
            width: '100%',
            maxWidth: '1080px',
            objectFit: 'cover',
            objectPosition: 'top',
            margin: '0 auto',
            display: 'block',
          }}
        />
      </div>

      {/* CTA Section - Order Form */}
      <section id="order" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div id="order-form" className="p-8 md:p-12 rounded-2xl" style={{ backgroundColor: formBgColor }}>
              <CODForm productSlug={slug} />
            </div>
          </div>
        </div>
      </section>

      {/* Image en bas - Lazy loading */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="/images/ChatGPT Image 13 janv. 2026, 17_36_08.png"
          alt="Avantages Zendo"
          className="w-full h-auto object-top"
          loading="lazy"
          style={{
            width: '100%',
            maxWidth: '1080px',
            objectFit: 'cover',
            objectPosition: 'top',
            margin: '0 auto',
            display: 'block',
          }}
        />
      </div>

      {/* Bouton flottant Commander */}
      <button
        onClick={scrollToForm}
        className="fixed bottom-4 right-4 bg-primary-600 text-white px-6 py-4 rounded-full font-bold text-lg shadow-2xl hover:bg-primary-700 transition-all duration-300 z-50 animate-bounce hover:scale-110"
        style={{
          boxShadow: '0 10px 25px rgba(107, 33, 168, 0.4)',
          animation: 'bounce 2s infinite',
        }}
      >
        Commander
      </button>
    </div>
  );
}

export default ProductPage;

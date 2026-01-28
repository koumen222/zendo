import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CODForm from '../components/CODForm';

const OptimizedImage = ({ src, alt, loading = 'lazy', fetchPriority, className, style }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading={loading}
    fetchPriority={fetchPriority}
    decoding="async"
    style={style}
  />
);

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
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);

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

    // Meta Pixel - ViewContent pour la page produit
    if (!isBblProduct && !isGumiesProduct) {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', {
          content_ids: [slug],
          content_type: 'product',
          content_name: 'Hismile - Sérum blanchissant dents',
        });
      }
    }
  }, [slug, isBblProduct, isGumiesProduct, galleryImages]);

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
          src="https://pub-8ff71761d07245c49c162274615448e8.r2.dev/Image%20compresse%201.webp"
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
          src="https://pub-8ff71761d07245c49c162274615448e8.r2.dev/hismile%20compresse%202.webp"
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
          src="https://pub-8ff71761d07245c49c162274615448e8.r2.dev/image%20compress3.jpg"
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
          src="https://pub-8ff71761d07245c49c162274615448e8.r2.dev/image%20compress4.jpg"
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
          src="https://pub-8ff71761d07245c49c162274615448e8.r2.dev/image%20compress5.jpg"
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
      
      {/* Sixième image - Offres - Lazy loading */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="https://pub-8ff71761d07245c49c162274615448e8.r2.dev/image%20comoress6.jpg"
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

      {/* Image recommandation experte - Lazy loading */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
        <OptimizedImage
          src="https://pub-8ff71761d07245c49c162274615448e8.r2.dev/image%20compress7.jpg"
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
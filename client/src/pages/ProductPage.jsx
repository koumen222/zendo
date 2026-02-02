import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import CODForm from '../components/CODForm';
import api from '../api';

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

function ProductPage() {
  const { slug } = useParams();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allowTracking = !import.meta.env.PROD;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/${slug}`);
        if (response.data?.success) {
          const p = response.data.product;
          // Use frontend images for static products
          let productImages = p.images || [];
          if (p.slug === 'bbl') {
            productImages = [
              new URL('../../bbl product/BBL1.png', import.meta.url).href,
              new URL('../../bbl product/BBL2.png', import.meta.url).href,
              new URL('../../bbl product/BLL3.png', import.meta.url).href,
            ];
          } else if (p.slug === 'gumies') {
            productImages = [
              new URL('../../Images gumies/i1.png', import.meta.url).href,
              new URL('../../Images gumies/i2.png', import.meta.url).href,
              new URL('../../Images gumies/i3.png', import.meta.url).href,
              new URL('../../Images gumies/i4.png', import.meta.url).href,
              new URL('../../Images gumies/i5.jpg', import.meta.url).href,
              new URL('../../Images gumies/i6.png', import.meta.url).href,
              new URL('../../Images gumies/i7.png', import.meta.url).href,
              new URL('../../Images gumies/8.png', import.meta.url).href,
            ];
          }
          
          setProductData({
            name: p.productName,
            price: p.offers?.[0]?.priceValue
              ? `${p.offers[0].priceValue.toLocaleString()} FCFA`
              : 'Prix sur demande',
            images: productImages,
            description: p.fullDesc || '',
            shortDesc: p.shortDesc || '',
            benefits: p.benefits || [],
            usage: p.usage || '',
            deliveryInfo: '',
            reviews: [],
            stock: 'En stock',
            rating: 0,
            reviewCount: 0,
            sections: [],
            faq: [],
            whyItWorks: null,
            guarantee: '',
            offers: p.offers || [],
          });
        } else {
          setError('Produit introuvable');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const scrollToForm = () => {
    const formElement = document.getElementById('order-form');
    if (formElement) {
      const headerOffset = 80;
      const elementPosition = formElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setTimeout(() => {
        formElement.classList.add('ring-4', 'ring-primary-400', 'ring-opacity-50');
        setTimeout(() => {
          formElement.classList.remove('ring-4', 'ring-primary-400', 'ring-opacity-50');
        }, 2000);
      }, 500);
    }
  };

  useEffect(() => {
    if (!allowTracking) return;
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_ids: [slug],
        content_type: 'product',
        content_name: productData?.name || 'Produit',
      });
    }
  }, [allowTracking, slug, productData?.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Cameroon Banner */}
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-3">
            <img
              src="https://flagcdn.com/w160/cm.png"
              alt="Cameroun"
              className="w-6 h-4 object-cover rounded"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="text-sm sm:text-base font-medium text-center">
              Disponible partout au Cameroun
            </span>
            <img
              src="https://flagcdn.com/w160/cm.png"
              alt="Cameroun"
              className="w-6 h-4 object-cover rounded"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="min-h-screen bg-white">
      {productData.images.length > 0 ? (
        productData.images.map((src, index) => (
          <div key={src} className="relative w-full max-w-4xl mx-auto bg-white">
            <OptimizedImage
              src={src}
              alt={`${productData.name} ${index + 1}`}
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
        ))
      ) : (
        <div className="w-full max-w-4xl mx-auto bg-white p-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{productData.name}</h1>
          {productData.shortDesc && (
            <p className="text-gray-600 mb-4">{productData.shortDesc}</p>
          )}
        </div>
      )}

      <section id="order" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div id="order-form" className="p-8 md:p-12 rounded-2xl" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
              <CODForm productSlug={slug} offers={productData.offers} />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Commander Button */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 max-w-[200px] sm:max-w-xs">
          <p className="text-xs sm:text-sm font-bold text-red-600 text-center">Profitez de la livraison gratuite</p>
        </div>
        <button
          onClick={scrollToForm}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 sm:px-8 sm:py-5 rounded-full font-bold text-lg sm:text-xl shadow-2xl transition-all duration-300 hover:scale-110 animate-bounce"
          style={{
            boxShadow: '0 10px 25px rgba(107, 33, 168, 0.4)',
          }}
        >
          Commander maintenant
        </button>
      </div>
      </div>
    </>
  );
}

export default ProductPage;

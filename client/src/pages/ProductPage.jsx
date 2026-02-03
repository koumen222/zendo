import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CODForm from '../components/CODForm';
import api from '../api';

// Gumies Carousel Component
const GumiesCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const carouselImages = [
    new URL('../../Images gumies/8_23759eb2-f767-473d-ac7c-f071797e383f.png', import.meta.url).href,
    new URL('../../Images gumies/8_23759eb2-f767-473d-ac7c-f071797e383f (1).png', import.meta.url).href,
    new URL('../../Images gumies/7_cacc7d45-8a70-4104-ab68-ecf8e632ddd9.png', import.meta.url).href,
    new URL('../../Images gumies/6_dfa0ef4d-4e73-47d6-8e0e-23927e0f2c7e.png', import.meta.url).href,
    new URL('../../Images gumies/5_1dd6c2f1-6284-4a69-a6d6-c26eacc5f63d.png', import.meta.url).href,
    new URL('../../Images gumies/4_80f4af47-b008-459f-9616-8d0a496efaf9.png', import.meta.url).href,
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000); // Auto-advance every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white py-8">
      <div className="relative">
        {/* Main carousel image */}
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={carouselImages[currentSlide]}
            alt={`Gumies carousel ${currentSlide + 1}`}
            className="w-full h-auto object-cover"
            style={{
              width: '100%',
              maxWidth: '1080px',
              margin: '0 auto',
              display: 'block',
            }}
          />
          
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-purple-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Testimonials Carousel Component
const TestimonialsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const testimonialImages = [
    new URL('../../Images gumies/3_c8c4026c-1ab1-4379-aac7-d8c68987de8b.png', import.meta.url).href,
    new URL('../../Images gumies/2_24beeae9-5b2c-4fbc-b79e-8b6f7e0b2fe9.png', import.meta.url).href,
    new URL('../../Images gumies/2_24beeae9-5b2c-4fbc-b79e-8b6f7e0b2fe9 (1).png', import.meta.url).href,
    new URL('../../Images gumies/1_56a2e28f-9563-4710-aca3-9923247b9ac3.png', import.meta.url).href,
    new URL('../../Images gumies/1_56a2e28f-9563-4710-aca3-9923247b9ac3 (1).png', import.meta.url).href,
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonialImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonialImages.length) % testimonialImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Auto-advance every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Témoignages Clients</h2>
        <p className="text-gray-600">Découvrez ce que nos clients disent de nos Gumies</p>
      </div>
      
      <div className="relative">
        {/* Main testimonial image */}
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={testimonialImages[currentSlide]}
            alt={`Témoignage ${currentSlide + 1}`}
            className="w-full h-auto object-cover"
            style={{
              width: '100%',
              maxWidth: '1080px',
              margin: '0 auto',
              display: 'block',
            }}
          />
          
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {testimonialImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-purple-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Preload static images for faster loading
const preloadImages = (slug) => {
  const imageMap = {
    bbl: [
      new URL('../../bbl product/BBL1.png', import.meta.url).href,
      new URL('../../bbl product/BBL2.png', import.meta.url).href,
      new URL('../../bbl product/BBL3.png', import.meta.url).href,
    ],
    gumies: [
      new URL('../../Images gumies/i1.png', import.meta.url).href,
      new URL('../../Images gumies/i2.png', import.meta.url).href,
      new URL('../../Images gumies/i3.png', import.meta.url).href,
      new URL('../../Images gumies/i4.png', import.meta.url).href,
      new URL('../../Images gumies/i5.jpg', import.meta.url).href,
      new URL('../../Images gumies/i6.png', import.meta.url).href,
      new URL('../../Images gumies/i7.png', import.meta.url).href,
      new URL('../../Images gumies/8.png', import.meta.url).href,
    ],
    gumiesCarousel: [
      new URL('../../Images gumies/8_23759eb2-f767-473d-ac7c-f071797e383f.png', import.meta.url).href,
      new URL('../../Images gumies/8_23759eb2-f767-473d-ac7c-f071797e383f (1).png', import.meta.url).href,
      new URL('../../Images gumies/7_cacc7d45-8a70-4104-ab68-ecf8e632ddd9.png', import.meta.url).href,
      new URL('../../Images gumies/6_dfa0ef4d-4e73-47d6-8e0e-23927e0f2c7e.png', import.meta.url).href,
      new URL('../../Images gumies/5_1dd6c2f1-6284-4a69-a6d6-c26eacc5f63d.png', import.meta.url).href,
      new URL('../../Images gumies/4_80f4af47-b008-459f-9616-8d0a496efaf9.png', import.meta.url).href,
    ],
    testimonialsCarousel: [
      new URL('../../Images gumies/3_c8c4026c-1ab1-4379-aac7-d8c68987de8b.png', import.meta.url).href,
      new URL('../../Images gumies/2_24beeae9-5b2c-4fbc-b79e-8b6f7e0b2fe9.png', import.meta.url).href,
      new URL('../../Images gumies/2_24beeae9-5b2c-4fbc-b79e-8b6f7e0b2fe9 (1).png', import.meta.url).href,
      new URL('../../Images gumies/1_56a2e28f-9563-4710-aca3-9923247b9ac3.png', import.meta.url).href,
      new URL('../../Images gumies/1_56a2e28f-9563-4710-aca3-9923247b9ac3 (1).png', import.meta.url).href,
    ],
  };

  // Preload main images and carousel images
  const mainImages = imageMap[slug] || [];
  const carouselImages = slug === 'gumies' ? imageMap.gumiesCarousel || [] : [];
  const testimonialsImages = slug === 'gumies' ? imageMap.testimonialsCarousel || [] : [];
  
  [...mainImages, ...carouselImages, ...testimonialsImages].forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

const OptimizedImage = ({ src, alt, loading = 'lazy', fetchPriority, className, style, index }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading={index === 0 ? 'eager' : loading}
    fetchPriority={index === 0 ? 'high' : fetchPriority}
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

  // Preload images immediately when component mounts
  preloadImages(slug);

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
              new URL('../../bbl product/BBL3.png', import.meta.url).href,
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
            slug: p.slug,
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-lg">Chargement...</p>
        </div>
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
        <>
          {productData.images.map((src, index) => (
            <div key={src} className="relative w-full max-w-4xl mx-auto bg-white">
              <OptimizedImage
                src={src}
                alt={`${productData.name} ${index + 1}`}
                className="w-full h-auto object-top"
                index={index}
                style={{
                  width: '100%',
                  maxWidth: '1080px',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  margin: '0 auto',
                  display: 'block',
                }}
              />
              {/* Add carousel after second image for gumies */}
              {index === 1 && productData.slug === 'gumies' && <GumiesCarousel />}
              {index === 3 && productData.slug === 'gumies' && <TestimonialsCarousel />}
            </div>
          ))}
        </>
      ) : (
        <div className="w-full max-w-4xl mx-auto bg-white p-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{productData.name}</h1>
          {productData.shortDesc && (
            <p className="text-gray-600 mb-4">{productData.shortDesc}</p>
          )}
        </div>
      )}
      </div>

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
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 sm:px-8 sm:py-5 rounded-full font-bold text-base sm:text-xl shadow-2xl transition-all duration-300 hover:scale-110 animate-bounce"
          style={{
            boxShadow: '0 10px 25px rgba(107, 33, 168, 0.4)',
          }}
        >
          <span className="hidden sm:inline">Commander maintenant</span>
          <span className="sm:hidden">Commander</span>
        </button>
      </div>
    </>
  );
}

export default ProductPage;

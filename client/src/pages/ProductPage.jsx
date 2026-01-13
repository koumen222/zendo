import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CODForm from '../components/CODForm';

function ProductPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFAQ, setShowFAQ] = useState(false);

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
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/products/${slug}`);
        if (response.data.success && response.data.product) {
          const product = response.data.product;
          setProductData({
            name: product.productName,
            price: product.productPrice,
            images: product.productImages || [],
            description: product.productFullDesc || product.productShortDesc || '',
            shortDesc: product.productShortDesc || '',
            benefits: product.productBenefits || [],
            usage: product.productUsage || '',
            guarantee: product.productGuarantee || '',
            deliveryInfo: product.productDeliveryInfo || '',
            reviews: product.productReviews || [],
            stock: product.stock || 'En stock',
            rating: product.rating || 4.8,
            reviewCount: product.reviewCount || 252,
            sections: product.sections || [],
            faq: product.faq || [],
            whyItWorks: product.whyItWorks || null,
          });
        } else {
          throw new Error('Produit non trouvé');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        if (slug === 'serum-correcteur-de-teinte-pour-les-dents-effet-instantane-sans-peroxyde-sourire-plus-net') {
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
            stock: '835 en stock',
            rating: 4.8,
            reviewCount: 252,
            sections: [
              {
                title: 'Un jaune qui gâche tes photos ?',
                content: 'Ce sérum violet neutralise visuellement les tons jaunes en quelques minutes. Tu poses, tu essuies, et ton sourire paraît plus frais tout de suite. Idéal avant une sortie, un live ou une visio.',
              },
              {
                title: 'Pas de produits agressifs, pas de stress.',
                content: 'Formule sans peroxyde, pensée pour une utilisation cosmétique douce. Le but : corriger la teinte, pas décaper.',
              },
              {
                title: 'Simple comme bonjour.',
                content: 'Pas besoin d\'appareil ni de lampe. Applique une fine couche, brosse-toi les dents normalement, puis rince la bouche. C\'est rapide, propre et efficace.',
              },
              {
                title: 'Parfait quand l\'emploi du temps est serré.',
                content: 'Tu es en route pour un rendez-vous ? Deux minutes et c\'est réglé. Tu peux l\'utiliser à la maison, au bureau ou entre deux activités.',
              },
            ],
            whyItWorks: {
              title: 'Pourquoi ça fonctionne (en vrai)',
              subtitle: 'La correction de couleur, pas du "blanchiment".',
              content: 'Le sérum utilise des pigments violets. Sur le cercle chromatique, violet et jaune sont opposés : quand ils se rencontrent, ils se neutralisent visuellement. Résultat : les tons jaunes paraissent moins visibles à l\'œil.',
            },
            faq: [
              {
                question: 'Est-ce que c\'est facile à utiliser ?',
                answer: 'Oui. Tu appliques sur dents propres et sèches, tu attends un court instant, tu essuies. C\'est rapide et intuitif.',
              },
              {
                question: 'Et si je n\'ai pas toujours de courant ?',
                answer: 'Aucun problème : pas d\'UV/LED, pas d\'appareil. Juste le sérum et un mouchoir/coton pour essuyer.',
              },
              {
                question: 'C\'est sûr pour les dents ?',
                answer: 'C\'est une correction de couleur sans peroxyde, généralement bien tolérée. Si tu as des facettes, couronnes, appareils ou une sensibilité, valide avec ton dentiste avant usage.',
              },
              {
                question: 'Livraison où ?',
                answer: 'Dans plusieurs pays d\'Afrique, généralement 2 à 7 jours selon ta ville. Paiement à la livraison possible selon zones.',
              },
            ],
            guarantee: 'Il est recommandé par les dentistes du Cameroun et du monde entier.',
          });
        } else {
          setProductData({
            name: `Produit ${slug}`,
            price: '29,900 FCFA',
            images: [],
            description: 'Description du produit',
            benefits: [],
            stock: 'En stock',
            rating: 4.5,
            reviewCount: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
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
              Disponible partout au Cameroun 🇨🇲
            </span>
          </div>
        </div>
      </section>

      {/* Images - Collées au header */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
          <img
            src="/ChatGPT Image 13 janv. 2026, 17_11_57.png"
            alt={productData?.name || 'Produit Zendo'}
            className="w-full h-auto object-top"
            style={{
              width: '100%',
              maxWidth: '1080px',
              objectFit: 'cover',
              objectPosition: 'top',
              margin: '0 auto',
              display: 'block',
            }}
          />
          {/* Badge */}
          {productData?.stock && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg z-10">
              {productData.stock}
            </div>
          )}
      </div>
      
      {/* Deuxième image */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
          <img
            src="/images/ChatGPT Image 13 janv. 2026, 17_25_05.png"
            alt={productData?.name || 'Produit Zendo'}
            className="w-full h-auto object-top"
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
      
      {/* Troisième image */}
      <div className="relative w-full max-w-4xl mx-auto bg-white">
          <img
            src="/images/bf.png"
            alt={productData?.name || 'Produit Zendo'}
            className="w-full h-auto object-top"
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

      {/* Hero Section - Landing Page Style */}
      <section className="bg-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-6 text-center">
              <div className="inline-block bg-primary-100 text-primary-700 rounded-full px-4 py-2 text-sm font-medium">
                ⭐ {productData?.reviewCount || 0} avis positifs
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                {productData?.name || `Produit ${slug}`}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                {productData?.shortDesc || 'Découvrez ce produit révolutionnaire'}
              </p>

              {/* Key Benefits */}
              {productData?.benefits && productData.benefits.length > 0 && (
                <ul className="space-y-3 max-w-2xl mx-auto">
                  {productData.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="flex items-start justify-center">
                      <span className="text-2xl mr-3">✓</span>
                      <span className="text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  onClick={scrollToForm}
                  className="bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-xl inline-block shadow-2xl hover:bg-primary-700 hover:scale-105 transition-all cursor-pointer"
                >
                  Commandez maintenant →
                </button>
                <p className="text-gray-600 text-sm mt-2">
                  Paiement à la livraison disponible
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-gray-50 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">{productData?.reviewCount || 0}+</div>
              <div className="text-sm text-gray-600">Avis clients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600">100%</div>
              <div className="text-sm text-gray-600">Naturel</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600">COD</div>
              <div className="text-sm text-gray-600">Paiement livraison</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600">2-7j</div>
              <div className="text-sm text-gray-600">Livraison rapide</div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Résultats Visibles dès le Premier Jour
              </h2>
              <p className="text-lg text-gray-600">
                Voyez la différence par vous-même
              </p>
            </div>
            
            {/* Before/After Image */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4 md:p-8 shadow-xl overflow-hidden">
              {/* Banner */}
              <div className="bg-primary-700 text-white text-center py-4 px-6 rounded-lg mb-6">
                <h3 className="text-lg md:text-2xl font-bold">
                  COMPARAISON AVANT / APRÈS UTILISATION
                </h3>
              </div>
              
              {/* Image Container */}
              <div className="relative w-full">
                <img
                  src="/images/bf.png"
                  alt="Comparaison avant après utilisation Hismile"
                  className="w-full h-auto rounded-xl shadow-2xl"
                  onError={(e) => {
                    // Fallback si l'image n'est pas trouvée
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                {/* Fallback si image non disponible */}
                <div className="hidden bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    Placez votre image de comparaison avant/après dans :
                  </p>
                  <code className="bg-gray-100 px-4 py-2 rounded text-sm">
                    client/public/images/bf.png
                  </code>
                </div>
              </div>

              {/* CTA after comparison */}
              <div className="text-center mt-8">
                <button
                  onClick={scrollToForm}
                  className="bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-primary-700 transition-colors shadow-lg"
                >
                  Obtenez ces résultats maintenant →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Sections */}
      {productData?.sections && productData.sections.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-16">
              {productData.sections.map((section, idx) => (
                <div key={idx}>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                      idx % 2 === 1 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className={idx % 2 === 1 ? 'md:order-2' : ''}>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {section.title}
                      </h2>
                      <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                        {section.content}
                      </p>
                      {/* Bouton Commander après chaque argument */}
                      <button
                        onClick={scrollToForm}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
                      >
                        Commander maintenant →
                      </button>
                    </div>
                    <div className={idx % 2 === 1 ? 'md:order-1' : ''}>
                      {productData?.images && productData.images[idx + 1] ? (
                        <img
                          src={productData.images[idx + 1]}
                          alt={section.title}
                          className="w-full rounded-xl shadow-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-gray-400">Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why It Works Section */}
      {productData?.whyItWorks && (
        <section className="bg-primary-50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {productData.whyItWorks.title}
              </h2>
              <h3 className="text-xl md:text-2xl font-semibold text-primary-700 mb-6">
                {productData.whyItWorks.subtitle}
              </h3>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
                {productData.whyItWorks.content}
              </p>
              {/* Bouton Commander après "Pourquoi ça fonctionne" */}
              <button
                onClick={scrollToForm}
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-primary-700 transition-colors shadow-lg"
              >
                Commander maintenant →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Social Proof - Reviews */}
      {productData?.reviews && productData.reviews.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                Ce que nos clients disent
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {productData.reviews.slice(0, 4).map((review, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                  </div>
                ))}
              </div>
              {/* Bouton Commander après les avis */}
              <div className="text-center">
                <button
                  onClick={scrollToForm}
                  className="bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-primary-700 transition-colors shadow-lg"
                >
                  Rejoignez nos clients satisfaits →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Order Form */}
      <section id="order" className="bg-gradient-to-r from-primary-600 to-primary-700 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div id="order-form" className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Commandez maintenant
                </h2>
                <p className="text-xl text-gray-600 mb-2">
                  {productData?.name}
                </p>
                <p className="text-sm text-gray-500">
                  Paiement à la livraison • {productData?.stock || 'En stock'}
                </p>
              </div>
              <CODForm productSlug={slug} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {productData?.faq && productData.faq.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                Questions fréquentes
              </h2>
              <div className="space-y-4">
                {productData.faq.map((item, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl p-6 shadow-md transition-all ${
                      showFAQ || idx === 0 ? 'block' : 'hidden'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.question}
                    </h3>
                    <p className="text-gray-700">{item.answer}</p>
                  </div>
                ))}
              </div>
              {productData.faq.length > 1 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowFAQ(!showFAQ)}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-lg"
                  >
                    {showFAQ ? 'Masquer' : 'Afficher'} toutes les questions
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Guarantee Section */}
      {productData?.guarantee && (
        <section className="py-12 bg-primary-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl md:text-2xl text-gray-800 font-medium italic mb-6">
                "{productData.guarantee}"
              </p>
              {/* Bouton Commander après la garantie */}
              <button
                onClick={scrollToForm}
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-primary-700 transition-colors shadow-lg"
              >
                Commandez avec confiance →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à transformer votre sourire ?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Commandez maintenant et recevez votre produit sous 2-7 jours
          </p>
          <button
            onClick={scrollToForm}
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-xl inline-block hover:bg-gray-100 transition-colors"
          >
            Commander maintenant →
          </button>
        </div>
      </section>
    </div>
  );
}

export default ProductPage;

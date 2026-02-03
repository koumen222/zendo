import { useState, useEffect } from 'react';
import api from '../api';

function CODForm({ productSlug, offers }) {
  const normalizedSlug = (productSlug || '').toLowerCase();
  const isAltProduct = normalizedSlug && normalizedSlug !== 'hismile';
  const themeColor = isAltProduct ? '#db2777' : '#6B21A8';
  const themeShadow = isAltProduct ? '0 10px 25px rgba(219, 39, 119, 0.4)' : '0 10px 25px rgba(107, 33, 168, 0.4)';
  const focusClasses = isAltProduct ? 'focus:ring-pink-500 focus:border-pink-500' : 'focus:ring-primary-500 focus:border-primary-500';
  const defaultOffers = [
    { qty: 1, label: '1 Produit - 9,900 FCFA', priceValue: 9900 },
    { qty: 2, label: '2 Produits - 14,000 FCFA', priceValue: 14000 },
  ];
  const availableOffers = Array.isArray(offers) && offers.length > 0 ? offers : defaultOffers;
  const [quantity, setQuantity] = useState(availableOffers[0]?.qty || 1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    quarter: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const selectedOffer =
    availableOffers.find((offer) => offer.qty === quantity) || availableOffers[0];

  const getProductName = () => {
    if (normalizedSlug === 'hismile') return 'Hismile - Sérum blanchissant dents';
    if (normalizedSlug === 'bbl') return 'BBL - Solution peau éclatante';
    if (normalizedSlug === 'gumies') return 'Gumies - Gummies bien-être';
    if (normalizedSlug) return normalizedSlug.charAt(0).toUpperCase() + normalizedSlug.slice(1);
    return 'Produit';
  };

  const getProductCategory = () => {
    if (normalizedSlug === 'hismile') return 'Santé Buccale';
    if (normalizedSlug === 'bbl') return 'Beauté & Soins';
    if (normalizedSlug === 'gumies') return 'Bien-être & Santé';
    return 'Beauty & Health';
  };

  useEffect(() => {
    if (!availableOffers.find((offer) => offer.qty === quantity)) {
      setQuantity(availableOffers[0]?.qty || 1);
    }
  }, [availableOffers, quantity]);

  const handleChange = (e) => {
    // Meta Pixel - InitiateCheckout quand l'utilisateur commence à remplir le formulaire
    if (!formData.name && !formData.phone && !formData.city && e.target.value) {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        const checkoutValue = selectedOffer?.priceValue || 0;

        window.fbq('track', 'InitiateCheckout', {
          content_ids: [productSlug],
          content_type: 'product',
          content_name: getProductName(),
          content_category: getProductCategory(),
          value: checkoutValue,
          currency: 'XAF',
          num_items: quantity,
        });
      }
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/api/orders', {
        ...formData,
        productSlug,
        quantity,
      });

      if (response.data.success) {
        // Calculer la valeur réelle en XAF pour Meta Pixel
        const purchaseValue = selectedOffer?.priceValue || 0;

        // Meta Pixel - Purchase et Lead après succès de la commande
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
          // Événement Purchase pour le tracking de conversion
          window.fbq('track', 'Purchase', {
            content_ids: [productSlug],
            content_type: 'product',
            content_name: getProductName(),
            content_category: getProductCategory(),
            value: purchaseValue,
            currency: 'XAF',
            num_items: quantity,
          });

          // Événement Lead pour le tracking de leads
          window.fbq('track', 'Lead', {
            content_name: getProductName(),
            content_category: getProductCategory(),
            value: purchaseValue,
            currency: 'XAF',
          });
        }

        setSuccess(true);
        setQuantity(availableOffers[0]?.qty || 1);
        setFormData({
          name: '',
          phone: '',
          city: '',
          quarter: '',
        });
        // Le message WhatsApp est envoyé automatiquement par le backend
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Erreur lors de la création de la commande. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-4xl mb-4">✓</div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">
          Merci pour votre commande !
        </h3>
        <p className="text-green-700 mb-4">
          Votre commande a été enregistrée avec succès. Nous allons vous appeler dans les plus brefs délais pour confirmer votre commande.
        </p>
        <p className="text-green-700 mb-6 font-medium">
          En attendant, vous pouvez suivre votre commande via WhatsApp :
        </p>
        <a
          href={`https://wa.me/237676463725?text=${encodeURIComponent(`Bonjour, je souhaite suivre ma commande\n\nNom: ${formData.name}\nTéléphone: ${formData.phone}\nVille: ${formData.city}\nQuartier: ${formData.quarter}\nProduit: ${selectedOffer?.label || 'Produit'}\nQuantité: ${quantity}\nPrix: ${selectedOffer?.priceValue ? selectedOffer.priceValue.toLocaleString() + ' FCFA' : selectedOffer?.label || 'Prix sur demande'}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors mb-4"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.3 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Contacter le service client sur WhatsApp
        </a>
        <button
          onClick={() => setSuccess(false)}
          className="block w-full text-green-700 hover:underline font-medium mt-4"
        >
          Passer une autre commande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Titre du formulaire */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Remplissez ce formulaire pour commander
        </h3>
      </div>

      {/* Sélection de la quantité */}
      <div>
        <label className="block text-lg font-bold text-gray-900 mb-4 text-center">
          Choisissez votre offre
        </label>
        <div className="flex flex-col gap-3">
          {/* Offre 1 */}
          {availableOffers.map((offer) => (
            <label key={offer.qty} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="quantity"
                value={offer.qty}
                checked={quantity === offer.qty}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className={isAltProduct ? 'w-5 h-5 text-pink-600' : 'w-5 h-5 text-primary-600'}
              />
              <span className="text-gray-900 text-lg font-bold">{offer.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 ${focusClasses}`}
          placeholder="Nom"
        />
      </div>

      <div>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          className={`w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 ${focusClasses}`}
          placeholder="Ville"
        />
      </div>

      <div>
        <input
          type="text"
          id="quarter"
          name="quarter"
          value={formData.quarter}
          onChange={handleChange}
          required
          className={`w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 ${focusClasses}`}
          placeholder="Quartier"
        />
      </div>

      <div>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className={`w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 ${focusClasses}`}
          placeholder="Téléphone"
        />
      </div>

      <div className="relative h-14">
        <button
          type="submit"
          disabled={loading}
          className="absolute left-0 text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{ 
            backgroundColor: themeColor,
            boxShadow: themeShadow
          }}
          onClick={() => {
            // Calculer la valeur réelle en XAF pour Meta Pixel
            const cartValue = selectedOffer?.priceValue || 0;

            // Meta Pixel - AddToCart lors du clic sur le bouton Commander
            if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
              window.fbq('track', 'AddToCart', {
                content_ids: [productSlug],
                content_type: 'product',
                content_name: getProductName(),
                content_category: getProductCategory(),
                value: cartValue,
                currency: 'XAF',
                quantity: quantity,
              });
            }
          }}
        >
          {loading ? 'Traitement...' : 'Commandez maintenant'}
        </button>
      </div>
    </form>
  );
}

export default CODForm;


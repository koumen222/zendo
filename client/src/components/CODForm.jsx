import { useState } from 'react';
import axios from 'axios';

function CODForm({ productSlug }) {
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Calcul du prix selon la quantité
  const getPrice = () => {
    if (quantity === 1) return '9,900 FCFA';
    if (quantity === 2) return '14,000 FCFA';
    return `${(quantity * 9900).toLocaleString('fr-FR')} FCFA`;
  };

  const getPricePerUnit = () => {
    if (quantity === 1) return '9,900 FCFA';
    if (quantity === 2) return '7,000 FCFA par unité';
    return `${(14000 / 2).toLocaleString('fr-FR')} FCFA par unité`;
  };

  const handleChange = (e) => {
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
      const response = await axios.post('/api/orders', {
        ...formData,
        productSlug,
        quantity,
      });

      if (response.data.success) {
        setSuccess(true);
        setQuantity(1);
        setFormData({
          name: '',
          phone: '',
          city: '',
          address: '',
        });
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
          Commande créée avec succès !
        </h3>
        <p className="text-green-700 mb-4">
          Votre commande a été enregistrée. Vous serez contacté sous peu pour
          la confirmation.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-green-700 hover:underline font-medium"
        >
          Passer une autre commande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Sélection de la quantité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choisissez votre offre
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Offre 1 */}
          <button
            type="button"
            onClick={() => setQuantity(1)}
            className={`p-4 rounded-lg border-2 transition-all ${
              quantity === 1
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 mb-1">1 produit</div>
              <div className="text-2xl font-bold text-primary-600">9,900 FCFA</div>
              <div className="text-xs text-gray-500 mt-1">9,900 FCFA/unité</div>
            </div>
          </button>

          {/* Offre 2 */}
          <button
            type="button"
            onClick={() => setQuantity(2)}
            className={`p-4 rounded-lg border-2 transition-all relative ${
              quantity === 2
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ÉCONOMIE
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 mb-1">2 produits</div>
              <div className="text-2xl font-bold text-primary-600">14,000 FCFA</div>
              <div className="text-xs text-gray-500 mt-1">7,000 FCFA/unité</div>
              <div className="text-xs text-green-600 font-semibold mt-1">
                Économisez 4,800 FCFA
              </div>
            </div>
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Prix total : <span className="font-bold text-lg text-primary-600">{getPrice()}</span>
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom complet *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="Votre nom complet"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Téléphone *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="+225 XX XX XX XX XX"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
          Ville *
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="Votre ville"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Adresse complète *
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          rows="3"
          className="input-field resize-none"
          placeholder="Votre adresse complète de livraison"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? 'Traitement...' : 'Ajouter au panier'}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Paiement à la livraison (COD) disponible
      </p>
    </form>
  );
}

export default CODForm;


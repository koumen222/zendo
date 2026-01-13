import { useState } from 'react';
import axios from 'axios';

function CODForm({ productSlug }) {
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="quantity"
              value="1"
              checked={quantity === 1}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-5 h-5 text-primary-600"
            />
            <span className="text-gray-900">1 Produit - 9,900 FCFA</span>
          </label>

          {/* Offre 2 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="quantity"
              value="2"
              checked={quantity === 2}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-5 h-5 text-primary-600"
            />
            <span className="text-gray-900">2 Produits - 14,000 FCFA</span>
          </label>
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
          className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ville"
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
          className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Téléphone"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        style={{ 
          backgroundColor: '#6B21A8',
          boxShadow: '0 10px 25px rgba(107, 33, 168, 0.4)'
        }}
      >
        {loading ? 'Traitement...' : 'Commandez maintenant'}
      </button>
    </form>
  );
}

export default CODForm;


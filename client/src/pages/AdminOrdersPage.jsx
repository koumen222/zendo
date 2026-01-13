import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleLogin = async () => {
    if (!adminKey.trim()) {
      setError('Veuillez entrer la clé admin');
      return;
    }

    try {
      const response = await axios.get('/api/admin/orders', {
        headers: {
          'x-admin-key': adminKey,
        },
      });

      if (response.data.success) {
        setAuthenticated(true);
        setOrders(response.data.orders);
        setError(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Clé admin invalide'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchOrders();
    }
  }, [authenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/orders', {
        headers: {
          'x-admin-key': adminKey,
        },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full card">
          <h1 className="text-2xl font-bold text-center mb-6">
            Accès Admin Zendo
          </h1>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé Admin
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="input-field"
                placeholder="Entrez la clé admin"
              />
            </div>
            <button onClick={handleLogin} className="btn-primary w-full">
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Commandes ({orders.length})
          </h1>
          <button
            onClick={fetchOrders}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des commandes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                isSelected={selectedOrder?._id === order._id}
                onClick={() =>
                  setSelectedOrder(
                    selectedOrder?._id === order._id ? null : order
                  )
                }
              />
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Détails de la commande</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <OrderDetails order={selectedOrder} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, isSelected, onClick }) {
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary-500' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{order.name}</h3>
          <p className="text-sm text-gray-500">{order.phone}</p>
        </div>
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-600">Produit:</span>
          <p className="text-gray-900">{order.productName}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-600">Ville:</span>
          <p className="text-gray-900">{order.city}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-600">Prix:</span>
          <p className="text-primary-600 font-semibold">{order.productPrice}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500">
          Cliquez pour voir les détails complets
        </p>
      </div>
    </div>
  );
}

function OrderDetails({ order }) {
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Informations client */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Informations client</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Nom:</span>
            <p className="text-gray-900">{order.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Téléphone:</span>
            <p className="text-gray-900">{order.phone}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Ville:</span>
            <p className="text-gray-900">{order.city}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Date:</span>
            <p className="text-gray-900">{date}</p>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-600">Adresse:</span>
          <p className="text-gray-900">{order.address}</p>
        </div>
      </section>

      {/* Informations produit */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Informations produit</h3>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Nom:</span>
            <p className="text-gray-900 text-lg">{order.productName}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Slug:</span>
            <p className="text-gray-900 font-mono text-sm">{order.productSlug}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Prix:</span>
            <p className="text-primary-600 font-semibold text-xl">
              {order.productPrice}
            </p>
          </div>

          {order.productImages && order.productImages.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">
                Images:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {order.productImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${order.productName} ${idx + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          {order.productShortDesc && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                Description courte:
              </span>
              <p className="text-gray-900">{order.productShortDesc}</p>
            </div>
          )}

          {order.productFullDesc && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                Description complète:
              </span>
              <p className="text-gray-900 whitespace-pre-wrap">
                {order.productFullDesc}
              </p>
            </div>
          )}

          {order.productBenefits && order.productBenefits.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">
                Bénéfices:
              </span>
              <ul className="list-disc list-inside space-y-1">
                {order.productBenefits.map((benefit, idx) => (
                  <li key={idx} className="text-gray-900">{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {order.productUsage && (
            <div>
              <span className="text-sm font-medium text-gray-600">Usage:</span>
              <p className="text-gray-900 whitespace-pre-wrap">
                {order.productUsage}
              </p>
            </div>
          )}

          {order.productGuarantee && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                Garantie:
              </span>
              <p className="text-gray-900">{order.productGuarantee}</p>
            </div>
          )}

          {order.productDeliveryInfo && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                Livraison:
              </span>
              <p className="text-gray-900">{order.productDeliveryInfo}</p>
            </div>
          )}

          {order.productReviews && order.productReviews.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">
                Avis ({order.productReviews.length}):
              </span>
              <div className="space-y-3">
                {order.productReviews.map((review, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.author}
                        </p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.date && (
                        <span className="text-xs text-gray-500">
                          {review.date}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminOrdersPage;


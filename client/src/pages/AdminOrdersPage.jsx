import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import { getFirstWord } from '../utils/format';

function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingOrder, setDeletingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: '-createdAt',
      };

      // Add filters to params (server-side filtering)
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await api.get('/api/admin/orders', {
        headers: {
          'x-admin-key': 'ZENDO_ADMIN_2026',
        },
        params,
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
        setPagination({
          ...pagination,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPagination({ ...pagination, page: 1 });
    if (newStatus === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ status: newStatus });
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (order) => {
    setEditingOrder(order._id);
    setEditForm({
      name: order.name || '',
      phone: order.phone || '',
      city: order.city || '',
      address: order.address || '',
      quantity: order.quantity || 1,
      totalPrice: order.totalPrice || '',
      status: order.status || 'new',
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await api.put(`/api/admin/orders/${editingOrder}`, editForm, {
        headers: {
          'x-admin-key': 'ZENDO_ADMIN_2026',
        },
      });

      if (response.data.success) {
        setEditingOrder(null);
        fetchOrders(); // Refresh list
      }
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Erreur lors de la mise à jour de la commande');
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      setDeletingOrder(orderId);
      const response = await api.delete(`/api/admin/orders/${orderId}`, {
        headers: {
          'x-admin-key': 'ZENDO_ADMIN_2026',
        },
      });

      if (response.data.success) {
        fetchOrders(); // Refresh list
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Erreur lors de la suppression de la commande');
    } finally {
      setDeletingOrder(null);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 FCFA';
    if (typeof price === 'number') {
      return `${price.toLocaleString('fr-FR')} FCFA`;
    }
    return price || '0 FCFA';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: 'Nouvelle', color: 'bg-blue-100 text-blue-800' },
      called: { label: 'Appelée', color: 'bg-yellow-100 text-yellow-800' },
      pending: { label: 'En attente', color: 'bg-orange-100 text-orange-800' },
      processing: { label: 'En traitement', color: 'bg-purple-100 text-purple-800' },
      in_delivery: { label: 'En livraison', color: 'bg-indigo-100 text-indigo-800' },
      shipped: { label: 'Expédiée', color: 'bg-cyan-100 text-cyan-800' },
      delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
      rescheduled: { label: 'Reportée', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Commandes</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {pagination.total} {pagination.total > 1 ? 'commandes' : 'commande'} au total
                </p>
              </div>
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Retour au dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par nom, téléphone, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setPagination({ ...pagination, page: 1 });
                      fetchOrders();
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleStatusChange('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => handleStatusChange('new')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'new'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nouvelles
                </button>
                <button
                  onClick={() => handleStatusChange('pending,called')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'pending,called'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  À traiter
                </button>
                <button
                  onClick={() => handleStatusChange('delivered')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'delivered'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Livrées
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-center text-gray-600 mt-4">Chargement des commandes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-600 text-lg font-medium mb-2">Aucune commande trouvée</p>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Les commandes apparaîtront ici une fois créées'}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          {editingOrder === order._id ? (
                            <td colSpan="8" className="px-4 py-4">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Modifier la commande</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input
                                      type="text"
                                      value={editForm.name}
                                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                    <input
                                      type="text"
                                      value={editForm.phone}
                                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                    <input
                                      type="text"
                                      value={editForm.city}
                                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                    <select
                                      value={editForm.status}
                                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                      <option value="new">Nouvelle</option>
                                      <option value="called">Appelée</option>
                                      <option value="pending">En attente</option>
                                      <option value="processing">En traitement</option>
                                      <option value="in_delivery">En livraison</option>
                                      <option value="shipped">Expédiée</option>
                                      <option value="delivered">Livrée</option>
                                      <option value="rescheduled">Reportée</option>
                                      <option value="cancelled">Annulée</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                                    <input
                                      type="number"
                                      value={editForm.quantity}
                                      onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      min="1"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix total</label>
                                    <input
                                      type="text"
                                      value={editForm.totalPrice}
                                      onChange={(e) => setEditForm({ ...editForm, totalPrice: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Enregistrer
                                  </button>
                                  <button
                                    onClick={() => setEditingOrder(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  #{order._id?.slice(-6).toUpperCase()}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">{order.name}</div>
                                <div className="text-sm text-gray-500">{order.phone}</div>
                                <div className="text-xs text-gray-400">{order.city}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                  {getFirstWord(order.productName)}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{order.quantity || 1}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatPrice(order.totalPrice || order.productPrice)}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {getStatusBadge(order.status || 'new')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(order)}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDelete(order._id)}
                                    disabled={deletingOrder === order._id}
                                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                                  >
                                    {deletingOrder === order._id ? 'Suppression...' : 'Supprimer'}
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {pagination.page} sur {pagination.pages} ({pagination.total} commandes)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOrdersPage;

import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    fetchOrders();
    // Rafraîchir toutes les 30 secondes pour voir les nouvelles commandes
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [sortBy]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/admin/orders', {
        headers: {
          'x-admin-key': 'ZENDO_ADMIN_2026',
        },
        params: {
          sort: sortBy,
        },
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone?.includes(searchQuery) ||
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return price;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En traitement';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'En attente';
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'x-admin-key': 'ZENDO_ADMIN_2026',
          },
        }
      );

      if (response.data.success) {
        // Mettre à jour la commande dans la liste
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        // Mettre à jour la commande sélectionnée si c'est celle-ci
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        return true;
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      alert('Erreur lors de la mise à jour du statut');
      return false;
    }
  };

  const updateOrder = async (orderId, orderData) => {
    try {
      const response = await axios.put(
        `/api/admin/orders/${orderId}`,
        orderData,
        {
          headers: {
            'x-admin-key': 'ZENDO_ADMIN_2026',
          },
        }
      );

      if (response.data.success) {
        // Mettre à jour la commande dans la liste
        setOrders(orders.map(order => 
          order._id === orderId ? response.data.order : order
        ));
        // Mettre à jour la commande sélectionnée si c'est celle-ci
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(response.data.order);
        }
        setEditingOrder(null);
        return true;
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Erreur lors de la mise à jour de la commande');
      return false;
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      console.log('🗑️  Suppression de la commande:', orderId);
      const response = await axios.delete(`/api/admin/orders/${orderId}`, {
        headers: {
          'x-admin-key': 'ZENDO_ADMIN_2026',
        },
      });

      if (response.data.success) {
        console.log('✅ Commande supprimée avec succès');
        // Retirer la commande de la liste
        setOrders(orders.filter(order => order._id !== orderId));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
        // Retirer de la sélection
        const newSelected = new Set(selectedOrders);
        newSelected.delete(orderId);
        setSelectedOrders(newSelected);
        // Rafraîchir la liste pour être sûr
        fetchOrders();
        return true;
      }
    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      console.error('Détails:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
      });
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression de la commande';
      alert(`Erreur: ${errorMessage}`);
      return false;
    }
  };

  // Fonctions de sélection multiple
  const toggleOrderSelection = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order._id)));
    }
  };

  const isAllSelected = filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length;
  const isSomeSelected = selectedOrders.size > 0 && selectedOrders.size < filteredOrders.length;

  // Actions en masse
  const bulkUpdateStatus = async (newStatus) => {
    if (selectedOrders.size === 0) return;

    const count = selectedOrders.size;
    const selectedIds = Array.from(selectedOrders);

    if (!window.confirm(`Changer le statut de ${count} commande(s) en "${getStatusLabel(newStatus)}" ?`)) {
      return;
    }

    try {
      const promises = selectedIds.map(orderId =>
        axios.patch(
          `/api/admin/orders/${orderId}/status`,
          { status: newStatus },
          {
            headers: {
              'x-admin-key': 'ZENDO_ADMIN_2026',
            },
          }
        )
      );

      await Promise.all(promises);
      
      // Mettre à jour les commandes dans la liste
      setOrders(orders.map(order =>
        selectedIds.includes(order._id) ? { ...order, status: newStatus } : order
      ));
      
      // Vider la sélection
      setSelectedOrders(new Set());
      
      // Rafraîchir
      fetchOrders();
      
      alert(`${count} commande(s) mise(s) à jour avec succès`);
    } catch (err) {
      console.error('Erreur lors de la mise à jour en masse:', err);
      alert('Erreur lors de la mise à jour en masse');
    }
  };

  const bulkDelete = async () => {
    if (selectedOrders.size === 0) return;

    const count = selectedOrders.size;
    const selectedIds = Array.from(selectedOrders);

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${count} commande(s) ?`)) {
      return;
    }

    try {
      const promises = selectedIds.map(orderId =>
        axios.delete(`/api/admin/orders/${orderId}`, {
          headers: {
            'x-admin-key': 'ZENDO_ADMIN_2026',
          },
        })
      );

      await Promise.all(promises);
      
      // Retirer les commandes de la liste
      setOrders(orders.filter(order => !selectedIds.includes(order._id)));
      
      // Fermer le modal si une commande sélectionnée était ouverte
      if (selectedOrder && selectedIds.includes(selectedOrder._id)) {
        setSelectedOrder(null);
      }
      
      // Vider la sélection
      setSelectedOrders(new Set());
      
      // Rafraîchir
      fetchOrders();
      
      alert(`${count} commande(s) supprimée(s) avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression en masse:', err);
      alert('Erreur lors de la suppression en masse');
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Commandes</h1>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedOrders.size} commande(s) sélectionnée(s)
                </span>
                <button
                  onClick={() => setSelectedOrders(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Tout désélectionner
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Actions:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      bulkUpdateStatus(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Changer le statut...</option>
                  <option value="pending">En attente</option>
                  <option value="processing">En traitement</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
                <button
                  onClick={bulkDelete}
                  className="px-3 py-1 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded hover:bg-red-100"
                >
                  Supprimer ({selectedOrders.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher des commandes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="-createdAt">Plus récent</option>
              <option value="createdAt">Plus ancien</option>
              <option value="name">Nom (A-Z)</option>
              <option value="-name">Nom (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            {error}
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des commandes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isSomeSelected;
                        }}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Commande
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Quantité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Prix total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedOrders.has(order._id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleOrderSelection(order._id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          #{order._id?.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="text-sm font-medium text-gray-900">{order.name}</div>
                        <div className="text-sm text-gray-500">{order.phone}</div>
                        <div className="text-sm text-gray-500">{order.city}</div>
                      </td>
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="text-sm text-gray-900">{order.productName || 'N/A'}</div>
                        {order.productSlug && (
                          <div className="text-xs text-gray-500 font-mono mt-1">
                            {order.productSlug}
                          </div>
                        )}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="text-sm text-gray-900">{order.quantity || 1}</div>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(order.totalPrice || order.productPrice)}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded ${getStatusColor(order.status || 'pending')}`}>
                          {getStatusLabel(order.status || 'pending')}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Voir
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingOrder(order);
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOrder(order._id);
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
          onEdit={() => {
            setEditingOrder(selectedOrder);
            setSelectedOrder(null);
          }}
          onDelete={deleteOrder}
        />
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={updateOrder}
        />
      )}
    </AdminLayout>
  );
}

function OrderDetailsModal({ order, onClose, onStatusChange, onEdit, onDelete }) {
  const [changingStatus, setChangingStatus] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En traitement';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'En attente';
    }
  };

  const handleStatusChange = async (newStatus) => {
    setChangingStatus(true);
    await onStatusChange(order._id, newStatus);
    setChangingStatus(false);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Commande #{order._id?.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="border border-gray-200 rounded p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Informations client
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Nom</span>
                  <p className="text-sm text-gray-900 mt-0.5">{order.name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Téléphone</span>
                  <p className="text-sm text-gray-900 mt-0.5">
                    <a
                      href={`tel:${order.phone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {order.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Ville</span>
                  <p className="text-sm text-gray-900 mt-0.5">{order.city}</p>
                </div>
                {order.address && (
                  <div>
                    <span className="text-xs text-gray-500">Adresse</span>
                    <p className="text-sm text-gray-900 mt-0.5">{order.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Info */}
            <div className="border border-gray-200 rounded p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Détails de la commande
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Produit</span>
                  <p className="text-sm text-gray-900 mt-0.5">{order.productName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Quantité</span>
                  <p className="text-sm text-gray-900 mt-0.5">{order.quantity || 1}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Prix total</span>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {order.totalPrice || order.productPrice || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Statut</span>
                  <div className="mt-0.5">
                    <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded ${getStatusColor(order.status || 'pending')}`}>
                      {getStatusLabel(order.status || 'pending')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Images */}
          {order.productImages && order.productImages.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Images du produit
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {order.productImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${order.productName} ${idx + 1}`}
                    className="w-full h-24 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x200?text=Image+non+disponible';
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Product Details */}
          {(order.productShortDesc || order.productFullDesc || order.productBenefits) && (
            <div className="mt-4 border border-gray-200 rounded p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Informations produit
              </h3>
              {order.productShortDesc && (
                <div className="mb-3">
                  <span className="text-xs text-gray-500">Description courte</span>
                  <p className="text-sm text-gray-900 mt-0.5">{order.productShortDesc}</p>
                </div>
              )}
              {order.productFullDesc && (
                <div className="mb-3">
                  <span className="text-xs text-gray-500">Description complète</span>
                  <p className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap">
                    {order.productFullDesc}
                  </p>
                </div>
              )}
              {order.productBenefits && order.productBenefits.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Bénéfices</span>
                  <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                    {order.productBenefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-gray-900">{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Changer le statut:</span>
            <select
              value={order.status || 'pending'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={changingStatus}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit();
              }}
              className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded hover:bg-green-100"
            >
              Modifier
            </button>
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
                  onDelete(order._id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded hover:bg-red-100"
            >
              Supprimer
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditOrderModal({ order, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: order.name || '',
    phone: order.phone || '',
    city: order.city || '',
    address: order.address || '',
    quantity: order.quantity || 1,
    totalPrice: order.totalPrice || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await onSave(order._id, formData);
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Modifier la commande #{order._id?.slice(-8).toUpperCase()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix total
              </label>
              <input
                type="text"
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: 9,900 FCFA"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminOrdersPage;

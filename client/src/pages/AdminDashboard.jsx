import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/orders', {
        headers: {
          'x-admin-key': 'ZENDO_ADMIN_2026',
        },
        params: {
          limit: 5,
          sort: '-createdAt',
        },
      });

      if (response.data.success) {
        const orders = response.data.orders || [];
        setRecentOrders(orders);

        // Calculate stats
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o) => !o.status || o.status === 'pending').length;
        const totalRevenue = orders.reduce((sum, order) => {
          const price = order.totalPrice || order.productPrice || '0';
          const numPrice = parseFloat(price.replace(/[^\d.]/g, '')) || 0;
          return sum + numPrice;
        }, 0);

        // Get unique customers
        const uniqueCustomers = new Set(orders.map((o) => o.phone)).size;

        setStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          totalCustomers: uniqueCustomers,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return price;
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

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Commandes totales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Revenus totaux</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalRevenue.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">En attente</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.pendingOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Clients</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalCustomers}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Commandes récentes</h2>
                <Link
                  to="/admin/orders"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir toutes →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                        Commande
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                        Produit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                        Prix
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                          Aucune commande récente
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Link
                              to={`/admin/orders`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              #{order._id?.slice(-8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.name}</div>
                            <div className="text-sm text-gray-500">{order.phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{order.productName || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatPrice(order.totalPrice || order.productPrice)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;

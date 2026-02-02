import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { getFirstWord } from '../utils/format';

function AdminDashboard() {
  const [stats, setStats] = useState({
    visits: { total: 0, change: 0, sparkline: [] },
    revenue: { total: 0, change: 0 },
    orders: { total: 0, change: 0, pending: 0, sparkline: [] },
    conversionRate: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [days, setDays] = useState(30);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const dateInputRef = useRef(null);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [days, rangeStart, rangeEnd]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Utiliser la période sélectionnée pour les stats
      const params =
        days && days > 0
          ? { days: Math.max(days, 1), includeSeed: 'true' }
          : {
              ...(rangeStart && { startDate: rangeStart }),
              ...(rangeEnd && { endDate: rangeEnd }),
              includeSeed: 'true',
            };
      const response = await api.get('/api/admin/stats', {
        headers: {
          'x-admin-key': 'ZENDO_ADMIN_2026',
        },
        params,
      });

      if (response.data?.success && response.data?.stats) {
        const statsData = response.data.stats;
        console.log('📊 Stats chargées depuis la BD:', {
          visites: statsData.visits?.total || 0,
          commandes: statsData.orders?.total || 0,
          CA: statsData.revenue?.total || 0,
          clients: statsData.customers || 0,
          enAttente: statsData.orders?.pending || 0,
        });
        setStats(statsData);
      } else {
        console.warn('⚠️ Réponse stats invalide:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const getEffectiveDateRange = () => {
    if (rangeStart || rangeEnd) {
      return { startDate: rangeStart, endDate: rangeEnd };
    }
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - Math.max(days, 1) + 1);
    start.setHours(0, 0, 0, 0);
    return {
      startDate: formatDateInput(start),
      endDate: formatDateInput(end),
    };
  };

  const fetchRecentOrders = async () => {
    try {
      const { startDate, endDate } = getEffectiveDateRange();
      const params = {
        limit: 5,
        sort: '-createdAt',
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const response = await api.get('/api/admin/orders', {
        headers: {
          'x-admin-key': 'ZENDO_ADMIN_2026',
        },
        params,
      });

      if (response.data.success) {
        setRecentOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const handleTimeRangeChange = (newDays) => {
    setDays(newDays);
    setRangeStart('');
    setRangeEnd('');
  };

  const formatDateInput = (date) => date.toISOString().split('T')[0];

  const handleToday = () => {
    setDays(0);
    const today = new Date();
    const formatted = formatDateInput(today);
    setRangeStart(formatted);
    setRangeEnd(formatted);
  };

  const handleYesterday = () => {
    setDays(0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = formatDateInput(yesterday);
    setRangeStart(formatted);
    setRangeEnd(formatted);
  };

  const handleRangeStartChange = (value) => {
    setDays(0);
    setRangeStart(value);
    if (!rangeEnd) {
      setRangeEnd(value);
    }
  };

  const handleRangeEndChange = (value) => {
    setDays(0);
    setRangeEnd(value);
    if (!rangeStart) {
      setRangeStart(value);
    }
  };

  const handleClearDate = () => {
    setRangeStart('');
    setRangeEnd('');
    if (!days || days === 0) {
      setDays(30);
    }
  };

  const handlePeriodChange = (value) => {
    if (value === 'today') {
      handleToday();
      return;
    }
    if (value === 'yesterday') {
      handleYesterday();
      return;
    }
    if (value === 'custom') {
      handleClearDate();
      setDays(0);
      requestAnimationFrame(() => dateInputRef.current?.showPicker?.());
      return;
    }
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      handleTimeRangeChange(parsed);
    }
  };

  const getPeriodValue = () => {
    if (days === 7) return '7';
    if (days === 30) return '30';
    if (days === 90) return '90';
    if (days === 365) return '365';
    if (days === 0 && rangeStart && rangeEnd) {
      if (rangeStart === rangeEnd) {
        const today = formatDateInput(new Date());
        const yesterday = formatDateInput(new Date(Date.now() - 86400000));
        if (rangeStart === today) return 'today';
        if (rangeStart === yesterday) return 'yesterday';
        return 'custom';
      }
      return 'custom';
    }
    return '30';
  };

  const getPeriodLabel = () => {
    const { startDate, endDate } = getEffectiveDateRange();
    if (rangeStart && rangeEnd) {
      if (rangeStart === rangeEnd) {
        return `Le ${rangeStart}`;
      }
      return `Du ${rangeStart} au ${rangeEnd}`;
    }
    const rangeLabel = startDate && endDate ? `Du ${startDate} au ${endDate}` : '';
    if (days === 7) return `7 derniers jours${rangeLabel ? ` · ${rangeLabel}` : ''}`;
    if (days === 30) return `30 derniers jours${rangeLabel ? ` · ${rangeLabel}` : ''}`;
    if (days === 90) return `90 derniers jours${rangeLabel ? ` · ${rangeLabel}` : ''}`;
    if (days === 365) return `12 derniers mois${rangeLabel ? ` · ${rangeLabel}` : ''}`;
    return `30 derniers jours${rangeLabel ? ` · ${rangeLabel}` : ''}`;
  };

  const isFiltered = Boolean(rangeStart || rangeEnd || (days && days !== 30));

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 FCFA';
    if (typeof price === 'number') {
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)} M FCFA`;
      }
      return `${price.toLocaleString('fr-FR')} FCFA`;
    }
    return price;
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)} K`;
    }
    return num.toString();
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

  const formatChange = (change) => {
    if (change === 0) return '—';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Filter Bar */}
        <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: 'today', label: "Aujourd'hui" },
                { value: 'yesterday', label: 'Hier' },
                { value: '7', label: '7j' },
                { value: '30', label: '30j' },
                { value: '90', label: '90j' },
                { value: '365', label: '1 an' },
                { value: 'custom', label: 'Personnalisé' },
              ].map((option) => {
                const active = getPeriodValue() === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePeriodChange(option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      active
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {getPeriodValue() === 'custom' && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  ref={dateInputRef}
                  value={rangeStart}
                  onChange={(e) => handleRangeStartChange(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700"
                />
                <span className="text-sm text-gray-400">→</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => handleRangeEndChange(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700"
                />
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Tout
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{getPeriodLabel()}</span>
              {isFiltered && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  Filtré
                </span>
              )}
            </div>
          </div>
          <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <option>Tous les canaux</option>
            <option>Boutique en ligne</option>
            <option>Facebook & Instagram</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Performance Metrics Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Visites */}
                  <div className="border-r border-gray-200 pr-6 last:border-r-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Visites</p>
                      {stats.visits.change !== 0 && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${getChangeColor(stats.visits.change)}`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.visits.change > 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                          </svg>
                          {Math.abs(stats.visits.change)}%
                        </div>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {formatNumber(stats.visits?.total || 0)}
                    </p>
                    {stats.visits?.sparkline && stats.visits.sparkline.length > 0 && stats.visits.sparkline.some(v => v > 0) && (
                      <div className="h-8 flex items-end gap-0.5">
                        {stats.visits.sparkline.map((value, i) => {
                          const maxValue = Math.max(...stats.visits.sparkline.filter(v => v > 0), 1);
                          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-blue-500 rounded-t min-h-[2px]"
                              style={{ height: `${Math.max(height, 2)}%` }}
                            />
                          );
                        })}
                      </div>
                    )}
                    {(!stats.visits?.sparkline || stats.visits.sparkline.length === 0 || !stats.visits.sparkline.some(v => v > 0)) && (
                      <div className="h-8" />
                    )}
                  </div>

                  {/* Ventes totales */}
                  <div className="border-r border-gray-200 pr-6 last:border-r-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Ventes totales</p>
                      {stats.revenue?.change !== 0 && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${getChangeColor(stats.revenue.change)}`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.revenue.change > 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                          </svg>
                          {Math.abs(stats.revenue.change)}%
                        </div>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.revenue?.total ?? 0)}</p>
                    {stats.revenue?.total >= 1000000 && (
                      <p className="text-xs text-gray-500 mt-1">{(stats.revenue.total / 1000000).toFixed(1)} M FCFA</p>
                    )}
                    {(!stats.revenue?.total || stats.revenue.total === 0) && (
                      <p className="text-xs text-gray-400 mt-1">Depuis la BD</p>
                    )}
                  </div>

                  {/* Commandes */}
                  <div className="border-r border-gray-200 pr-6 last:border-r-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Commandes</p>
                      {stats.orders?.change !== 0 && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${getChangeColor(stats.orders.change)}`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.orders.change > 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                          </svg>
                          {Math.abs(stats.orders.change)}%
                        </div>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stats.orders?.total ?? 0}</p>
                    {stats.orders?.pending > 0 && (
                      <p className="text-xs text-orange-600 font-medium mb-2">{stats.orders.pending} en attente</p>
                    )}
                    {(!stats.orders?.total || stats.orders.total === 0) && (
                      <p className="text-xs text-gray-400 mb-2">Depuis la BD</p>
                    )}
                    {stats.orders?.sparkline && stats.orders.sparkline.length > 0 && (
                      <div className="h-8 flex items-end gap-0.5">
                        {stats.orders.sparkline.map((value, i) => {
                          const maxValue = Math.max(...stats.orders.sparkline.filter(v => v > 0), 1);
                          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-blue-500 rounded-t min-h-[2px]"
                              style={{ height: `${Math.max(height, 2)}%` }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Taux de conversion */}
                  <div className="border-r border-gray-200 pr-6 last:border-r-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Taux de conversion</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {(stats.conversionRate ?? 0) > 0 ? `${stats.conversionRate}%` : '0%'}
                    </p>
                    {(!stats.conversionRate || stats.conversionRate === 0) && (
                      <p className="text-xs text-gray-400 mb-2">Depuis la BD</p>
                    )}
                    {(stats.conversionRate ?? 0) > 0 && (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                        />
                      </div>
                    )}
                    {(!stats.conversionRate || stats.conversionRate === 0) && (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-300" style={{ width: '0%' }} />
                      </div>
                    )}
                  </div>

                  {/* Clients uniques */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Clients</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{stats.customers || 0}</p>
                    <p className="text-xs text-gray-500">Clients uniques</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Link
                to="/admin/orders?status=new,pending,called"
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {(stats.orders?.pending || 0) > 0 ? `${stats.orders.pending}+` : 'Aucune'} commande{(stats.orders?.pending || 0) > 1 ? 's' : ''} à traiter
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Commandes nécessitant une attention</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {(stats.orders?.pending || 0) > 0 ? `${stats.orders.pending}+` : 'Aucun'} paiement{(stats.orders?.pending || 0) > 1 ? 's' : ''} à saisir
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Paiements en attente de capture</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
              <p className="text-lg font-semibold text-gray-900 mb-4">
                Bonsoir ! C'est parti.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Demandez quelque chose..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="12" cy="12" r="10" fill="currentColor" className="text-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }} />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">1 sur 4 tâches effectuées</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Améliorez votre taux de conversion
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Augmentez le pourcentage de visiteurs qui achètent quelque chose dans votre boutique en ligne.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Prochaine leçon:</span>
                    <span className="font-medium">Automatisez vos paniers abandonnés</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Reprendre le guide
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Commandes</h2>
                  <p className="text-xs text-gray-500">Filtrees par la selection du dashboard</p>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir toutes →
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div className="p-6" />
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentOrders.map((order) => {
                    const statusColors = {
                      new: 'bg-blue-100 text-blue-800',
                      pending: 'bg-yellow-100 text-yellow-800',
                      called: 'bg-purple-100 text-purple-800',
                      processing: 'bg-indigo-100 text-indigo-800',
                      in_delivery: 'bg-orange-100 text-orange-800',
                      shipped: 'bg-cyan-100 text-cyan-800',
                      delivered: 'bg-green-100 text-green-800',
                      cancelled: 'bg-red-100 text-red-800',
                      rescheduled: 'bg-gray-100 text-gray-800',
                    };
                    const statusLabels = {
                      new: 'Nouvelle',
                      pending: 'En attente',
                      called: 'Appelée',
                      processing: 'Traitement',
                      in_delivery: 'Livraison',
                      shipped: 'Expédiée',
                      delivered: 'Livrée',
                      cancelled: 'Annulée',
                      rescheduled: 'Reportée',
                    };
                    return (
                      <Link
                        key={order._id}
                        to="/admin/orders"
                        className="block p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                                #{order._id?.slice(-4).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{order.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-gray-500">{getFirstWord(order.productName)}</p>
                                  {order.city && (
                                    <>
                                      <span className="text-xs text-gray-400">•</span>
                                      <p className="text-xs text-gray-500">{order.city}</p>
                                    </>
                                  )}
                                  {order.quantity > 1 && (
                                    <>
                                      <span className="text-xs text-gray-400">•</span>
                                      <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-semibold text-gray-900">{formatPrice(order.totalPrice || order.productPrice)}</p>
                            <div className="flex items-center justify-end gap-2 mt-1">
                              {order.status && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                  {statusLabels[order.status] || order.status}
                                </span>
                              )}
                              <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;

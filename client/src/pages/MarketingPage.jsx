import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';

function MarketingPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/whatsapp/stats', {
        params: { apiKey: 'ZENDO_WHATSAPP_2026' }
      });
      
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Erreur stats:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const generateRelances = async () => {
    try {
      setSending(true);
      setError(null);
      setSuccess(null);
      
      const response = await api.post('/api/whatsapp/relance', {
        apiKey: 'ZENDO_WHATSAPP_2026'
      });
      
      if (response.data?.success) {
        setMessages(response.data.data.messages);
        setSuccess(`${response.data.data.messages.length} messages de relance générés avec succès!`);
        await fetchStats(); // Rafraîchir les stats
      }
    } catch (err) {
      console.error('Erreur relance:', err);
      setError('Erreur lors de la génération des messages');
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async (message) => {
    // Simuler l'envoi via votre service WhatsApp
    try {
      alert(`Message envoyé à ${message.to}:\n\n${message.message}`);
    } catch (err) {
      console.error('Erreur envoi:', err);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Marketing & Relances WhatsApp</h1>
            <p className="text-gray-600 mt-1">Gérez les campagnes de relance pour les clients en attente</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">📊 Statistiques des commandes en attente</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalWaiting}</div>
                  <div className="text-sm text-blue-800">Total en attente</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">{stats.waiting1Day}</div>
                  <div className="text-sm text-yellow-800">En attente J+1</div>
                  <div className="text-xs text-yellow-700 mt-1">Promo 10%</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">{stats.waiting3Days}</div>
                  <div className="text-sm text-orange-800">En attente J+3</div>
                  <div className="text-xs text-orange-700 mt-1">Promo 15%</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{stats.waitingMore3Days}</div>
                  <div className="text-sm text-red-800">En attente J+3+</div>
                  <div className="text-xs text-red-700 mt-1">Promo 15%</div>
                </div>
              </div>

              <div className="mt-4 flex gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{stats.eligibleForRelance}</span> éligibles aux relances
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{stats.promo10Percent}</span> avec promo 10%
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{stats.promo15Percent}</span> avec promo 15%
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">🚀 Actions de marketing</h2>
              
              <div className="flex gap-4">
                <button
                  onClick={generateRelances}
                  disabled={sending || stats.eligibleForRelance === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? 'Génération...' : `Générer ${stats.eligibleForRelance} messages de relance`}
                </button>
                
                <button
                  onClick={fetchStats}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  🔄 Rafraîchir les stats
                </button>
              </div>

              {stats.eligibleForRelance === 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-600">
                  Aucune commande éligible aux relances pour le moment.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages générés */}
        {messages.length > 0 && (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">💬 Messages générés ({messages.length})</h2>
              
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{msg.customerName}</div>
                        <div className="text-sm text-gray-600">{msg.to}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {msg.daysWaiting} jour(s) d'attente • {msg.amount}
                          {msg.promoCode && ` • Promo: ${msg.promoCode}`}
                        </div>
                      </div>
                      <button
                        onClick={() => sendMessage(msg)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        📤 Envoyer
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              {success}
            </div>
          </div>
        )}

        {/* Documentation */}
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📖 Documentation</h2>
            
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900">🎯 Ciblage des relances</h3>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Commandes en statut "ATTENTE" depuis plus de 24h</li>
                  <li>Promo 10% (RELANCE10FCFA) pour J+1</li>
                  <li>Promo 15% (FLASH15FCFA) pour J+3 et plus</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">💬 Format des messages</h3>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Ton camerounais authentique</li>
                  <li>Limite 160 caractères</li>
                  <li>Lien direct vers le panier</li>
                  <li>Numéro de support intégré</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">🔗 Intégration WhatsApp</h3>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Compatible respond.io, WAGHL, webhooks custom</li>
                  <li>API key configurable dans .env</li>
                  <li>Tracking des envois en temps réel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default MarketingPage;

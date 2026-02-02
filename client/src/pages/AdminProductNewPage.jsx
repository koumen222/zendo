import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../api';

const emptyOffer = { qty: 1, label: '', priceValue: 0 };

function AdminProductNewPage() {
  const [name, setName] = useState('');
  const [offers, setOffers] = useState([{ ...emptyOffer }]);
  const [images, setImages] = useState(['']);
  const [shortDesc, setShortDesc] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parsedImages = useMemo(
    () => images.map((url) => url.trim()).filter(Boolean),
    [images]
  );

  const handleOfferChange = (index, field, value) => {
    setOffers((prev) =>
      prev.map((offer, idx) =>
        idx === index
          ? {
              ...offer,
              [field]: field === 'qty' || field === 'priceValue' ? Number(value) : value,
            }
          : offer
      )
    );
  };

  const handleUploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/admin/upload-image', formData, {
          headers: {
            'x-admin-key': 'ZENDO_ADMIN_2026',
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data?.success && response.data?.url) {
          uploadedUrls.push(response.data.url);
        } else {
          throw new Error(response.data?.message || 'Erreur upload image');
        }
      }

      if (uploadedUrls.length) {
        setImages((prev) => [...prev.filter((url) => url.trim()), ...uploadedUrls]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur upload image');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const addOffer = () => setOffers((prev) => [...prev, { ...emptyOffer }]);
  const removeOffer = (index) =>
    setOffers((prev) => prev.filter((_, idx) => idx !== index));

  const handleImageChange = (index, value) => {
    setImages((prev) => prev.map((img, idx) => (idx === index ? value : img)));
  };

  const addImage = () => setImages((prev) => [...prev, '']);
  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, idx) => idx !== index));

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError('Le nom du produit est requis');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug: slug.trim() || undefined,
        productName: name.trim(),
        shortDesc: shortDesc.trim(),
        images: parsedImages,
        offers: offers.filter((offer) => offer.label || offer.priceValue || offer.qty),
      };

      const response = await api.post('/api/admin/products', payload, {
        headers: {
          'x-admin-key': 'ZENDO_ADMIN_2026',
        },
      });

      if (response.data?.success) {
        setSuccess('Produit créé avec succès');
        setSlug('');
        setName('');
        setShortDesc('');
        setOffers([{ ...emptyOffer }]);
        setImages(['']);
      } else {
        setError(response.data?.message || 'Erreur lors de la création du produit');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du produit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Produits</p>
              <h1 className="text-2xl font-semibold text-gray-900">Ajouter un produit</h1>
            </div>
            <Link
              to="/admin/products"
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retour produits
            </Link>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug (optionnel)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex: serum-eclat"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Laissez vide pour générer automatiquement.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sérum éclat"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description courte</label>
              <textarea
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Phrase courte pour le produit"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm min-h-[80px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Offres & prix</label>
                <button
                  type="button"
                  onClick={addOffer}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {offers.map((offer, index) => (
                  <div key={index} className="grid grid-cols-[70px_1fr_90px_auto] gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      value={offer.qty}
                      onChange={(e) => handleOfferChange(index, 'qty', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Qté"
                    />
                    <input
                      value={offer.label}
                      onChange={(e) => handleOfferChange(index, 'label', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Label offre (ex: 2 boites - 25 000 FCFA)"
                    />
                    <input
                      type="number"
                      value={offer.priceValue}
                      onChange={(e) => handleOfferChange(index, 'priceValue', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Prix"
                    />
                    {offers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOffer(index)}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Images (URL)</label>
                <button
                  type="button"
                  onClick={addImage}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Ajouter
                </button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadImages}
                  className="text-sm"
                />
                {uploading && <span className="text-xs text-gray-500">Upload en cours...</span>}
              </div>
              <div className="space-y-2">
                {images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="https://..."
                    />
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {(error || success) && (
              <div className={`text-sm px-4 py-3 rounded-lg ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {error || success}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer le produit'}
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-500">Aperçu produit</p>
              <h2 className="text-lg font-semibold text-gray-900">
                {name || 'Nom du produit'}
              </h2>
              {shortDesc && <p className="text-sm text-gray-600 mt-1">{shortDesc}</p>}
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {(parsedImages.length > 0 ? parsedImages : ['']).map((src, index) => (
                  <div key={`${src}-${index}`} className="w-full max-w-4xl mx-auto bg-white">
                    {src ? (
                      <img
                        src={src}
                        alt={name || 'Produit'}
                        className="w-full h-auto object-top"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div className="w-full h-48 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                        Ajoutez une image pour prévisualiser
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Offres</h3>
                <div className="grid gap-3">
                  {offers.map((offer, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {offer.label || `Offre ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">Qté: {offer.qty || 1}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {offer.priceValue ? `${offer.priceValue.toLocaleString('fr-FR')} FCFA` : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ boxShadow: '0 4px 14px rgba(107, 33, 168, 0.4)' }}
                >
                  Commander maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminProductNewPage;

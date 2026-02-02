import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../api';

function AdminProductEditPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    productName: '',
    shortDesc: '',
    images: [],
    offers: [{ qty: 1, label: '', priceValue: 0 }],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/products/${slug}`);
        if (response.data?.success) {
          const p = response.data.product;
          
          // Static products are now editable, no need to block
          setForm({
            productName: p.productName || '',
            shortDesc: p.shortDesc || '',
            images: p.images || [],
            offers: p.offers?.length ? p.offers : [{ qty: 1, label: '', priceValue: 0 }],
          });
        } else {
          setError('Produit introuvable');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/api/admin/upload-image', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'X-Admin-Key': 'ZENDO_ADMIN_2026',
          },
        });
        return response.data?.url;
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(Boolean);
      
      setForm((prev) => ({ ...prev, images: [...prev.images, ...validUrls] }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur upload image');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addOffer = () => {
    setForm((prev) => ({
      ...prev,
      offers: [...prev.offers, { qty: 1, label: '', priceValue: 0 }],
    }));
  };

  const updateOffer = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      offers: prev.offers.map((offer, i) =>
        i === index ? { ...offer, [field]: value } : offer
      ),
    }));
  };

  const removeOffer = (index) => {
    setForm((prev) => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index, direction) => {
    setForm((prev) => {
      const newImages = [...prev.images];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Check bounds
      if (newIndex < 0 || newIndex >= newImages.length) return prev;
      
      // Swap images
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put(`/api/admin/products/${slug}`, form);
      if (response.data?.success) {
        alert('Produit mis à jour avec succès');
        navigate('/admin/products');
      }
    } catch (err) {
      console.error('Update error:', err);
      if (err.response?.status === 401) {
        alert('Erreur d\'authentification admin');
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Modifier le produit</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-w-4xl">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => setForm((prev) => ({ ...prev, productName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
              <textarea
                value={form.shortDesc}
                onChange={(e) => setForm((prev) => ({ ...prev, shortDesc: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>
            <div className="mb-4">
              <label className="block w-full cursor-pointer">
                <span className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 inline-block">
                  {uploading ? 'Upload...' : 'Ajouter des images'}
                </span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Image ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    
                    {/* Move up button */}
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, 'up')}
                        className="absolute top-1 left-1 bg-blue-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Monter"
                      >
                        ↑
                      </button>
                    )}
                    
                    {/* Move down button */}
                    {i < form.images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, 'down')}
                        className="absolute top-1 left-8 bg-blue-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Descendre"
                      >
                        ↓
                      </button>
                    )}
                    
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Offres</h2>
            {form.offers.map((offer, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Qté"
                  value={offer.qty}
                  onChange={(e) => updateOffer(i, 'qty', e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                  min="1"
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={offer.label}
                  onChange={(e) => updateOffer(i, 'label', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  placeholder="Prix"
                  value={offer.priceValue}
                  onChange={(e) => updateOffer(i, 'priceValue', e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded"
                  min="0"
                />
                <button type="button" onClick={() => removeOffer(i)} className="text-red-500">
                  Supprimer
                </button>
              </div>
            ))}
            <button type="button" onClick={addOffer} className="text-primary-600 hover:text-primary-700">
              + Ajouter une offre
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AdminProductEditPage;

import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

function AdminProductsPage() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Produits</h1>
            <Link
              to="/admin/products/new"
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
            >
              Ajouter un produit
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Page produits en développement</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminProductsPage;

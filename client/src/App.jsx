import { Routes, Route, useLocation } from 'react-router-dom';
import ProductPage from './pages/ProductPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isProductPage = location.pathname.startsWith('/produit');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && !isProductPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/produit/:slug" element={<ProductPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
        </Routes>
      </main>
      {!isAdminPage && !isProductPage && <Footer />}
    </div>
  );
}

export default App;


import { Link, Route, Routes } from 'react-router';
import { CartProvider } from './features/cart/CartContext';
import { Layout } from './components/Layout';
import { CatalogPage } from './features/products/CatalogPage';
import { ProductPage } from './features/products/ProductPage';

export function App() {
  return <CartProvider><Routes><Route element={<Layout />}>
    <Route index element={<CatalogPage />} />
    <Route path="products/:id" element={<ProductPage />} />
    <Route path="*" element={<section className="feedback"><p className="eyebrow">404</p><h1>Esta página no está en la colección.</h1><Link className="button" to="/">Volver a dispositivos</Link></section>} />
  </Route></Routes></CartProvider>;
}

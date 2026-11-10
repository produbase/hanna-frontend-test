import { createCache } from './cache';
import { isCatalog, isProduct, normalizeProduct } from '../features/products/model';

const API_URL = (import.meta.env.VITE_API_URL || 'https://itx-frontend-test.onrender.com').replace(/\/$/, '');
const cache = createCache();

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(response.status === 404 ? 'No encontramos este producto.' : 'El servicio no está disponible. Inténtalo de nuevo.');
    }
    try { return await response.json(); } catch { throw new Error('El servicio devolvió una respuesta no válida.'); }
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('El servicio está tardando demasiado. Inténtalo de nuevo.');
    if (error instanceof TypeError) throw new Error('No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export const api = {
  listProducts: () => cache.get(`${API_URL}/product`, () => request('/api/product'), isCatalog),
  async getProduct(id) {
    const raw = await cache.get(`${API_URL}/product/${id}`, () => request(`/api/product/${encodeURIComponent(id)}`), isProduct);
    return normalizeProduct(raw);
  },
  async addToCart({ id, colorCode, storageCode }) {
    const response = await request('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, colorCode, storageCode }),
    });
    if (!Number.isSafeInteger(response?.count) || response.count < 0) throw new Error('No se ha podido confirmar el carrito.');
    return response.count;
  },
};

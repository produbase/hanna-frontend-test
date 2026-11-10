import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { readStored, writeStored } from '../../lib/storage';

const CartContext = createContext(null);
export const CART_KEY = 'itx:cart:v1';
const validCount = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;

export function CartProvider({ children }) {
  const [count, setCount] = useState(() => validCount(readStored(CART_KEY)));
  const [pending, setPending] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    const sync = (event) => { if (event.key === CART_KEY || event.key === null) setCount(validCount(readStored(CART_KEY))); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  async function add(selection) {
    if (lock.current) return false;
    lock.current = true;
    setPending(true);
    try {
      const nextCount = await api.addToCart(selection);
      setCount(nextCount);
      writeStored(CART_KEY, nextCount);
      return true;
    } finally {
      lock.current = false;
      setPending(false);
    }
  }

  return <CartContext.Provider value={{ count, pending, add }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart requiere CartProvider');
  return context;
}

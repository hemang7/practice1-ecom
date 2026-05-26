'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { canAddToCart } from '@/lib/stock';
import type { CartItem, Product } from '@/lib/types';

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product) => boolean;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  getCartQuantity: (productId: string) => number;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isReady: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'simple-shop-cart';

function clampQuantity(product: Product, quantity: number) {
  return Math.min(Math.max(0, quantity), product.stockQuantity);
}

function parseStoredCart(raw: string): CartItem[] {
  const parsed = JSON.parse(raw) as CartItem[];
  return parsed.map((item) => ({
    ...item,
    stockQuantity: item.stockQuantity ?? 0,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isReady: isAuthReady } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const previousUserIdRef = useRef<string | null>(null);

  const clearCart = useCallback(() => {
    setItems([]);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Load cart from localStorage on startup (regardless of auth state).
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(parseStoredCart(raw));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsReady(true);
  }, []);

  // Persist cart for all users (including guests) so it survives redirects.
  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isReady]);

  // Only clear cart on logout (when auth transitions from user -> null).
  useEffect(() => {
    if (!isAuthReady) return;

    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    if (previousUserId && !currentUserId) {
      clearCart();
    }

    previousUserIdRef.current = currentUserId;
  }, [isAuthReady, user?.id, clearCart]);

  // Note: we intentionally do not clear the cart when a user logs in.

  const getCartQuantity = useCallback(
    (productId: string) => items.find((item) => item.id === productId)?.quantity ?? 0,
    [items],
  );

  const addItem = useCallback(
    (product: Product) => {
      const currentQuantity = getCartQuantity(product.id);
      if (!canAddToCart(product, currentQuantity)) {
        return false;
      }

      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);
        if (existing) {
          return current.map((item) =>
            item.id === product.id
              ? { ...item, ...product, quantity: item.quantity + 1 }
              : item,
          );
        }
        return [...current, { ...product, quantity: 1 }];
      });

      return true;
    },
    [getCartQuantity],
  );

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  };

  const setQuantity = (productId: string, quantity: number) => {
    setItems((current) => {
      const item = current.find((entry) => entry.id === productId);
      if (!item) {
        return current;
      }

      const nextQuantity = clampQuantity(item, quantity);
      if (nextQuantity <= 0) {
        return current.filter((entry) => entry.id !== productId);
      }

      return current.map((entry) =>
        entry.id === productId ? { ...entry, quantity: nextQuantity } : entry,
      );
    });
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const shipping = subtotal > 0 ? 6 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    setQuantity,
    getCartQuantity,
    clearCart,
    itemCount,
    subtotal,
    shipping,
    tax,
    total,
    isReady,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}

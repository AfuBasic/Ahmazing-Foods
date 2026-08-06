import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SelProtein {
  name: string;
  qty: number;
  extraCost: number;
}

export interface CartItem {
  id: string;
  menuItemId: number;
  menuItemName: string;
  category: string;
  selectedSize: string;
  itemQty: number;
  selectedProteins: SelProtein[];
  price: number;
  imageUrl?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ahmazing_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + (item.itemQty || 1), 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // Check if identical item (same menuItemId, size, proteins) exists
      const existingIdx = prev.findIndex(
        (p) =>
          p.menuItemId === item.menuItemId &&
          p.selectedSize === item.selectedSize &&
          JSON.stringify(p.selectedProteins) === JSON.stringify(item.selectedProteins)
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.itemQty + item.itemQty;
        const singlePrice = existing.price / existing.itemQty;
        updated[existingIdx] = {
          ...existing,
          itemQty: newQty,
          price: singlePrice * newQty,
        };
        return updated;
      }

      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const singlePrice = item.price / item.itemQty;
          return {
            ...item,
            itemQty: qty,
            price: singlePrice * qty,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const setCartItems = (items: CartItem[]) => {
    setCart(items);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

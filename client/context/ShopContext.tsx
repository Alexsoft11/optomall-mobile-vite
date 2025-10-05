import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Product = {
  id: number;
  name: string;
  price: number;
};

type ShopContextType = {
  cart: Product[];
  favorites: number[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: number) => void;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("shop_cart") || "[]");
    } catch {
      return [];
    }
  });
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("shop_favs") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("shop_cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("shop_favs", JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (p: Product) => {
    setCart((s) => [...s, p]);
  };
  const removeFromCart = (id: number) => {
    setCart((s) => s.filter((it) => it.id !== id));
  };
  const toggleFavorite = (id: number) => {
    setFavorites((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  };
  const isFavorite = (id: number) => favorites.includes(id);

  return (
    <ShopContext.Provider
      value={{
        cart,
        favorites,
        addToCart,
        removeFromCart,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}

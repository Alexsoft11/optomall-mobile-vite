import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string | number;
  name: string;
  price: number;
};

type ShopContextType = {
  cart: Product[];
  favorites: (string | number)[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string | number) => void;
  toggleFavorite: (id: string | number) => void;
  isFavorite: (id: string | number) => boolean;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

function genSessionKey() {
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

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

  // Ensure we have a session key stored locally
  useEffect(() => {
    let key = localStorage.getItem("shop_session_key");
    if (!key) {
      key = genSessionKey();
      localStorage.setItem("shop_session_key", key);
    }

    // If Supabase is available, try to load session from DB
    (async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("session_key", key)
          .limit(1)
          .maybeSingle();
        if (error) {
          console.warn("Supabase sessions fetch error:", error.message || error);
        }
        if (data) {
          // data.cart and data.favorites are stored as JSON in DB
          try {
            const dbCart = Array.isArray(data.cart) ? data.cart : JSON.parse(data.cart || "[]");
            const dbFavs = Array.isArray(data.favorites) ? data.favorites : JSON.parse(data.favorites || "[]");
            setCart(dbCart);
            setFavorites(dbFavs);
          } catch (e) {
            // ignore parse errors and keep local
          }
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Persist locally and remotely when cart changes
  useEffect(() => {
    localStorage.setItem("shop_cart", JSON.stringify(cart));

    const key = localStorage.getItem("shop_session_key");
    if (!key || !supabase) return;

    (async () => {
      try {
        await supabase.from("sessions").upsert({
          session_key: key,
          cart: cart,
          favorites: favorites,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to sync cart to Supabase", err);
      }
    })();
  }, [cart]);

  // Persist favorites locally and remotely when favorites change
  useEffect(() => {
    localStorage.setItem("shop_favs", JSON.stringify(favorites));

    const key = localStorage.getItem("shop_session_key");
    if (!key || !supabase) return;

    (async () => {
      try {
        await supabase.from("sessions").upsert({
          session_key: key,
          cart: cart,
          favorites: favorites,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to sync favorites to Supabase", err);
      }
    })();
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

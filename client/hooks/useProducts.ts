import { useEffect, useState } from "react";
import { products as localProducts } from "@/data/products";
import { supabase } from "@/lib/supabase";

export function useProducts() {
  const [items, setItems] = useState(localProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
        if (error) {
          console.warn("Supabase products fetch error:", error.message);
        }
        if (data && mounted) {
          setItems(data as any);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { items, loading };
}

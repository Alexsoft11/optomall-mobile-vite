import { useMemo } from "react";
import GlassCard from "@/components/GlassCard";
import { useShop } from "@/context/ShopContext";

const sampleProducts = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name:
    ["Aero Chair", "Flux Lamp", "Mono Sofa", "Prism Table"][i % 4] +
    " " +
    (i + 1),
  price: 99 + i * 7,
}));

export default function Favorites() {
  const { favorites, toggleFavorite } = useShop();

  const items = useMemo(
    () => sampleProducts.filter((p) => favorites.includes(p.id)),
    [favorites],
  );

  if (items.length === 0)
    return (
      <div className="p-6 text-center text-foreground/70">
        No favorites yet — tap the heart on a product to save it.
      </div>
    );

  return (
    <div className="px-4 pb-20 pt-4 grid grid-cols-2 gap-4">
      {items.map((p) => (
        <GlassCard key={p.id} className="overflow-hidden">
          <div className="h-28 bg-gradient-to-b from-muted to-card relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-14 rounded-xl bg-gradient-to-br from-primary/40 to-accent/30" />
            </div>
          </div>
          <div className="p-3">
            <div className="text-sm font-medium truncate">{p.name}</div>
            <div className="mt-1 text-xs text-foreground/70">
              UZS {(p.price * 12450).toLocaleString()}
            </div>
            <div className="mt-2 flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center h-9 rounded-[20px] bg-primary text-primary-foreground text-sm">
                Add
              </button>
              <button
                onClick={() => toggleFavorite(p.id)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/30"
              >
                ♥
              </button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

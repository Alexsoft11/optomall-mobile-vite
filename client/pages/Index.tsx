import GlassCard from "@/components/GlassCard";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Star, ShoppingCart, Heart } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { products } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";

export default function Index() {
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const { items: productsList } = useProducts();

  const featured = productsList.slice(0, 4);
  const latest = productsList.slice(0, 8);
  const categories = [
    { id: "electronics", label: "Electronics", icon: "⚡" },
    { id: "clothing", label: "Clothing", icon: "👕" },
    { id: "dishes", label: "Dishes", icon: "🍽️" },
    { id: "sports", label: "Sports", icon: "⚽" },
  ];

  return (
    <div className="px-4 pb-6 pt-4 space-y-6">
      {/* Hero Banner */}
      <GlassCard className="neon-card rounded-3xl overflow-hidden">
        <div className="p-5 relative">
          <div className="absolute -top-10 -right-10 size-40 rounded-full blur-3xl opacity-40 bg-primary/40" />
          <div className="absolute bottom-0 -left-10 size-28 rounded-full blur-3xl opacity-40 bg-accent/40" />
          <div className="flex items-center gap-2 text-xs text-foreground/70">
            <Sparkles className="size-3.5" />
            Global marketplace from China
          </div>
          <h1
            className="mt-2 text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Poppins, Inter, sans-serif" }}
          >
            ChinaMall
          </h1>
          <p className="mt-1 text-foreground/70 text-sm">
            Shop directly from China with guaranteed quality and fast shipping
            worldwide.
          </p>
          <div className="mt-4 flex gap-2">
            <RouterLink
              to="/marketplace"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-primary-foreground font-medium shadow-md hover:opacity-90 transition"
            >
              Shop Now <ArrowRight className="size-4" />
            </RouterLink>
            <a
              href="#categories"
              className="inline-flex items-center px-4 h-10 rounded-xl bg-white/60 dark:bg-white/10 border border-white/30 text-sm"
            >
              Categories
            </a>
          </div>
        </div>
      </GlassCard>

      {/* Categories */}
      <section id="categories" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "Poppins, Inter, sans-serif" }}
          >
            Shop by category
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <RouterLink
              key={cat.id}
              to={`/marketplace?category=${cat.id}`}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/20 hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/20 hover:to-accent/20 transition text-center"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium">{cat.label}</div>
            </RouterLink>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "Poppins, Inter, sans-serif" }}
          >
            Best sellers
          </h2>
          <RouterLink
            to="/marketplace"
            className="text-sm text-foreground/70 hover:text-foreground"
          >
            View all
          </RouterLink>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
          {featured.map((p) => (
            <GlassCard
              key={p.id}
              className="min-w-[200px] snap-start overflow-hidden hover:ring-2 hover:ring-primary/40 transition cursor-pointer"
            >
              <div className="h-40 bg-gradient-to-b from-muted to-card relative overflow-hidden">
                {p.images && p.images[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => toggleFavorite(p.id)}
                  className="absolute top-2 right-2 size-8 rounded-lg grid place-items-center bg-white/80 dark:bg-white/20 border border-white/20 hover:bg-white dark:hover:bg-white/30"
                >
                  <Heart
                    className={
                      isFavorite(p.id)
                        ? "size-4 text-destructive fill-current"
                        : "size-4 text-foreground/60"
                    }
                  />
                </button>
              </div>
              <div className="p-3">
                <div className="text-xs text-foreground/60 mb-1 capitalize">
                  {p.category}
                </div>
                <div className="text-sm font-medium truncate line-clamp-2 mb-1">
                  {p.name}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-xs text-amber-500">
                    {"★".repeat(Math.floor(p.rating || 0))}
                  </div>
                  <span className="text-xs text-foreground/60">
                    ({p.reviews || 0})
                  </span>
                </div>
                <div className="text-sm font-semibold text-primary mb-2">
                  ${p.price.toFixed(2)}
                </div>
                <button
                  onClick={() => addToCart(p)}
                  className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition"
                >
                  Add to cart
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Latest Products */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "Poppins, Inter, sans-serif" }}
          >
            New arrivals
          </h2>
          <RouterLink
            to="/marketplace"
            className="text-sm text-foreground/70 hover:text-foreground"
          >
            Browse all
          </RouterLink>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {latest.map((p) => (
            <GlassCard
              key={p.id}
              className="overflow-hidden hover:ring-2 hover:ring-primary/40 transition cursor-pointer"
            >
              <div className="h-28 bg-gradient-to-b from-muted to-card relative overflow-hidden">
                {p.images && p.images[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => toggleFavorite(p.id)}
                  className="absolute top-2 right-2 size-8 rounded-lg grid place-items-center bg-white/80 dark:bg-white/20 border border-white/20"
                >
                  <Heart
                    className={
                      isFavorite(p.id)
                        ? "size-4 text-destructive fill-current"
                        : "size-4 text-foreground/60"
                    }
                  />
                </button>
              </div>
              <div className="p-2">
                <div className="text-xs font-medium truncate mb-1">{p.name}</div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-primary">
                    ${p.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-amber-500">
                    ★ {p.rating?.toFixed(1) || "0"}
                  </div>
                </div>
                <button
                  onClick={() => addToCart(p)}
                  className="w-full h-7 rounded-lg bg-white/70 dark:bg-white/10 border border-white/30 text-xs hover:ring-2 hover:ring-primary/40"
                >
                  <ShoppingCart className="size-3 inline mr-1" />
                  Add
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Shipping Banner */}
      <GlassCard className="rounded-2xl p-4 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary/50 to-accent/40" />
        <div className="text-sm flex-1">
          <div className="font-medium">Free shipping on orders over $50</div>
          <div className="text-foreground/70 text-xs">
            Worldwide delivery in 10-30 days
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-accent">
          <Star className="size-4 fill-accent" />
          <span className="text-xs font-medium">Verified seller</span>
        </div>
      </GlassCard>
    </div>
  );
}

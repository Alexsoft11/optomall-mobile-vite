import { useParams } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { products } from "@/data/products";
import { ShoppingCart, Heart } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Link } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  const pid = Number(id || 0);
  const product = products.find((p) => p.id === pid) || products[0];
  const { addToCart, toggleFavorite, isFavorite } = useShop();

  return (
    <div className="px-4 pb-20 pt-6 space-y-4">
      <GlassCard className="rounded-2xl overflow-hidden">
        <div className="h-64 bg-muted relative">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          <div className="absolute top-3 right-3">
            <button
              onClick={() => toggleFavorite(product.id)}
              className="size-10 rounded-2xl grid place-items-center bg-white/60 dark:bg-white/10 border border-white/30"
              aria-label="Toggle favorite"
            >
              <Heart className={isFavorite(product.id) ? "size-5 text-destructive" : "size-5 text-foreground/70"} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-lg font-semibold">{product.name}</h1>
              <div className="text-sm text-foreground/70 mt-1">UZS {(product.price * 12450).toLocaleString()}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => addToCart(product)} className="inline-flex items-center gap-2 px-4 h-10 rounded-[20px] bg-primary text-primary-foreground">
                <ShoppingCart className="size-4" /> Add
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-foreground/70">
            {product.description}
          </div>
        </div>
      </GlassCard>

      <section>
        <h2 className="text-md font-semibold mb-2">Related products</h2>
        <div className="grid grid-cols-2 gap-3">
          {products.filter((p) => p.id !== product.id).slice(0,4).map((p) => (
            <Link to={`/product/${p.id}`} key={p.id} className="block">
              <GlassCard className="overflow-hidden">
                <div className="h-28 bg-gradient-to-b from-muted to-card relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-primary/40 to-accent/30" />
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="mt-1 text-xs text-foreground/70">UZS {(p.price * 12450).toLocaleString()}</div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

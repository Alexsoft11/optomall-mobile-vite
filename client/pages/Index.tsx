import { Link } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Star, ShoppingCart, Heart } from "lucide-react";
import { useShop } from "@/context/ShopContext";

const featured = [
  { id: 1, title: "Futurist Living Room", by: "Zetta Studio" },
  { id: 2, title: "Matte Kitchen Set", by: "Nova Interior" },
  { id: 3, title: "Glasmorph Office", by: "Aero Design" },
];

const latest = [
  { id: 101, name: "Orbit Chair", price: 249.0 },
  { id: 102, name: "Halo Lamp", price: 129.0 },
  { id: 103, name: "Nebula Sofa", price: 899.0 },
  { id: 104, name: "Prism Table", price: 459.0 },
];

export default function Index() {
  return (
    <div className="px-4 pb-6 pt-4 space-y-6">
      {/* Hero Banner */}
      <GlassCard className="neon-card rounded-3xl overflow-hidden">
        <div className="p-5 relative">
          <div className="absolute -top-10 -right-10 size-40 rounded-full blur-3xl opacity-40 bg-primary/40" />
          <div className="absolute bottom-0 -left-10 size-28 rounded-full blur-3xl opacity-40 bg-accent/40" />
          <div className="flex items-center gap-2 text-xs text-foreground/70">
            <Sparkles className="size-3.5" />
            Hi‑tech marketplace
          </div>
          <h1
            className="mt-2 text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Poppins, Inter, sans-serif" }}
          >
            Optomall.uz
          </h1>
          <p className="mt-1 text-foreground/70 text-sm">
            Interior design projects and curated products in one minimal,
            futuristic experience.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-primary-foreground font-medium shadow-md hover:opacity-90 transition"
            >
              Explore <ArrowRight className="size-4" />
            </Link>
            <a
              href="#featured"
              className="inline-flex items-center px-4 h-10 rounded-xl bg-white/60 dark:bg-white/10 border border-white/30 text-sm"
            >
              Featured
            </a>
          </div>
        </div>
      </GlassCard>

      {/* Featured Projects */}
      <section id="featured" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "Poppins, Inter, sans-serif" }}
          >
            Featured projects
          </h2>
          <Link
            to="/marketplace"
            className="text-sm text-foreground/70 hover:text-foreground"
          >
            See all
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
          {featured.map((f) => (
            <GlassCard
              key={f.id}
              className="min-w-[260px] snap-start overflow-hidden"
            >
              <div className="font-normal h-36">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=800"
                  srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=2000 2000w"
                  style={{
                    aspectRatio: "1.42",
                    objectFit: "cover",
                    objectPosition: "center",
                    width: "100%",
                    marginTop: "20px",
                    minHeight: "20px",
                    minWidth: "20px",
                    overflow: "hidden",
                  }}
                />
              </div>
              <div className="p-4">
                <div className="text-sm font-medium">{f.title}</div>
                <div className="text-xs text-foreground/70">by {f.by}</div>
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
            Latest products
          </h2>
          <Link
            to="/marketplace"
            className="text-sm text-foreground/70 hover:text-foreground"
          >
            Browse
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {latest.map((p) => (
            <GlassCard key={p.id} className="overflow-hidden">
              <div className="h-28 bg-gradient-to-b from-muted to-card relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-14 rounded-xl bg-gradient-to-br from-primary/40 to-accent/30 glow-ring" />
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="mt-1 text-xs text-foreground/70">
                  UZS {(p.price * 12450).toLocaleString()}
                </div>
                <Link
                  to={`/product/${p.id}`}
                  className="mt-2 inline-flex items-center justify-center w-full h-9 rounded-[20px] bg-white/70 dark:bg-white/10 border border-white/30 text-sm hover:ring-2 hover:ring-primary/40"
                >
                  Add to cart
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Banner */}
      <GlassCard className="rounded-2xl p-4 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary/50 to-accent/40" />
        <div className="text-sm">
          <div className="font-medium">Premium Designers</div>
          <div className="text-foreground/70 text-xs">
            Curated talents for your next project
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-amber-500">
          <Star className="size-4 fill-amber-500" />
          <span className="text-xs">Top rated</span>
        </div>
      </GlassCard>
    </div>
  );
}

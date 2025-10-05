import GlassCard from "@/components/GlassCard";
import { SlidersHorizontal, Filter, ChevronDown } from "lucide-react";

const products = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name:
    ["Aero Chair", "Flux Lamp", "Mono Sofa", "Prism Table"][i % 4] +
    " " +
    (i + 1),
  price: 99 + i * 7,
}));

export default function Marketplace() {
  return (
    <div className="px-4 pb-6 pt-4 space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button className="chip whitespace-nowrap">
          <SlidersHorizontal className="size-4" /> Filters
        </button>
        <button className="chip whitespace-nowrap">Chairs</button>
        <button className="chip whitespace-nowrap">Lighting</button>
        <button className="chip whitespace-nowrap">Sofas</button>
        <button className="chip whitespace-nowrap">Tables</button>
        <button className="chip whitespace-nowrap">
          <Filter className="size-4" /> More
        </button>
        <button className="chip whitespace-nowrap">
          Price <ChevronDown className="size-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {products.map((p) => (
          <GlassCard key={p.id} className="overflow-hidden">
            <div className="h-28 bg-gradient-to-b from-muted to-card relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-16 rounded-xl bg-gradient-to-br from-primary/40 to-accent/30" />
              </div>
            </div>
            <div className="p-3">
              <div className="text-sm font-medium truncate">{p.name}</div>
              <div className="mt-1 text-xs text-foreground/70">
                UZS {(p.price * 12450).toLocaleString()}
              </div>
              <button className="mt-2 inline-flex items-center justify-center w-full h-9 rounded-xl bg-primary text-primary-foreground text-sm">
                Add
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

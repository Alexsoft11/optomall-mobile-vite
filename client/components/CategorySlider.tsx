import { X } from "lucide-react";
import GlassCard from "@/components/GlassCard";

export type CategoryItem = {
  id: string;
  label: string;
  icon: string;
};

type CategorySliderProps = {
  categories: CategoryItem[];
  activeCategory?: string;
  onSelect: (categoryId: string) => void;
  onClear?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function CategorySlider({
  categories,
  activeCategory,
  onSelect,
  onClear,
  title = "Categories",
  subtitle,
  className = "",
}: CategorySliderProps) {
  return (
    <section className={`space-y-3 ${className}`.trim()}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          {subtitle ? <p className="text-xs text-foreground/60 mt-0.5">{subtitle}</p> : null}
        </div>
        {activeCategory && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 shrink-0"
          >
            <X className="size-3" /> Clear
          </button>
        ) : null}
      </div>

      <GlassCard className="p-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 -mx-1 px-1">
          <button
            type="button"
            onClick={onClear}
            disabled={!activeCategory}
            className={`min-w-[96px] snap-start px-3 py-3 rounded-xl border text-center transition shrink-0 ${
              activeCategory
                ? "bg-white/80 dark:bg-white/10 border-white/30 hover:border-primary/40"
                : "bg-primary text-primary-foreground border-primary"
            }`}
          >
            <div className="text-xs font-semibold">All</div>
            <div className="text-[11px] opacity-75">Shop all</div>
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat.id)}
                className={`min-w-[104px] snap-start px-3 py-3 rounded-xl border text-center transition shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white/70 dark:bg-white/10 border-white/20 hover:border-primary/40"
                }`}
              >
                <div className="text-2xl leading-none mb-1">{cat.icon}</div>
                <div className="text-xs font-medium leading-tight">{cat.label}</div>
              </button>
            );
          })}
        </div>
      </GlassCard>
    </section>
  );
}

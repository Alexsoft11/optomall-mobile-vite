import { ReactNode, useEffect, useRef, useState, useLayoutEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Grid3X3,
  ShoppingCart,
  User,
  Search,
  Moon,
  Sun,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useShop } from "@/context/ShopContext";
import { useCurrency } from "@/context/CurrencyContext";

interface LayoutProps {
  children: ReactNode;
}

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Shop", icon: Grid3X3 },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { cart, favorites } = useShop();
  const { currency, setCurrency } = useCurrency();
  const navRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const root = document.documentElement;
    if (saved === "dark") root.classList.add("dark");
    if (saved === "light") root.classList.remove("dark");
  }, []);

  useLayoutEffect(() => {
    const container = navRef.current;
    if (!container) return;
    const links = Array.from(
      container.querySelectorAll("a"),
    ) as HTMLAnchorElement[];
    // Find the active index by matching pathname
    const activeIndex = links.findIndex((a) => {
      try {
        const url = new URL(a.href);
        return (
          url.pathname === window.location.pathname ||
          (url.pathname === "/" && window.location.pathname === "/")
        );
      } catch (e) {
        return a.getAttribute("href") === window.location.pathname;
      }
    });
    const target = activeIndex >= 0 ? links[activeIndex] : links[0];
    if (target) {
      const rect = target.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - parentRect.left + 6,
        width: rect.width - 12,
      });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-black/30 border-b border-white/30 dark:border-white/10">
        <div className="mx-auto max-w-md w-full px-4 py-3 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary/80 to-accent/70 shadow-[0_0_30px_rgb(0_0_0/0.08)] ring-1 ring-white/30 flex items-center justify-center text-primary-foreground font-bold">
            O
          </div>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/60" />
              <input
                className="w-full h-10 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 pl-9 pr-3 text-sm placeholder:text-foreground/50 outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(255,255,255,0.2)]"
                placeholder="Search products from China"
              />
            </div>
          </div>
          <select
            onChange={(e) => setCurrency(e.target.value as any)}
            value={currency}
            className="px-3 h-10 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            aria-label="Select currency"
          >
            <option value="USD">USD</option>
            <option value="CNY">CNY</option>
            <option value="UZS">UZS</option>
          </select>
          <button
            onClick={() => {
              const root = document.documentElement;
              const isDark = root.classList.toggle("dark");
              localStorage.setItem("theme", isDark ? "dark" : "light");
            }}
            className="size-10 rounded-2xl grid place-items-center bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <Sun className="size-4 hidden dark:block" />
            <Moon className="size-4 dark:hidden" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main
        className="flex-1 mx-auto w-full max-w-md"
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom, 16px) + 96px)`,
        }}
      >
        {children}
      </main>

      {/* Bottom Nav */}
      <nav
        className="fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md"
        style={{ bottom: `calc(env(safe-area-inset-bottom, 16px) + 8px)` }}
      >
        <div ref={navRef} className="relative">
          <div
            ref={indicatorRef}
            className="absolute top-1/2 -translate-y-1/2 h-10 rounded-[50px] bg-primary/20 dark:bg-primary/10 transition-all duration-300 ease-in-out pointer-events-none"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
          <div
            className="glass-panel rounded-[50px] p-1 grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
            }}
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = location.pathname === t.to;
              const isCart = t.to === "/cart";
              const isFav = t.to === "/favorites";
              return (
                <NavLink key={t.to} to={t.to} className="group relative">
                  <div
                    className={cn(
                      "flex flex-col items-center gap-0.5 py-1.5 rounded-[50px] transition-colors px-2",
                      active
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 transition-transform",
                        active ? "scale-110" : "",
                      )}
                    />
                    <span className="text-[10px] leading-none">{t.label}</span>
                  </div>
                  {isCart && cart.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] w-5 h-5 rounded-full grid place-items-center">
                      {cart.length}
                    </div>
                  )}
                  {isFav && favorites.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 rounded-full grid place-items-center">
                      {favorites.length}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

import GlassCard from "@/components/GlassCard";
import { ShoppingCart, Heart, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useCurrency } from "@/context/CurrencyContext";
import { products } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Marketplace() {
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const { convertPrice } = useCurrency();
  const { items } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 50]);

  const categories = [
    { id: "electronics", label: "Electronics", icon: "⚡" },
    { id: "clothing", label: "Clothing", icon: "👕" },
    { id: "dishes", label: "Dishes", icon: "🍽️" },
    { id: "sports", label: "Sports", icon: "⚽" },
  ];

  const productsList = useMemo(() => {
    let filtered = items.length > 0 ? items : products;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    let sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "reviews":
        sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      case "newest":
      default:
        sorted.reverse();
        break;
    }

    return sorted;
  }, [selectedCategory, sortBy, priceRange, items]);

  const handleCategoryToggle = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory("");
      searchParams.delete("category");
    } else {
      setSelectedCategory(catId);
      searchParams.set("category", catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="px-4 pb-6 pt-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">Shop</h1>
        <p className="text-sm text-foreground/70">
          {productsList.length} products found
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Categories</h3>
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory("");
                searchParams.delete("category");
                setSearchParams(searchParams);
              }}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <X className="size-3" /> Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryToggle(cat.id)}
              className={`p-3 rounded-lg text-center transition ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground border border-primary"
                  : "bg-white/70 dark:bg-white/10 border border-white/20 hover:border-primary/40"
              }`}
            >
              <div className="text-lg mb-1">{cat.icon}</div>
              <div className="text-xs font-medium">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sorting */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="reviews">Most Reviewed</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Price range:</label>
          <span className="text-sm text-foreground/70">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          className="w-full h-2 bg-white/70 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Products Grid */}
      {productsList.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-foreground/70">No products found</p>
          <button
            onClick={() => {
              setSelectedCategory("");
              setSortBy("newest");
              setPriceRange([0, 50]);
              searchParams.delete("category");
              setSearchParams(searchParams);
            }}
            className="mt-4 text-sm text-primary hover:text-primary/80"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {productsList.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="cursor-pointer"
            >
              <GlassCard className="overflow-hidden hover:ring-2 hover:ring-primary/40 transition h-full">
                <div className="h-32 bg-gradient-to-b from-muted to-card relative overflow-hidden">
                  {p.images && p.images[0] && (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(p.id);
                    }}
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
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium">
                    {convertPrice(p.price)}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-foreground/60 mb-1 capitalize">
                    {p.category}
                  </div>
                  <div className="text-sm font-medium truncate line-clamp-2 mb-2">
                    {p.name}
                  </div>
                  {p.rating && (
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <div className="flex text-amber-500">
                        {"★".repeat(Math.floor(p.rating))}
                      </div>
                      <span className="text-foreground/60">({p.reviews})</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p);
                    }}
                    className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="size-3" /> Add to cart
                  </button>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

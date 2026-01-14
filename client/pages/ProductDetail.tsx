import GlassCard from "@/components/GlassCard";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingCart, Star, Share2, Plus, Minus } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useCurrency } from "@/context/CurrencyContext";
import { products } from "@/data/products";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const { convertPrice } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = products.find((p) => p.id === parseInt(id || ""));

  if (!product) {
    return (
      <div className="px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
        <button
          onClick={() => navigate("/marketplace")}
          className="text-primary hover:text-primary/80"
        >
          Back to marketplace
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      author: "John Doe",
      rating: 5,
      date: "2 weeks ago",
      title: "Excellent product!",
      content: "Great quality and fast delivery. Highly recommended!",
      helpful: 24,
      verified: true,
    },
    {
      id: 2,
      author: "Jane Smith",
      rating: 4,
      date: "1 month ago",
      title: "Good value for money",
      content: "Product arrived well packaged. Works as expected.",
      helpful: 18,
      verified: true,
    },
    {
      id: 3,
      author: "Mike Johnson",
      rating: 5,
      date: "1 month ago",
      title: "Perfect!",
      content: "Exactly what I was looking for. Shipping was quick too.",
      helpful: 15,
      verified: true,
    },
  ];

  const avgRating = (product.rating || 4.5).toFixed(1);
  const totalReviews = product.reviews || 234;

  return (
    <div className="px-4 pb-6 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-white/70 dark:hover:bg-white/10 transition"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-xl font-semibold flex-1">Product Details</h1>
      </div>

      {/* Image Section */}
      <GlassCard className="overflow-hidden">
        <div className="h-80 bg-gradient-to-b from-muted to-card relative overflow-hidden">
          {product.images && product.images[selectedImageIndex] && (
            <img
              src={product.images[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
          <button
            onClick={() => toggleFavorite(product.id)}
            className="absolute top-4 right-4 size-10 rounded-lg grid place-items-center bg-white/90 dark:bg-white/20 border border-white/20 hover:bg-white dark:hover:bg-white/30"
          >
            <Heart
              className={
                isFavorite(product.id)
                  ? "size-5 text-destructive fill-current"
                  : "size-5 text-foreground/60"
              }
            />
          </button>
          <button className="absolute top-4 left-4 size-10 rounded-lg grid place-items-center bg-white/90 dark:bg-white/20 border border-white/20 hover:bg-white dark:hover:bg-white/30">
            <Share2 className="size-5" />
          </button>
        </div>
        {product.images && product.images.length > 1 && (
          <div className="p-3 flex gap-2 border-t border-white/10">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`size-16 rounded-lg overflow-hidden border-2 transition ${
                  selectedImageIndex === idx
                    ? "border-primary"
                    : "border-white/20"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent capitalize font-medium">
              {product.category}
            </span>
          </div>
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-sm text-foreground/70 mt-2">{product.description}</p>
        </div>

        {/* Rating */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <div className="flex text-lg text-amber-500">
                  {"★".repeat(Math.floor(product.rating || 0))}
                </div>
                <span className="text-lg font-semibold ml-1">{avgRating}</span>
              </div>
              <p className="text-xs text-foreground/70">
                Based on {totalReviews.toLocaleString()} reviews
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Price and Stock */}
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-foreground/70 mb-1">Price</div>
            <div className="text-3xl font-bold text-primary">
              {convertPrice(product.price)}
            </div>
            <div className="text-xs text-foreground/70 mt-1">
              In stock: <span className="text-green-500 font-medium">250+ units</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-foreground/70 mb-2">Quantity</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="size-8 rounded-lg bg-white/70 dark:bg-white/10 border border-white/20 hover:border-primary/40 flex items-center justify-center"
              >
                <Minus className="size-4" />
              </button>
              <div className="w-12 text-center font-semibold">{quantity}</div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="size-8 rounded-lg bg-white/70 dark:bg-white/10 border border-white/20 hover:border-primary/40 flex items-center justify-center"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Seller Info */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-foreground/70 mb-1">Sold by</div>
              <div className="font-medium">{product.seller || "ChinaMall Store"}</div>
            </div>
            <button className="px-4 h-9 rounded-lg bg-white/70 dark:bg-white/10 border border-white/20 text-sm hover:border-primary/40 transition">
              Contact seller
            </button>
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            className="h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="size-5" /> Add to cart
          </button>
          <button className="h-12 rounded-lg bg-white/70 dark:bg-white/10 border border-white/20 font-medium hover:border-primary/40 transition">
            Buy now
          </button>
        </div>

        {/* Shipping Info */}
        <GlassCard className="p-4">
          <h3 className="font-medium mb-3">Shipping & Returns</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-primary font-semibold mt-0.5">📦</span>
              <div>
                <div className="font-medium">Free shipping</div>
                <div className="text-foreground/70 text-xs">
                  On orders over $50, typically arrives in 10-30 days
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-semibold mt-0.5">↩️</span>
              <div>
                <div className="font-medium">30-day returns</div>
                <div className="text-foreground/70 text-xs">
                  Return for full refund if not satisfied
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Reviews Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <button className="text-sm text-primary hover:text-primary/80">
            Write a review
          </button>
        </div>

        {/* Rating Distribution */}
        <GlassCard className="p-4">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage = rating === 5 ? 65 : rating === 4 ? 25 : 10;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs font-medium w-6">{rating}★</span>
                  <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/70 w-10 text-right">
                    {Math.round((percentage * totalReviews) / 100)}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Individual Reviews */}
        <div className="space-y-3">
          {reviews.map((review) => (
            <GlassCard key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium">{review.author}</div>
                    {review.verified && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
                        Verified buyer
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground/70">{review.date}</div>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {"★".split("").map((_, i) =>
                  i < review.rating ? (
                    <span key={i} className="text-amber-500 text-sm">
                      ★
                    </span>
                  ) : (
                    <span key={i} className="text-foreground/30 text-sm">
                      ★
                    </span>
                  )
                )}
              </div>
              <h4 className="font-medium text-sm mb-1">{review.title}</h4>
              <p className="text-sm text-foreground/70 mb-3">{review.content}</p>
              <button className="text-xs text-foreground/60 hover:text-foreground transition">
                👍 Helpful ({review.helpful})
              </button>
            </GlassCard>
          ))}
        </div>

        <button className="w-full h-10 rounded-lg bg-white/70 dark:bg-white/10 border border-white/20 text-sm font-medium hover:border-primary/40 transition">
          Show more reviews
        </button>
      </div>
    </div>
  );
}

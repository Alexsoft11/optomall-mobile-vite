import GlassCard from "@/components/GlassCard";
import { useParams, useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Share2,
  Plus,
  Minus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useCurrency } from "@/context/CurrencyContext";
import { products as fallbackProducts } from "@/data/products";
import { useState, useEffect, useCallback } from "react";
import { useAlibaba } from "@/hooks/useAlibaba";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const { convertPrice } = useCurrency();
  const { getProductDetail, getProductReviews, loading: apiLoading } = useAlibaba();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(4.5);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Embla carousel for main images
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedImageIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      console.log(`[PRODUCT_DETAIL] Loading ID: ${id}`);

      // First try to find in local products (if id is numeric and small)
      const localId = parseInt(id);
      if (!isNaN(localId) && localId < 1000) {
        const localProduct = fallbackProducts.find((p) => p.id === localId);
        if (localProduct) {
          setProduct(localProduct);
          setLoading(false);
          return;
        }
      }

      // If not found or not local numeric, fetch from Alibaba API
      try {
        const [apiProduct, apiReviews] = await Promise.all([
          getProductDetail(id),
          getProductReviews(id)
        ]);

        if (apiProduct) {
          setProduct(apiProduct);
        } else {
          setError("Product not found");
        }

        if (apiReviews && apiReviews.data) {
          setReviews(apiReviews.data);
          if (apiReviews.rating) setAvgRating(apiReviews.rating);
          if (apiReviews.total) setTotalReviews(apiReviews.total);
        }
      } catch (err) {
        console.error("Detail fetch error:", err);
        setError("Failed to load product from 1688");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, getProductDetail]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <Loader2 className="size-10 text-primary animate-spin" />
        <p className="text-foreground/70">Loading product details from China...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="px-4 py-8 text-center flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-semibold mb-2">{error || "Product not found"}</h1>
        <p className="text-foreground/60 mb-4 max-w-xs">
          We couldn't find the product you're looking for. It might have been removed or the ID is invalid.
        </p>
        <button
          onClick={() => navigate("/marketplace")}
          className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg hover:opacity-90 transition"
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

  const sellerName = typeof product.seller === 'string'
    ? product.seller
    : (product.seller?.name || "ChinaMall Store");

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
        <div className="relative group">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex h-80">
              {product.images && product.images.map((img: string, idx: number) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-full">
                  {product.video && idx === 0 ? (
                    <video
                      src={product.video}
                      controls
                      className="w-full h-full object-contain bg-black"
                      poster={img}
                    />
                  ) : (
                    <img
                      src={img}
                      alt={`${product.name} - ${idx + 1}`}
                      className="w-full h-full object-contain bg-white/50"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {product.images && product.images.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <button
            onClick={() => toggleFavorite(product.id)}
            className="absolute top-4 right-4 size-10 rounded-lg grid place-items-center bg-white/90 dark:bg-white/20 border border-white/20 hover:bg-white dark:hover:bg-white/30 z-10"
          >
            <Heart
              className={
                isFavorite(product.id)
                  ? "size-5 text-destructive fill-current"
                  : "size-5 text-foreground/60"
              }
            />
          </button>
          <button className="absolute top-4 left-4 size-10 rounded-lg grid place-items-center bg-white/90 dark:bg-white/20 border border-white/20 hover:bg-white dark:hover:bg-white/30 z-10">
            <Share2 className="size-5" />
          </button>

          {/* Pagination Dots */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-2 py-1.5 rounded-full backdrop-blur-sm">
              {product.images.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`size-1.5 rounded-full transition-all ${
                    selectedImageIndex === idx ? "w-4 bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {product.images && product.images.length > 1 && (
          <div className="p-3 flex gap-2 border-t border-white/10 overflow-x-auto bg-card/50 no-scrollbar">
            {product.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`min-w-16 size-16 rounded-lg overflow-hidden border-2 transition flex-shrink-0 relative ${
                  selectedImageIndex === idx
                    ? "border-primary"
                    : "border-white/20"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                {product.video && idx === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="size-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                      <div className="border-t-[4px] border-t-transparent border-l-[7px] border-l-primary border-b-[4px] border-b-transparent ml-1" />
                    </div>
                  </div>
                )}
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
              {product.category || (product.specifications?.category) || "Electronics"}
            </span>
            {product.minOrder && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                Min. Order: {product.minOrder} {product.unit || "piece"}
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <div
            className={`text-sm text-foreground/70 mt-2 overflow-hidden transition-all duration-300 ${isDescExpanded ? "" : "line-clamp-3"}`}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          {product.description && product.description.length > 150 && (
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-xs text-primary font-medium mt-1 hover:underline"
            >
              {isDescExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>

        {/* Rating */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <div className="flex text-lg text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < Math.floor(avgRating) ? "★" : "☆"}</span>
                  ))}
                </div>
                <span className="text-lg font-semibold ml-1">{typeof avgRating === 'number' ? avgRating.toFixed(1) : avgRating}</span>
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
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-foreground/40 line-through">
                {convertPrice(product.originalPrice)}
              </div>
            )}
            <div className="text-xs text-foreground/70 mt-1">
              In stock:{" "}
              <span className="text-green-500 font-medium">Available</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-foreground/70 mb-2">Quantity</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(product.minOrder || 1, quantity - 1))}
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
              <div className="font-medium">
                {sellerName}
              </div>
              {product.seller?.rating && (
                <div className="text-xs text-amber-500 font-medium mt-0.5">
                  Rating: {product.seller.rating} / 5.0
                </div>
              )}
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

        {/* Specifications */}
        {product.specifications && (
          <GlassCard className="p-4">
            <h3 className="font-medium mb-3">Specifications</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-foreground/60 capitalize">{key}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

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
                  <div className="text-xs text-foreground/70">
                    {review.date}
                  </div>
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
                  ),
                )}
              </div>
              <h4 className="font-medium text-sm mb-1">{review.title}</h4>
              <p className="text-sm text-foreground/70 mb-3">
                {review.content}
              </p>
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {review.images.map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt="Review attachment"
                      className="size-16 rounded-lg object-cover border border-white/10"
                    />
                  ))}
                </div>
              )}
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

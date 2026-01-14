import { useState, useCallback } from "react";

interface AlibabaProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  unit: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  minOrder: number;
  logistics?: {
    deliveryDays: number;
    shippingCost: number;
  };
}

interface SearchParams {
  keyword: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: "price_asc" | "price_desc" | "relevance";
  minPrice?: number;
  maxPrice?: number;
}

interface ShippingEstimate {
  productId: string;
  quantity: number;
  destination: string;
  shippingCost: number;
  currency: string;
  estimatedDelivery: number;
}

export function useAlibaba() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(
    async (params: SearchParams): Promise<AlibabaProduct[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/alibaba/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error("Failed to search products");
        }

        const data = await response.json();
        return data.data || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getProductDetail = useCallback(
    async (productId: string): Promise<AlibabaProduct | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/alibaba/product/${productId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }

        const data = await response.json();
        return data.data || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const estimateShipping = useCallback(
    async (
      productId: string,
      quantity: number,
      destination: string,
    ): Promise<ShippingEstimate | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/alibaba/shipping-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            quantity,
            destination,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to estimate shipping");
        }

        const data = await response.json();
        return data.data || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    searchProducts,
    getProductDetail,
    estimateShipping,
    loading,
    error,
  };
}

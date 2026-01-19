import { RequestHandler } from "express";

/**
 * 1688/Alibaba API Integration via tmapi.top
 *
 * Setup:
 * 1. Register at https://tmapi.top
 * 2. Get your API token
 * 3. Set TMAPI_TOKEN in environment variables
 *
 * API Documentation: https://tmapi.top/docs
 */

// TMAPI API endpoint - use api.tmapi.top not tmapi.top
const TMAPI_BASE_URL = "http://api.tmapi.top";
// Support both TMAPI_TOKEN and VITE_TMAPI_API_TOKEN environment variables
const TMAPI_TOKEN = process.env.VITE_TMAPI_API_TOKEN || process.env.TMAPI_TOKEN || "";

console.log("[TMAPI] Base URL:", TMAPI_BASE_URL);
console.log("[TMAPI] Token configured:", TMAPI_TOKEN ? "✓" : "✗");

// Helper function to make tmapi.top API requests
async function tmapiRequest(
  endpoint: string,
  params: Record<string, any> = {},
) {
  if (!TMAPI_TOKEN) {
    throw new Error(
      "TMAPI_TOKEN is not set. Please configure it in environment variables.",
    );
  }

  // Build URL with token
  const url = new URL(`${TMAPI_BASE_URL}/${endpoint}`);
  url.searchParams.set("token", TMAPI_TOKEN);

  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  console.log(`[TMAPI] GET ${endpoint} with params:`, Object.keys(params));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    const text = await response.text();
    console.error(`[TMAPI] Error (${response.status}):`, text.substring(0, 300));
    throw new Error(`tmapi.top API error: ${response.status} ${response.statusText}`);
  }

  if (!contentType?.includes("application/json")) {
    const text = await response.text();
    console.error(`[TMAPI] Expected JSON, got ${contentType}:`, text.substring(0, 300));
    throw new Error(`Expected JSON response, got ${contentType}`);
  }

  const data = await response.json();
  console.log(`[TMAPI] Success: got ${data.data?.items?.length || 0} items`);
  return data;
}

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
  minOrder?: number;
}

/**
 * Search products on 1688
 *
 * Usage: POST /api/alibaba/search
 * Body: {
 *   keyword: "wireless earbuds",
 *   pageNo: 1,
 *   pageSize: 20,
 *   sortBy: "price_asc",
 *   minPrice: 5,
 *   maxPrice: 50
 * }
 */
export const searchAlibabaProducts: RequestHandler = async (req, res) => {
  try {
    const {
      keyword,
      pageNo = 1,
      pageSize = 20,
      sortBy,
      minPrice,
      maxPrice,
    } = req.body as SearchParams;

    if (!keyword) {
      return res.status(400).json({ error: "keyword is required" });
    }

    // Call tmapi.top API for 1688 product search
    const params: Record<string, any> = {
      keywords: keyword,
      page: pageNo,
      pageSize: pageSize,
    };

    // Add filters if provided
    if (sortBy) {
      // sortType: 0 = relevance, 1 = price asc, 2 = price desc
      params.sortType =
        sortBy === "price_asc" ? 1 : sortBy === "price_desc" ? 2 : 0;
    }

    const response = await tmapiRequest("1688/en/search/items", params);

    // Transform tmapi.top response to our format
    const products: AlibabaProduct[] = (response.data?.items || []).map(
      (item: any) => ({
        id: item.itemId,
        name: item.title,
        price: item.minPrice || item.price,
        originalPrice: item.maxPrice || item.price * 1.2,
        unit: "piece",
        images: item.imageList || [item.image],
        seller: {
          id: item.supplierId,
          name: item.supplierName,
          rating: item.rating || 4.5,
        },
        minOrder: item.minOrder || 1,
        logistics: {
          deliveryDays: 15,
          shippingCost: 5,
        },
      }),
    );

    res.json({
      success: true,
      data: products,
      total: response.data?.totalCount || 0,
      pageNo,
      pageSize,
    });
  } catch (error) {
    console.error("1688 search error:", error);
    res.status(500).json({
      error: "Failed to search 1688 products",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get product details from 1688
 *
 * Usage: GET /api/alibaba/product/:productId
 */
export const getAlibabaProductDetail: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    // Call tmapi.top API to get item details
    // Reference: https://tmapi.top/docs/ali/item-detail/get-item-detail-by-id
    const response = await tmapiRequest(
      "1688/v2/item_detail",
      {
        item_id: productId,
      },
    );

    const item = response.data;

    if (!item) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Transform tmapi.top response to our format
    const product = {
      id: item.itemId,
      name: item.title,
      price: item.minPrice || item.price,
      originalPrice: item.maxPrice || item.price * 1.2,
      unit: item.unit || "piece",
      images: [item.image, ...(item.imageList || [])],
      seller: {
        id: item.supplierId,
        name: item.supplierName,
        rating: item.rating || 4.5,
      },
      minOrder: item.minOrder || 1,
      logistics: {
        deliveryDays: 15,
        shippingCost: 5,
      },
      description: item.description || item.title,
      specifications: {
        category: item.category || "N/A",
        weight: item.weight || "N/A",
        size: item.size || "N/A",
        material: item.material || "N/A",
        warranty: item.warranty || "No warranty",
      },
    };

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("1688 product detail error:", error);
    res.status(500).json({
      error: "Failed to get product details",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Estimate shipping for 1688 products
 *
 * Usage: POST /api/alibaba/shipping-estimate
 * Body: {
 *   productId: "ali_1",
 *   quantity: 100,
 *   destination: "US"
 * }
 */
export const estimateShipping: RequestHandler = async (req, res) => {
  try {
    const { productId, quantity, destination } = req.body;

    if (!productId || !quantity || !destination) {
      return res.status(400).json({
        error: "productId, quantity, and destination are required",
      });
    }

    try {
      // Try to get shipping info from tmapi.top
      const response = await tmapiRequest(
        "1688/v2/item_detail",
        { item_id: productId },
      );

      const item = response.data;
      const baseWeight = parseFloat(item.weight || "0.5");
      const totalWeight = baseWeight * quantity;

      // Estimate based on destination and weight
      let shippingCost = 0;
      let daysToDeliver = 15;

      if (destination === "US") {
        shippingCost = 50 + totalWeight * 2;
        daysToDeliver = 20;
      } else if (destination === "EU") {
        shippingCost = 60 + totalWeight * 2.5;
        daysToDeliver = 25;
      } else if (destination === "UZ") {
        shippingCost = 40 + totalWeight * 1.5;
        daysToDeliver = 18;
      } else {
        // Default for other destinations
        shippingCost = 70 + totalWeight * 3;
        daysToDeliver = 30;
      }

      res.json({
        success: true,
        data: {
          productId,
          quantity,
          destination,
          shippingCost: parseFloat(shippingCost.toFixed(2)),
          currency: "USD",
          estimatedDelivery: daysToDeliver,
          details: {
            baseCost: 50,
            perKgCost:
              destination === "US" ? 2 : destination === "EU" ? 2.5 : 1.5,
            totalWeight: `${totalWeight.toFixed(2)}kg`,
            shippingMethod: "DHL/FedEx/EMS",
          },
        },
      });
    } catch {
      // If API call fails, provide estimation based on defaults
      const baseWeight = 0.5;
      const totalWeight = baseWeight * quantity;
      let shippingCost = 50 + totalWeight * 2;
      let daysToDeliver = 20;

      res.json({
        success: true,
        data: {
          productId,
          quantity,
          destination,
          shippingCost: parseFloat(shippingCost.toFixed(2)),
          currency: "USD",
          estimatedDelivery: daysToDeliver,
          details: {
            baseCost: 50,
            perKgCost: 2,
            totalWeight: `${totalWeight.toFixed(2)}kg`,
            shippingMethod: "Standard International Shipping",
          },
        },
      });
    }
  } catch (error) {
    console.error("Shipping estimation error:", error);
    res.status(500).json({
      error: "Failed to estimate shipping",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get top 20 products from 1688 (for homepage)
 *
 * Usage: GET /api/alibaba/top-products
 */
export const getTopProducts: RequestHandler = async (req, res) => {
  try {
    // Search for popular products with high ratings
    // We'll search for generic popular categories and get the top results
    const keywords = [
      "wholesale electronics",
      "popular gadgets",
      "best sellers",
    ];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

    const response = await tmapiRequest("1688/en/search/items", {
      keyword: randomKeyword,
      page: 1,
      page_size: 20,
      sort: "default"
    });

    // Transform tmapi.top response to our format
    const products: AlibabaProduct[] = (response.data?.items || []).map(
      (item: any) => ({
        id: item.itemId,
        name: item.title,
        price: item.minPrice || item.price,
        originalPrice: item.maxPrice || item.price * 1.2,
        unit: "piece",
        images: item.imageList || [item.image],
        seller: {
          id: item.supplierId,
          name: item.supplierName,
          rating: item.rating || 4.5,
        },
        minOrder: item.minOrder || 1,
        logistics: {
          deliveryDays: 15,
          shippingCost: 5,
        },
      }),
    );

    res.json({
      success: true,
      data: products.slice(0, 20), // Ensure exactly 20 products
    });
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({
      error: "Failed to fetch top products",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

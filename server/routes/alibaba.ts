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

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_DETAIL = 5 * 60 * 1000; // 5 minutes
const CACHE_TTL_SEARCH = Infinity; // No time limit for search per requirements

function getCachedData(key: string, ttl: number) {
  const cached = cache.get(key);
  if (cached && (ttl === Infinity || Date.now() - cached.timestamp < ttl)) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Helper function to convert image URLs to proxy URLs
function proxifyImageUrls(images: any[]): string[] {
  if (!images) return [];

  return images
    .filter((img: any) => img) // Filter out null/undefined
    .map((img: string) => {
      // Handle protocol-relative URLs (common in Alibaba/1688)
      let finalImg = img;
      if (typeof img === "string" && img.startsWith("//")) {
        finalImg = "https:" + img;
      }

      // Ensure URL is absolute before proxying
      if (
        finalImg &&
        typeof finalImg === "string" &&
        finalImg.startsWith("http")
      ) {
        return `/api/alibaba/image?url=${encodeURIComponent(finalImg)}`;
      }
      return finalImg;
    });
}

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

  // Build URL with API token (TMAPI uses 'apiToken' not 'token')
  const url = new URL(`${TMAPI_BASE_URL}/${endpoint}`);
  url.searchParams.set("apiToken", TMAPI_TOKEN);

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

  // ALWAYS LOG RAW DATA FOR DEBUGGING
  console.log(`[TMAPI] RAW RESPONSE (first 1000 chars):`, JSON.stringify(data).substring(0, 1000));

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
      keyword: keyword,
      page: pageNo,
      page_size: pageSize,
    };

    // Add sort parameter if provided
    // TMAPI accepts: default, sales, price_up, price_down
    if (sortBy === "price_asc") {
      params.sort = "price_up";
    } else if (sortBy === "price_desc") {
      params.sort = "price_down";
    } else if (sortBy === "sales") {
      params.sort = "sales";
    } else {
      params.sort = "default";
    }

    const cacheKey = `search_${JSON.stringify(params)}`;
    const cachedResponse = getCachedData(cacheKey, CACHE_TTL_SEARCH);
    if (cachedResponse) {
      console.log(`[CACHE] Hit for search: ${keyword}`);
      return res.json(cachedResponse);
    }

    const response = await tmapiRequest("1688/en/search/items", params);

    // Transform tmapi.top response to our format
    const products: AlibabaProduct[] = (response.data?.items || []).map(
      (item: any) => {
        // ID mapping
        const productId = item.item_id || item.itemId || item.offerId || item.productId || item.id;

        // Image mapping - search results usually have 'img' (single URL)
        let imageList: string[] = [];
        if (item.img) {
          imageList = [item.img];
        } else if (item.imageList && Array.isArray(item.imageList)) {
          imageList = item.imageList;
        } else if (item.picUrl || item.pic_url || item.image || item.mainImage) {
          imageList = [item.picUrl || item.pic_url || item.image || item.mainImage];
        }

        const proxiedImages = proxifyImageUrls(imageList);

        // Price mapping - search results often have 'price' or 'price_info.price'
        let price = parseFloat(item.price || item.minPrice || "0");
        if (item.price_info && item.price_info.price) {
          price = parseFloat(item.price_info.price);
        }

        let originalPrice = price * 1.2;
        if (item.price_info && item.price_info.original_price) {
          originalPrice = parseFloat(item.price_info.original_price);
        }

        // Seller mapping
        const sellerName = item.shop_info?.shop_name || item.supplierName || item.sellerName || item.companyName || "1688 Supplier";
        const sellerId = item.shop_info?.shop_id || item.supplierId || item.userId || item.sellerId || "unknown";

        return {
          id: String(productId),
          name: item.title || item.subject || item.name || "Product",
          price: price,
          originalPrice: originalPrice,
          unit: item.offer_unit || "piece",
          images: proxiedImages,
          seller: {
            id: String(sellerId),
            name: sellerName,
            rating: item.shop_info?.star_score || item.rating || 4.5,
          },
          minOrder: item.quantity_begin || item.minOrder || 1,
          logistics: {
            deliveryDays: 15,
            shippingCost: 5,
          },
        };
      },
    );

    const result = {
      success: true,
      data: products,
      total: response.data?.totalCount || 0,
      pageNo,
      pageSize,
    };

    setCachedData(cacheKey, result);
    res.json(result);
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

    // TMAPI expects numeric item_id. If it's not numeric, it's likely a mock product.
    if (!/^\d+$/.test(productId)) {
      console.log(`[TMAPI] Skipping detail fetch for non-numeric ID: ${productId}`);
      return res.status(404).json({ error: "Product not found in 1688 (non-numeric ID)" });
    }

    const cacheKey = `detail_${productId}`;
    const cachedResponse = getCachedData(cacheKey, CACHE_TTL_DETAIL);
    if (cachedResponse) {
      console.log(`[CACHE] Hit for detail: ${productId}`);
      return res.json(cachedResponse);
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
    const actualProductId = item.item_id || item.itemId || item.offerId || item.productId || item.id;

    // Main image mapping
    const mainImage = item.img || item.pic_url || item.picUrl || item.main_img || item.image || item.mainImage || item.thumb;

    // Image list mapping
    let imageList: string[] = [];
    if (item.item_images && Array.isArray(item.item_images)) {
      imageList = item.item_images;
    } else if (item.pc_detail_images && Array.isArray(item.pc_detail_images)) {
      imageList = item.pc_detail_images;
    } else if (item.imageList && Array.isArray(item.imageList)) {
      imageList = item.imageList;
    } else if (item.images && Array.isArray(item.images)) {
      imageList = item.images;
    } else if (mainImage) {
      imageList = [mainImage];
    }

    // Price mapping
    let price = parseFloat(item.price || item.minPrice || "0");
    if (item.price_info && item.price_info.price) {
      price = parseFloat(item.price_info.price);
    }

    let originalPrice = price * 1.2;
    if (item.price_info && item.price_info.original_price) {
      originalPrice = parseFloat(item.price_info.original_price);
    }

    // Seller mapping
    const sellerName = item.shop_info?.shop_name || item.supplierName || item.sellerName || item.companyName || item.shopName || "1688 Supplier";
    const sellerId = item.shop_info?.shop_id || item.supplierId || item.userId || item.sellerId || item.shopId || "unknown";
    const sellerRating = item.shop_info?.star_score || item.rating || 4.5;

    // Specifications from product_props
    const specs: Record<string, string> = {
      category: item.category_name || item.category || "N/A",
      weight: item.weight || "N/A",
      size: item.size || "N/A",
      material: item.material || "N/A",
      warranty: item.warranty || "No warranty",
    };

    if (item.product_props && Array.isArray(item.product_props)) {
      item.product_props.forEach((prop: any) => {
        if (prop.name && prop.value) {
          specs[prop.name] = prop.value;
        }
      });
    }

    const product = {
      id: String(actualProductId),
      name: item.title || item.subject || item.name || "Product",
      price: price,
      originalPrice: originalPrice,
      unit: item.offer_unit || item.unit || "piece",
      images: proxifyImageUrls(imageList),
      seller: {
        id: String(sellerId),
        name: sellerName,
        rating: sellerRating,
      },
      minOrder: item.quantity_begin || item.minOrder || 1,
      logistics: {
        deliveryDays: 15,
        shippingCost: 5,
      },
      description: item.description || item.title || item.subject,
      specifications: specs,
    };

    const result = {
      success: true,
      data: product,
    };

    setCachedData(cacheKey, result);
    res.json(result);
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
 * Proxy image from 1688 to avoid CORS issues
 *
 * Usage: GET /api/alibaba/image?url={encoded_image_url}
 */
export const proxyImage: RequestHandler = async (req, res) => {
  try {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      console.warn("[IMAGE] Missing URL in proxy request");
      return res.status(400).json({ error: "Image URL is required" });
    }

    // Decode URL if it's encoded
    let decodedUrl = imageUrl;
    try {
      decodedUrl = decodeURIComponent(imageUrl);
    } catch {
      decodedUrl = imageUrl;
    }

    console.log(`[IMAGE] Requesting proxy for: ${decodedUrl}`);

    // Validate it's a valid image URL
    if (!decodedUrl.startsWith("http")) {
      console.warn(`[IMAGE] Rejecting invalid proxy URL: ${decodedUrl}`);
      return res.status(400).json({ error: "Invalid image URL" });
    }

    console.log(`[IMAGE] Fetching from upstream: ${decodedUrl.substring(0, 100)}...`);

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const imageResponse = await fetch(decodedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Referer": "https://www.1688.com/",
          "Cache-Control": "no-cache"
        },
      });

      if (!imageResponse.ok) {
        console.error(`[IMAGE] Failed to fetch (${imageResponse.status}): ${imageResponse.statusText} from ${decodedUrl}`);
        return res.status(imageResponse.status).json({ error: "Failed to fetch image" });
      }

      // Set proper headers for image response
      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=604800"); // 1 week
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("X-Content-Type-Options", "nosniff");

      // Get buffer
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`[IMAGE] Successfully proxied ${buffer.length} bytes for: ${decodedUrl.substring(0, 50)}...`);
      res.send(buffer);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("[IMAGE] Fetch timed out for:", req.query.url);
      return res.status(504).json({ error: "Image fetch timed out" });
    }
    console.error("[IMAGE] Error:", error);
    res.status(500).json({
      error: "Failed to proxy image",
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

    const cacheKey = `top_products_${randomKeyword}`;
    const cachedResponse = getCachedData(cacheKey, 60 * 60 * 1000); // 1 hour cache for homepage
    // Temporarily disable cache hit to see logs
    /*
    if (cachedResponse) {
      console.log(`[CACHE] Hit for top products: ${randomKeyword}`);
      return res.json(cachedResponse);
    }
    */

    const response = await tmapiRequest("1688/en/search/items", {
      keyword: randomKeyword,
      page: 1,
      page_size: 20,
      sort: "default"
    });

    // Transform tmapi.top response to our format
    const products: AlibabaProduct[] = (response.data?.items || []).map(
      (item: any) => {
        // ID mapping
        const productId = item.item_id || item.itemId || item.offerId || item.productId || item.id;

        // Image mapping - search results usually have 'img' (single URL)
        let imageList: string[] = [];
        if (item.img) {
          imageList = [item.img];
        } else if (item.imageList && Array.isArray(item.imageList)) {
          imageList = item.imageList;
        } else if (item.picUrl || item.pic_url || item.image || item.mainImage) {
          imageList = [item.picUrl || item.pic_url || item.image || item.mainImage];
        }

        const proxiedImages = proxifyImageUrls(imageList);

        // Price mapping - search results often have 'price' or 'price_info.price'
        let price = parseFloat(item.price || item.minPrice || "0");
        if (item.price_info && item.price_info.price) {
          price = parseFloat(item.price_info.price);
        }

        let originalPrice = price * 1.2;
        if (item.price_info && item.price_info.original_price) {
          originalPrice = parseFloat(item.price_info.original_price);
        }

        // Seller mapping
        const sellerName = item.shop_info?.shop_name || item.supplierName || item.sellerName || item.companyName || "1688 Supplier";
        const sellerId = item.shop_info?.shop_id || item.supplierId || item.userId || item.sellerId || "unknown";

        return {
          id: String(productId),
          name: item.title || item.subject || item.name || "Product",
          price: price,
          originalPrice: originalPrice,
          unit: item.offer_unit || "piece",
          images: proxiedImages,
          seller: {
            id: String(sellerId),
            name: sellerName,
            rating: item.shop_info?.star_score || item.rating || 4.5,
          },
          minOrder: item.quantity_begin || item.minOrder || 1,
          logistics: {
            deliveryDays: 15,
            shippingCost: 5,
          },
        };
      },
    );

    const result = {
      success: true,
      data: products.slice(0, 20), // Ensure exactly 20 products
    };

    setCachedData(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({
      error: "Failed to fetch top products",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

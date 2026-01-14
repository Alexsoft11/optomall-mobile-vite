# 1688/Alibaba API Integration Guide

This project integrates with **1688/Alibaba** through **tmapi.top**, a simplified API wrapper for accessing Chinese wholesale products directly.

## Overview

The integration consists of:

1. **Server routes** (`server/routes/alibaba.ts`) - Backend API endpoints powered by tmapi.top
2. **React hook** (`client/hooks/useAlibaba.ts`) - Frontend hook for API calls
3. **Type-safe interfaces** - For consistent data handling

## Features

✅ **Search Products** - Find items by keyword with filters
✅ **Get Product Details** - Full product info with images, specifications
✅ **Estimate Shipping** - Calculate shipping costs and delivery time
✅ **Multi-currency Support** - Integrated with USD, CNY, UZS converters
✅ **Real-time Data** - Direct API calls to 1688/Alibaba

## Setup Instructions

### 1. Register with tmapi.top

To use this integration, you need to:

1. Visit [tmapi.top](https://tmapi.top)
2. Register for a free account
3. Get your **API Token** from the dashboard
4. Check out the [API Documentation](https://tmapi.top/docs)

### 2. Set Environment Variables

Add this to your `.env` file:

```bash
# tmapi.top Configuration for 1688 API
TMAPI_TOKEN=your_api_token_here
```

**Note:** tmapi.top offers a free tier with sufficient requests for development.

### 3. How It Works

The integration is already fully implemented with real API calls to tmapi.top:

1. **`server/routes/alibaba.ts`** - Contains actual API implementations:
   - `searchAlibabaProducts` - Search 1688 products
   - `getAlibabaProductDetail` - Get full product information
   - `estimateShipping` - Calculate shipping costs

2. **Data Transformation** - tmapi.top responses are automatically converted to a unified format:

```typescript
interface AlibabaProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  unit: string;
  images: string[];
  seller: { id: string; name: string; rating: number };
  minOrder: number;
  logistics?: { deliveryDays: number; shippingCost: number };
}
```

## API Endpoints

### 1. Search 1688 Products

**Endpoint:** `POST /api/alibaba/search`

**Request:**

```json
{
  "keyword": "wireless earbuds",
  "pageNo": 1,
  "pageSize": 20,
  "sortBy": "price_asc"
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "627234567",
      "name": "Premium Wireless Earbuds with Noise Cancellation",
      "price": 8.5,
      "originalPrice": 12.99,
      "unit": "piece",
      "images": ["https://img.alicdn.com/...", "https://img.alicdn.com/..."],
      "seller": {
        "id": "b2b1234567",
        "name": "Electronics Supplier Ltd.",
        "rating": 4.8
      },
      "minOrder": 1,
      "logistics": {
        "deliveryDays": 15,
        "shippingCost": 5
      }
    }
  ],
  "total": 1234,
  "pageNo": 1,
  "pageSize": 20
}
```

### 2. Get Product Details from 1688

**Endpoint:** `GET /api/alibaba/product/:productId`

**Example:**

```bash
GET /api/alibaba/product/627234567
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "627234567",
    "name": "Premium Wireless Earbuds with Noise Cancellation",
    "price": 8.5,
    "originalPrice": 12.99,
    "unit": "piece",
    "images": [
      "https://img.alicdn.com/image1.jpg",
      "https://img.alicdn.com/image2.jpg"
    ],
    "seller": {
      "id": "b2b1234567",
      "name": "Electronics Supplier Ltd.",
      "rating": 4.8
    },
    "minOrder": 1,
    "description": "High-quality wireless earbuds with active noise cancellation...",
    "specifications": {
      "connectivity": "Bluetooth 5.0",
      "batteryLife": "8 hours (24 hours with case)",
      "waterResistance": "IPX5",
      "material": "Plastic and silicone",
      "warranty": "12 months"
    }
  }
}
```

### 3. Estimate Shipping Cost

**Endpoint:** `POST /api/alibaba/shipping-estimate`

**Request:**

```json
{
  "productId": "627234567",
  "quantity": 100,
  "destination": "US"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "productId": "627234567",
    "quantity": 100,
    "destination": "US",
    "shippingCost": 250.5,
    "currency": "USD",
    "estimatedDelivery": 20,
    "details": {
      "baseCost": 50,
      "perKgCost": 2,
      "totalWeight": "50.00kg",
      "shippingMethod": "DHL/FedEx/EMS"
    }
  }
}
```

## Frontend Usage

### Using the Hook

```typescript
import { useAlibaba } from '@/hooks/useAlibaba';

function MyComponent() {
  const { searchProducts, loading, error } = useAlibaba();

  const handleSearch = async () => {
    const results = await searchProducts({
      keyword: 'electronics',
      pageSize: 20,
    });
    console.log(results);
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## Key Features

✅ **Search Products** - Find items by keyword  
✅ **Get Details** - Fetch complete product information  
✅ **Estimate Shipping** - Calculate shipping costs and delivery time  
✅ **Multi-currency** - Integrated with currency converter  
✅ **Type-safe** - Full TypeScript support

## Best Practices

### 1. API Token Security

```bash
# NEVER commit your TMAPI_TOKEN to git
echo "TMAPI_TOKEN=your_token" >> .env
# Add .env to .gitignore
```

### 2. Error Handling

The implementation includes fallback mechanisms:

- If the API call fails, shipping estimates use default calculations
- Product searches gracefully handle API errors

### 3. Rate Limiting

tmapi.top has built-in rate limiting. For production:

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});

app.post("/api/alibaba/search", limiter, searchAlibabaProducts);
```

### 4. Caching

Cache popular searches to reduce API calls:

```typescript
const searchCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const searchAlibabaProducts: RequestHandler = async (req, res) => {
  const cacheKey = JSON.stringify(req.body);

  if (searchCache.has(cacheKey)) {
    return res.json(searchCache.get(cacheKey));
  }

  // ... perform search ...
  searchCache.set(cacheKey, result);
};
```

### 5. Data Validation

Always validate incoming data:

```typescript
if (!keyword || keyword.length < 2) {
  return res
    .status(400)
    .json({ error: "Keyword must be at least 2 characters" });
}
```

## Troubleshooting

### "TMAPI_TOKEN is not set"

**Solution:** Make sure your `.env` file contains:

```bash
TMAPI_TOKEN=your_actual_token_from_tmapi.top
```

### No Search Results

1. Check that the keyword is correct
2. Try searching on [tmapi.top](https://tmapi.top) directly with the same keyword
3. Verify your API token is still valid
4. Check the server logs for detailed error messages

### Slow API Responses

- tmapi.top may take 2-3 seconds for complex searches
- Implement client-side loading indicators
- Use caching for frequent searches
- Consider pagination to limit results

### Product Images Not Loading

- Use image URLs directly from tmapi.top (they're already optimized)
- Implement lazy loading for better performance
- Add fallback placeholder images

### Shipping Cost Estimation Issues

- Verify the productId is correct
- Check the destination country code format (US, EU, UZ, etc.)
- Quantity must be a positive number

## Advanced Features

### Bulk Product Sync

```typescript
// Sync multiple products at once
async function bulkSyncProducts(productIds: string[]) {
  const results = await Promise.all(
    productIds.map((id) => getAlibabaProductDetail(id)),
  );
  return results;
}
```

### Search with Multiple Filters

```typescript
const searchParams = {
  keyword: "electronics",
  pageNo: 1,
  pageSize: 50,
  sortBy: "price_asc",
  minPrice: 5,
  maxPrice: 100,
};
```

## Next Steps

1. ✅ **API Integration** - Already set up with tmapi.top
2. **Database Storage** - Store synced products in Supabase
3. **Inventory Management** - Track stock levels
4. **Order Processing** - Automate order creation with suppliers
5. **Notifications** - Notify users of price changes or new products

## References

- [tmapi.top Documentation](https://tmapi.top/docs)
- [1688 API Guide](https://tmapi.top/docs/ali)
- [Product Search API](https://tmapi.top/docs/ali/item/search-items)
- [Item Details API](https://tmapi.top/docs/ali/item-detail/get-item-detail-by-id)

## Support

For integration issues:

1. Verify TMAPI_TOKEN is set and valid
2. Check tmapi.top API status page
3. Review server logs: `npm run dev`
4. Test API directly: `curl -X POST http://localhost:8080/api/alibaba/search -H "Content-Type: application/json" -d '{"keyword":"electronics"}'`
5. Visit tmapi.top support for API-specific questions

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
      "price": 8.50,
      "originalPrice": 12.99,
      "unit": "piece",
      "images": [
        "https://img.alicdn.com/...",
        "https://img.alicdn.com/..."
      ],
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

### 2. Get Product Details

**Endpoint:** `GET /api/alibaba/product/:productId`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ali_1",
    "name": "Wireless Earbuds Pro",
    "price": 15.99,
    "description": "High-quality wireless earbuds...",
    "specifications": {
      "connectivity": "Bluetooth 5.0",
      "batteryLife": "8 hours"
    }
  }
}
```

### 3. Estimate Shipping

**Endpoint:** `POST /api/alibaba/shipping-estimate`

**Request:**
```json
{
  "productId": "ali_1",
  "quantity": 100,
  "destination": "US"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shippingCost": 150,
    "currency": "USD",
    "estimatedDelivery": 20,
    "details": {
      "handlingFee": 50,
      "perUnitCost": 0.5,
      "totalWeight": "5kg"
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

### 1. Rate Limiting
```typescript
// Add rate limiting to prevent API abuse
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.post('/api/alibaba/search', limiter, searchAlibabaProducts);
```

### 2. Caching
```typescript
// Cache popular searches
const searchCache = new Map();

export const searchAlibabaProducts = async (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  
  if (searchCache.has(cacheKey)) {
    return res.json(searchCache.get(cacheKey));
  }
  
  // ... perform search ...
  searchCache.set(cacheKey, result);
};
```

### 3. Error Handling
Always wrap API calls in try-catch and return meaningful error messages to the client.

### 4. Data Transformation
Ensure incoming data is transformed to match your app's Product interface:

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

## Troubleshooting

### API Returns 401 Unauthorized
- Check your API credentials in `.env`
- Verify the credentials haven't expired
- Ensure you have API access enabled

### Slow Search Results
- Implement caching strategy
- Add pagination to limit results per request
- Consider using filters (minPrice, maxPrice) to narrow results

### Missing Product Images
- Alibaba returns image URLs that may need transformation
- Cache images locally or use a CDN
- Implement fallback placeholder images

## Next Steps

1. **Implement actual API calls** - Replace mock data with real Alibaba API
2. **Add product sync** - Periodically sync products to local database
3. **Implement inventory management** - Track stock levels
4. **Add supplier management** - Manage multiple suppliers
5. **Implement order fulfillment** - Automate order placement with suppliers

## References

- [Alibaba Open Platform](https://open.alibaba.com/)
- [1688 API Documentation](https://openapi.1688.com/docs)
- [Node.js API Best Practices](https://nodejs.org/en/docs/guides/)

## Support

For issues with the integration:
1. Check the troubleshooting section
2. Review the mock API responses in `server/routes/alibaba.ts`
3. Verify environment variables are set correctly
4. Check browser console for frontend errors

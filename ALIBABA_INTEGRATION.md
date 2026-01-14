# Alibaba/1688 API Integration Guide

This project includes a basic setup for integrating with Alibaba and 1688 APIs to fetch products directly from China. This guide explains how to set up and use the integration.

## Overview

The integration consists of:
1. **Server routes** (`server/routes/alibaba.ts`) - Backend API endpoints
2. **React hook** (`client/hooks/useAlibaba.ts`) - Frontend hook for API calls
3. **Shared types** - For type-safe data handling

## Setup Instructions

### 1. Get API Credentials

To use the Alibaba API, you need to:

1. Register as a developer on [Alibaba Developer Center](https://developer.alibabacloud.com/)
2. Create an application to get your API credentials
3. Apply for API access to the product search service
4. Get your `API_KEY` and `API_SECRET`

### 2. Set Environment Variables

Add these to your `.env` file:

```bash
# Alibaba API Configuration
ALIBABA_API_KEY=your_api_key_here
ALIBABA_API_SECRET=your_api_secret_here
ALIBABA_API_ENDPOINT=https://api.alibaba.com/v1
```

### 3. Implement Actual API Calls

The current implementation has mock responses. To use real data:

1. Open `server/routes/alibaba.ts`
2. Replace the mock data in each function with actual API calls
3. Use a library like `axios` or `node-fetch` to make HTTP requests

Example implementation pattern:

```typescript
export const searchAlibabaProducts: RequestHandler = async (req, res) => {
  try {
    const { keyword, pageNo = 1, pageSize = 20 } = req.body;

    // Make actual API call
    const response = await fetch(`${process.env.ALIBABA_API_ENDPOINT}/products/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ALIBABA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keywords: keyword,
        pageNumber: pageNo,
        pageSize: pageSize,
      })
    });

    const data = await response.json();
    // Transform data to match AlibabaProduct interface
    res.json({ success: true, data: data.products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search' });
  }
};
```

## API Endpoints

### 1. Search Products

**Endpoint:** `POST /api/alibaba/search`

**Request:**
```json
{
  "keyword": "wireless earbuds",
  "pageNo": 1,
  "pageSize": 20,
  "sortBy": "price_asc",
  "minPrice": 5,
  "maxPrice": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ali_1",
      "name": "Wireless Earbuds Pro",
      "price": 15.99,
      "originalPrice": 24.99,
      "unit": "piece",
      "images": ["url1", "url2"],
      "seller": {
        "id": "seller_1",
        "name": "Electronics Store",
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

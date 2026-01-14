# tmapi.top API Setup Guide

## 快速设置指南 (Quick Setup)

### Step 1: Register at tmapi.top

1. Go to https://tmapi.top
2. Click "Register" (注册)
3. Create your account with:
   - Email/Phone
   - Password
   - Verification code

### Step 2: Get Your API Token

1. After registration, log in to your dashboard
2. Go to "API Keys" or "API管理" section
3. Copy your **API Token** (令牌)
4. Keep this token safe - never share it publicly

### Step 3: Configure Your App

Add the token to your `.env` file:

```bash
# .env
TMAPI_TOKEN=your_api_token_here
```

**Important:** Never commit `.env` to git!

### Step 4: Test the Integration

1. Start the dev server:

```bash
npm run dev
```

2. Test the search endpoint:

```bash
curl -X POST http://localhost:8080/api/alibaba/search \
  -H "Content-Type: application/json" \
  -d '{"keyword":"wireless earbuds","pageNo":1,"pageSize":20}'
```

3. You should get back a JSON response with products from 1688

### Step 5: Use in Your App

The integration is already ready! Just use the `useAlibaba()` hook:

```typescript
import { useAlibaba } from '@/hooks/useAlibaba';

function MyComponent() {
  const { searchProducts, loading, error } = useAlibaba();

  const handleSearch = async () => {
    const results = await searchProducts({
      keyword: 'electronics',
      pageNo: 1,
      pageSize: 20,
    });
    console.log(results);
  };

  return (
    <button onClick={handleSearch} disabled={loading}>
      Search
    </button>
  );
}
```

## API Endpoints Available

### 1. Search Products

```bash
POST /api/alibaba/search
Content-Type: application/json

{
  "keyword": "wireless earbuds",
  "pageNo": 1,
  "pageSize": 20,
  "sortBy": "price_asc"
}
```

### 2. Get Product Details

```bash
GET /api/alibaba/product/{productId}
```

### 3. Estimate Shipping

```bash
POST /api/alibaba/shipping-estimate
Content-Type: application/json

{
  "productId": "627234567",
  "quantity": 100,
  "destination": "US"
}
```

## Common Search Filters

```json
{
  "keyword": "search term",
  "pageNo": 1,
  "pageSize": 20,
  "sortBy": "price_asc" // or "price_desc", "relevance"
}
```

**Supported Destinations for Shipping:**

- `US` - United States
- `EU` - European Union
- `UZ` - Uzbekistan
- Other country codes are supported

## Pricing Tiers

tmapi.top offers:

- **Free Plan**: Limited requests per day
- **Pro Plan**: Higher request limits
- **Enterprise**: Custom solutions

Check https://tmapi.top for current pricing.

## API Rate Limits

- Free tier: ~100-200 requests per day
- For production use, upgrade to a paid plan
- Responses cached by tmapi.top to reduce quota usage

## Troubleshooting

### "TMAPI_TOKEN is not set" Error

```bash
# Make sure .env file has:
TMAPI_TOKEN=your_token_here

# And your app is restarted
npm run dev
```

### "401 Unauthorized" Error

- Check your token is copied correctly (no extra spaces)
- Verify the token hasn't expired
- Try regenerating a new token in tmapi.top dashboard

### No Results for Common Products

- The API searches for wholesale products (B2B)
- Try less specific keywords
- Check if the product exists on 1688.com directly

### Slow Responses

- First request may be slower (cold start)
- Use caching to speed up repeated searches
- Reduce pageSize if searching slow

## Features Implemented

✅ **Product Search** - Search 1688 by keyword  
✅ **Product Details** - Get full product information  
✅ **Shipping Estimation** - Calculate delivery costs  
✅ **Multi-currency** - USD, CNY, UZS support  
✅ **Error Handling** - Graceful fallbacks  
✅ **Type-safe** - Full TypeScript support

## File Structure

```
server/
  routes/
    alibaba.ts          ← Main API implementation
client/
  hooks/
    useAlibaba.ts       ← React hook for API calls
ALIBABA_INTEGRATION.md  ← Detailed documentation
TMAPI_SETUP.md          ← This file
```

## Next Steps

1. Register and get your token ✅
2. Add TMAPI_TOKEN to .env ✅
3. Test the API endpoints
4. Integrate products into your app
5. Add product syncing to database

## Support & Documentation

- **tmapi.top**: https://tmapi.top/docs
- **1688 API**: https://tmapi.top/docs/ali
- **Project Docs**: See `ALIBABA_INTEGRATION.md`

## Security Reminders

🔒 **Never:**

- Commit your API token to git
- Share your token publicly
- Use the same token across multiple apps
- Log your token in console

✅ **Always:**

- Store token in `.env` file
- Use environment variables
- Regenerate token if compromised
- Keep dependencies updated

---

**Happy selling from China! 🚀**

# 🛍️ ChinaMall - E-Commerce from China

A **modern e-commerce platform** for buying wholesale products directly from 1688/Alibaba, with real-time integration, multi-currency support, and advanced features.

## ✨ Features

✅ **Real 1688 API Integration** - Connect directly to Chinese suppliers via tmapi.top  
✅ **Multi-Currency** - USD, CNY, UZS with real-time conversion  
✅ **Advanced Marketplace** - Search, filter, sort by category, price, rating  
✅ **Product Details** - Full information, customer reviews, seller ratings  
✅ **Shopping Cart & Favorites** - Save items for later  
✅ **Shipping Estimation** - Calculate delivery costs and time  
✅ **Responsive Design** - Mobile-first, works on all devices  
✅ **Dark Mode** - Built-in dark theme support  

---

## 🚀 Quick Start

### 1. Get API Token (2 minutes)
```bash
# Visit https://tmapi.top
# Register → Get API Token → Copy it
```

### 2. Configure
```bash
# Add to .env file:
TMAPI_TOKEN=your_token_here
```

### 3. Run
```bash
npm run dev
```

**That's it! 🎉**

---

## 📚 Documentation

| Document | Purpose | Time |
|----------|---------|------|
| **[TMAPI_SETUP.md](./TMAPI_SETUP.md)** | Quick setup guide | 5 min |
| **[ALIBABA_INTEGRATION.md](./ALIBABA_INTEGRATION.md)** | Full API documentation | 15 min |
| **[TEST_INTEGRATION.md](./TEST_INTEGRATION.md)** | Testing procedures | 10 min |
| **[QUICK_TEST_CHECKLIST.md](./QUICK_TEST_CHECKLIST.md)** | Quick verification | 2 min |
| **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** | Current status & structure | 5 min |
| **[PROJECT_UPDATES.md](./PROJECT_UPDATES.md)** | What changed | 10 min |

**➡️ Start with [TMAPI_SETUP.md](./TMAPI_SETUP.md)**

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router 6** - Navigation (SPA mode)
- **TypeScript** - Type safety
- **TailwindCSS 3** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons

### Backend
- **Express.js** - API server
- **Node.js** - Runtime
- **TypeScript** - Type safety

### External
- **tmapi.top** - 1688/Alibaba API
- **Supabase** - Database & Auth
- **React Query** - Data fetching

---

## 📁 Project Structure

```
client/                 # React frontend
├── pages/             # Route pages
│   ├── Index.tsx      # Home page
│   ├── Marketplace.tsx # Product catalog with filters
│   ├── ProductDetail.tsx # Product details with reviews
│   └── ...
├── components/        # Reusable UI components
├── context/           # State management
│   ├── ShopContext.tsx    # Cart & favorites
│   └── CurrencyContext.tsx # Multi-currency
├── hooks/             # Custom React hooks
│   ├── useAlibaba.ts  # 1688 API calls
│   └── ...
└── data/             # Static data
    └── products.ts   # 20 demo products

server/               # Express backend
├── routes/
│   └── alibaba.ts    # 1688 API integration
└── index.ts          # Server setup

shared/              # Shared types
└── api.ts

Documentation/
├── TMAPI_SETUP.md
├── ALIBABA_INTEGRATION.md
├── TEST_INTEGRATION.md
├── QUICK_TEST_CHECKLIST.md
├── PROJECT_STATUS.md
└── PROJECT_UPDATES.md
```

---

## 🔌 API Endpoints

### Search Products
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

### Get Product Details
```bash
GET /api/alibaba/product/{productId}
```

### Estimate Shipping
```bash
POST /api/alibaba/shipping-estimate
Content-Type: application/json

{
  "productId": "627234567",
  "quantity": 100,
  "destination": "US"
}
```

---

## 💱 Supported Currencies

| Currency | Symbol | Use |
|----------|--------|-----|
| **USD** | $ | Default, international |
| **CNY** | ¥ | Chinese Yuan |
| **UZS** | сўм | Uzbek Som |

Change currency in the header - all prices update automatically!

---

## 📦 Product Categories

- **⚡ Electronics** - Earbuds, chargers, smart watches, accessories
- **👕 Clothing** - T-shirts, jackets, leggings, hats, socks
- **🍽️ Dishes** - Plates, utensils, storage, cookware
- **⚽ Sports** - Yoga mats, dumbbells, resistance bands, jump ropes

---

## 🧪 Testing

### Quick Test (2 minutes)
```bash
# Run this after adding TMAPI_TOKEN
npm run dev

# Open in browser:
# http://localhost:8080

# Should see:
# ✅ Homepage with categories
# ✅ Marketplace with products
# ✅ Currency selector in header
# ✅ No console errors
```

### Full Test Suite
See [TEST_INTEGRATION.md](./TEST_INTEGRATION.md) for complete testing procedures.

---

## 🚀 Deployment

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Vercel
```bash
# Push to GitHub
# Vercel auto-deploys
```

### Environment Variables
Set these in your hosting platform:
```
TMAPI_TOKEN=your_token
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 📝 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build
npm run typecheck    # Check TypeScript types
npm run test         # Run tests
npm run format.fix   # Format code with Prettier
```

---

## 🔐 Security

✅ **API Token in .env** - Never exposed  
✅ **Backend API calls** - No direct client-side API access  
✅ **Input validation** - All parameters validated  
✅ **Error handling** - Safe error messages  

---

## 🤝 Support

### Documentation
- Quick Start: [TMAPI_SETUP.md](./TMAPI_SETUP.md)
- Full Docs: [ALIBABA_INTEGRATION.md](./ALIBABA_INTEGRATION.md)
- Testing: [TEST_INTEGRATION.md](./TEST_INTEGRATION.md)

### External Resources
- **tmapi.top**: https://tmapi.top
- **API Docs**: https://tmapi.top/docs
- **1688 API Guide**: https://tmapi.top/docs/ali

---

## 🎯 Roadmap

### Phase 1: Launch ✅
- [x] 1688 API integration
- [x] Product catalog
- [x] Multi-currency support
- [x] Shopping cart & favorites
- [x] Complete documentation

### Phase 2: Enhance
- [ ] Database product sync
- [ ] User authentication
- [ ] Order management
- [ ] Admin dashboard

### Phase 3: Scale
- [ ] Payment processing
- [ ] Supplier integration
- [ ] Inventory management
- [ ] Advanced analytics

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

Built with:
- **tmapi.top** - 1688/Alibaba API
- **Supabase** - Backend & Auth
- **TailwindCSS** - Styling
- **Radix UI** - Components

---

## 📞 Contact

Questions or issues?
1. Check the [documentation](./TMAPI_SETUP.md)
2. Review [troubleshooting guide](./ALIBABA_INTEGRATION.md#troubleshooting)
3. Check [API status](https://tmapi.top)

---

## ⭐ Show Your Support

If you find this project useful, please give it a star! ⭐

**Made with ❤️ for Global Traders**

---

## 🚀 Ready to Get Started?

**➡️ [Start with TMAPI_SETUP.md](./TMAPI_SETUP.md)**

1. Get API token from tmapi.top (2 min)
2. Add to .env file (1 min)
3. Run `npm run dev` (1 min)
4. Start selling! 🎉

export interface Product {
  id: number;
  name: string;
  price: number; // USD price
  category: "electronics" | "clothing" | "dishes" | "sports" | "other";
  description: string;
  images: string[];
  rating?: number;
  reviews?: number;
  seller?: string;
}

export const products: Product[] = [
  // Electronics
  {
    id: 1,
    name: "TWS Bluetooth Earbuds Pro",
    price: 15.99,
    category: "electronics",
    description:
      "Wireless Bluetooth 5.0 earbuds with noise cancellation, 8H battery life.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.5,
    reviews: 324,
    seller: "TechZone Store",
  },
  {
    id: 2,
    name: "USB-C Fast Charger 65W",
    price: 12.5,
    category: "electronics",
    description: "Universal USB-C charger, supports PD fast charging for all devices.",
    images: [
      "https://images.unsplash.com/photo-1591632282515-31148020b9c0?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviews: 567,
    seller: "PowerGear Store",
  },
  {
    id: 3,
    name: "LED Ring Light with Tripod",
    price: 18.75,
    category: "electronics",
    description: "10 inch ring light with adjustable stand for streaming and photography.",
    images: [
      "https://images.unsplash.com/photo-1609042235577-7a28ee20ce76?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.3,
    reviews: 201,
    seller: "Creator Studio",
  },
  {
    id: 4,
    name: "Smart Watch Sport Band",
    price: 9.99,
    category: "electronics",
    description: "Colorful silicone sport bands compatible with most smartwatches.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.6,
    reviews: 445,
    seller: "WatchGear",
  },
  {
    id: 5,
    name: "Portable Phone Stand",
    price: 6.99,
    category: "electronics",
    description: "Aluminum foldable phone stand for desk, compatible with all phones.",
    images: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviews: 892,
    seller: "SmartGear",
  },

  // Clothing
  {
    id: 6,
    name: "Cotton T-Shirt Pack (5pcs)",
    price: 14.99,
    category: "clothing",
    description:
      "Comfortable 100% cotton t-shirts, classic colors, unisex design.",
    images: [
      "https://images.unsplash.com/photo-1517466895453-1a52ffa2b380?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.4,
    reviews: 678,
    seller: "Fashion Hub",
  },
  {
    id: 7,
    name: "Windproof Jacket",
    price: 22.5,
    category: "clothing",
    description: "Lightweight waterproof jacket, perfect for outdoor activities.",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16ebc5?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.2,
    reviews: 334,
    seller: "OutdoorWear",
  },
  {
    id: 8,
    name: "Sports Leggings",
    price: 11.99,
    category: "clothing",
    description: "High-waist yoga leggings with pockets, stretchy fabric.",
    images: [
      "https://images.unsplash.com/photo-1535729385551-fcc49b8a5736?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.6,
    reviews: 523,
    seller: "Yoga World",
  },
  {
    id: 9,
    name: "Winter Beanie Hats",
    price: 7.99,
    category: "clothing",
    description:
      "Warm knitted beanies, soft fleece lining, one size fits all.",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.5,
    reviews: 456,
    seller: "Winter Store",
  },
  {
    id: 10,
    name: "Socks Bundle (12 pairs)",
    price: 8.49,
    category: "clothing",
    description: "Assorted cotton socks, comfortable and durable.",
    images: [
      "https://images.unsplash.com/photo-1556821840-a63f5b2f4c98?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.3,
    reviews: 289,
    seller: "Comfort Socks",
  },

  // Dishes
  {
    id: 11,
    name: "Ceramic Dinner Plate Set (6)",
    price: 16.99,
    category: "dishes",
    description:
      "Modern ceramic plates, microwave and dishwasher safe, multiple colors.",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviews: 612,
    seller: "Home Kitchen",
  },
  {
    id: 12,
    name: "Stainless Steel Utensil Set",
    price: 9.99,
    category: "dishes",
    description: "24 piece cutlery set with storage case, kitchen essentials.",
    images: [
      "https://images.unsplash.com/photo-1610701611669-0cd873602b18?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.6,
    reviews: 445,
    seller: "Kitchen Pro",
  },
  {
    id: 13,
    name: "Glass Food Storage Containers",
    price: 13.5,
    category: "dishes",
    description:
      "5 piece glass containers with lids, freezer and microwave safe.",
    images: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviews: 567,
    seller: "Storage Solutions",
  },
  {
    id: 14,
    name: "Non-stick Cookware Set",
    price: 24.99,
    category: "dishes",
    description: "8-piece non-stick pan and pot set with glass lids.",
    images: [
      "https://images.unsplash.com/photo-1578500494198-246f612d03b3?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.5,
    reviews: 334,
    seller: "Chef's Choice",
  },
  {
    id: 15,
    name: "Bamboo Cutting Board Set",
    price: 10.99,
    category: "dishes",
    description: "3 piece bamboo cutting boards, eco-friendly and durable.",
    images: [
      "https://images.unsplash.com/photo-1577720643272-265dfe91e4d6?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.4,
    reviews: 298,
    seller: "EcoHome",
  },

  // Sports
  {
    id: 16,
    name: "Yoga Mat Non-slip",
    price: 10.5,
    category: "sports",
    description: "6mm thick yoga mat with carrying strap, non-slip surface.",
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.6,
    reviews: 789,
    seller: "Fitness Gear",
  },
  {
    id: 17,
    name: "Adjustable Dumbbells Set",
    price: 35.99,
    category: "sports",
    description: "Adjustable dumbbells 5-25 lbs, compact home gym equipment.",
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviews: 456,
    seller: "Gym Pro",
  },
  {
    id: 18,
    name: "Resistance Bands Set",
    price: 12.99,
    category: "sports",
    description: "5 resistance bands with different strengths and carrying case.",
    images: [
      "https://images.unsplash.com/photo-1521395633066-841557a0ec02?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.5,
    reviews: 523,
    seller: "Training Hub",
  },
  {
    id: 19,
    name: "Jump Rope Fitness",
    price: 7.49,
    category: "sports",
    description: "Speed jumping rope with counter, adjustable length.",
    images: [
      "https://images.unsplash.com/photo-1566241440984-413f63602a7b?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.4,
    reviews: 345,
    seller: "Cardio Zone",
  },
  {
    id: 20,
    name: "Foam Roller Massage",
    price: 11.99,
    category: "sports",
    description: "30cm foam roller for muscle recovery and massage.",
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviews: 612,
    seller: "Recovery Pro",
  },
];

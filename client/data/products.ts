export const products = [
  {
    id: 1,
    name: "Orbit Chair",
    price: 249.0,
    description: "A lightweight, sculptural chair with orbital curves and soft matte finish.",
    images: [
      "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=800",
    ],
  },
  {
    id: 2,
    name: "Halo Lamp",
    price: 129.0,
    description: "Soft ambient lamp with halo ring — perfect for modern interiors.",
    images: ["https://images.unsplash.com/photo-1549187774-b4e9f0447ee7?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: 3,
    name: "Nebula Sofa",
    price: 899.0,
    description: "Modular sofa with plush seating and hi-tech fabric.",
    images: ["https://images.unsplash.com/photo-1616628181073-0a3b6b0a6a5f?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: 4,
    name: "Prism Table",
    price: 459.0,
    description: "Geometric coffee table with glass and metal accents.",
    images: ["https://images.unsplash.com/photo-1582582494703-3f49f1f3b70d?auto=format&fit=crop&w=800&q=80"],
  },
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: 5 + i,
    name: ["Aero Chair", "Flux Lamp", "Mono Sofa", "Prism Table"][i % 4] + " " + (i + 1),
    price: Math.round((120 + i * 37) * 10) / 10,
    description: "Mock product for gallery — elegant, minimal, and hi‑tech.",
    images: [
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=60",
    ],
  }))
].flat();

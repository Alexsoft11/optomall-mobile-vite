export interface CategoryDefinition {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
}

export const CATEGORY_CATALOG: CategoryDefinition[] = [
  { id: "electronics", label: "Electronics", icon: "⚡", keywords: ["electronics", "gadgets", "phone", "charger", "earbuds", "smart watch"] },
  { id: "clothing", label: "Clothing", icon: "👕", keywords: ["clothing", "fashion", "shirt", "jacket", "leggings", "hoodie"] },
  { id: "dishes", label: "Dishes", icon: "🍽️", keywords: ["dishes", "kitchen", "cookware", "plates", "utensils", "storage"] },
  { id: "sports", label: "Sports", icon: "⚽", keywords: ["sports", "fitness", "yoga", "dumbbell", "bands", "rope"] },
  { id: "home", label: "Home", icon: "🏠", keywords: ["home", "decor", "storage", "organizer", "cleaning", "furniture"] },
  { id: "beauty", label: "Beauty", icon: "💄", keywords: ["beauty", "skincare", "makeup", "cosmetic", "hair", "grooming"] },
  { id: "toys", label: "Toys", icon: "🧸", keywords: ["toys", "kids", "children", "educational", "game", "play"] },
  { id: "automotive", label: "Automotive", icon: "🚗", keywords: ["automotive", "car", "vehicle", "auto", "garage", "detailing"] },
  { id: "tools", label: "Tools", icon: "🛠️", keywords: ["tools", "hardware", "drill", "repair", "industrial", "workshop"] },
  { id: "stationery", label: "Stationery", icon: "📝", keywords: ["stationery", "office", "paper", "pen", "notebook", "school"] },
  { id: "baby", label: "Baby", icon: "👶", keywords: ["baby", "infant", "nursery", "diaper", "feeding", "stroller"] },
  { id: "pet", label: "Pet", icon: "🐾", keywords: ["pet", "dog", "cat", "animal", "grooming", "feeding"] },
];

const CATEGORY_MAP = new Map(CATEGORY_CATALOG.map((category) => [category.id, category]));

export function normalizeCategory(category?: string | null): string {
  if (!category) return "other";
  const normalized = category.toLowerCase().trim();
  if (CATEGORY_MAP.has(normalized)) return normalized;

  const matched = CATEGORY_CATALOG.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return matched?.id || "other";
}

export function getCategoryKeywords(category?: string | null): string[] {
  const normalized = normalizeCategory(category);
  const match = CATEGORY_MAP.get(normalized);
  return match ? match.keywords : [normalized || "popular"];
}

export function inferCategoryFromText(text?: string | null): string {
  const normalized = (text || "").toLowerCase();
  if (!normalized) return "other";

  const matched = CATEGORY_CATALOG.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return matched?.id || "other";
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildCategoryGradient(categoryId: string, variant: number) {
  const hash = hashSeed(`${categoryId}-${variant}`);
  const colors = [
    `hsl(${hash % 360} 85% 58%)`,
    `hsl(${(hash + 45) % 360} 80% 48%)`,
    `hsl(${(hash + 90) % 360} 70% 36%)`,
  ];

  return colors;
}

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function buildFallbackImages(category: string, seed: string, count = 3): string[] {
  const normalized = normalizeCategory(category);
  const categoryData = CATEGORY_MAP.get(normalized);
  const label = categoryData?.label || "Product";
  const icon = categoryData?.icon || "🛍️";

  return Array.from({ length: Math.max(1, count) }, (_, index) => {
    const [start, middle, end] = buildCategoryGradient(`${normalized}-${seed}`, index);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <defs>
          <linearGradient id="bg-${index}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${start}" />
            <stop offset="55%" stop-color="${middle}" />
            <stop offset="100%" stop-color="${end}" />
          </linearGradient>
          <radialGradient id="glow-${index}" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.35)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect width="800" height="800" fill="url(#bg-${index})" rx="48" />
        <circle cx="650" cy="160" r="170" fill="url(#glow-${index})" />
        <circle cx="150" cy="650" r="180" fill="rgba(255,255,255,0.08)" />
        <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="120">${icon}</text>
        <text x="50%" y="58%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="42" fill="white">${label}</text>
        <text x="50%" y="65%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.92)">Product preview</text>
      </svg>
    `;
    return svgToDataUri(svg.replace(/\s+/g, " ").trim());
  });
}

export const imageMap: Record<string, string[]> = {
  phone: [
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
  ],
  laptop: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853" 
  ],
  fragrance: [
    "https://images.unsplash.com/photo-1594035910387-fea47ac5a6c3",
    "https://images.unsplash.com/photo-1541643600914-78b084683601"
  ],
  beauty: [
    "https://images.unsplash.com/photo-1556228720-195a672e8a03",
    "https://images.unsplash.com/photo-1617897903246-719242758050"
  ],
  furniture: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
  ],
  fitness: [
    "https://images.unsplash.com/photo-1558611848-73f7eb4001a1"
  ],
  design: [
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70"
  ],
  s25ultra: [
    "file:///Users/pratikrajendrashinde/.gemini/antigravity/brain/5aecaa31-6970-4214-8554-3320c42179c9/s25_ultra_thumb_1775401236464.png"
  ],
  oppof19: [
    "file:///Users/pratikrajendrashinde/.gemini/antigravity/brain/5aecaa31-6970-4214-8554-3320c42179c9/oppo_f19_thumb_1775401323263.png"
  ]
};

// Map specific user-facing keywords to a canonical category above
export const keywordCategoryMap: Record<string, string> = {
  // Phones
  "iphone": "phone",
  "samsung": "phone",
  "smartphone": "phone",
  "mobile": "phone",
  "phone": "phone",
  "apple": "phone", 
  "samsung s25 ultra 5g": "s25ultra", 
  "s25 ultra": "s25ultra",
  "oppo f19": "oppof19",
  "oppo": "oppof19",  // Laptops
  "macbook": "laptop",
  "laptop": "laptop",
  "hp": "laptop",
  "dell": "laptop",
  "infinix": "laptop",
  "inbook": "laptop",
  "surface": "laptop",

  // Fragrance
  "perfume": "fragrance",
  "scent": "fragrance",
  "fragrance": "fragrance",
  "cologne": "fragrance",

  // Beauty / Skincare
  "skincare": "beauty",
  "serum": "beauty",
  "beauty": "beauty",
  "cream": "beauty",
  "lotion": "beauty",
  "cleanser": "beauty",
  "cosmetics": "beauty",

  // Fitness
  "fitness": "fitness",
  "workout": "fitness",
  "gym": "fitness",
  "yoga": "fitness",
  "exercise": "fitness",

  // Design
  "design": "design",
  "ui": "design",
  "graphics": "design",
  "art": "design",
  "creative": "design",

  // Furniture
  "furniture": "furniture",
  "wood": "furniture",
  "chair": "furniture",
  "sofa": "furniture",
  "table": "furniture",
  "bed": "furniture"
};

import api from "./api";

// ─── Raw API Types ──────────────────────────────────────────────────────────

interface RawProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

interface RawRandomUser {
  id: number;
  gender: string;
  name: { title: string; first: string; last: string };
  email: string;
  picture: { large: string; medium: string; thumbnail: string };
  login: { username: string };
}

interface PaginatedResponse<T> {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  currentPageItems: number;
  previousPage: boolean;
  nextPage: boolean;
  data: T[];
}

interface ApiEnvelope<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// ─── Mapped Course Object ───────────────────────────────────────────────────

export interface MappedCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  instructorName: string;
  instructorAvatar: string;
  isBookmarked: boolean;
  
  // Optional preserved properties for UI rendering
  discountPercentage?: number;
  rating?: number;
  domain: string;
  brand?: string;
}

// ─── Domain matching logic ──────────────────────────────────────────────────

const DOMAINS = {
  Technology: ["phone", "laptop", "electronics", "ai", "software", "tech"],
  Design: ["design", "ui", "graphics", "art", "creative", "furniture"],
  Lifestyle: ["home", "decoration", "daily life", "lifestyle", "groceries", "fragrance"],
  Health: ["skincare", "wellness", "fitness", "beauty", "health"],
};

export function mapDomain(raw: RawProduct): string {
  const text = `${raw.title} ${raw.description} ${raw.category}`.toLowerCase();
  
  for (const [domain, keywords] of Object.entries(DOMAINS)) {
    if (keywords.some((k) => text.includes(k.toLowerCase()))) {
      return domain;
    }
  }
  
  // Default to Lifestyle or Technology if totally unknown
  return "Lifestyle";
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchProducts(
  page = 1,
  limit = 20
): Promise<{ products: RawProduct[]; totalPages: number; hasMore: boolean }> {
  const res = await api.get<ApiEnvelope<PaginatedResponse<RawProduct>>>(
    `/public/randomproducts?page=${page}&limit=${limit}`
  );
  return {
    products: res.data.data.data.filter(p => !p.title.toLowerCase().includes("huawei p30")),
    totalPages: res.data.data.totalPages,
    hasMore: res.data.data.nextPage,
  };
}

export async function fetchInstructors(
  limit = 30
): Promise<RawRandomUser[]> {
  const res = await api.get<ApiEnvelope<PaginatedResponse<RawRandomUser>>>(
    `/public/randomusers?limit=${limit}`
  );
  return res.data.data.data;
}

export async function fetchProductById(
  id: number
): Promise<RawProduct | null> {
  try {
    const res = await api.get<ApiEnvelope<RawProduct>>(
      `/public/randomproducts/${id}`
    );
    return res.data.data;
  } catch {
    return null;
  }
}

// ─── Unified Mapper ─────────────────────────────────────────────────────────

export function mapCourseData(
  product: RawProduct,
  user?: RawRandomUser
): MappedCourse {
  const firstName = user?.name?.first || "Unknown";
  const lastName = user?.name?.last || "Instructor";
  const imageUrl = user?.picture?.large || user?.picture?.medium || "https://i.pravatar.cc/150";

  let title = product.title;
  let description = product.description;

  // Manual override for specific product as requested
  if (product.title === "Samsung Universe 9") {
    title = "Samsung S25 Ultra 5G";
    description = "Master the latest in mobile technology with the Galaxy S25 Ultra 5G. Featuring a 200MP camera, Snapdragon 8 Gen 4, and stunning 6.9-inch display.";
  } else if (product.title.toLowerCase().includes("oppo f19")) {
    title = "Oppo F19 Pro+ 5G";
    description = "Dive into professional mobile photography and ultra-fast charging with the Oppo F19 Pro+ 5G mapping course.";
  }

  return {
    id: String(product.id),
    title,
    description,
    thumbnail: product.images?.[0] || product.thumbnail,
    price: product.price,
    instructorName: `${firstName} ${lastName}`,
    instructorAvatar: imageUrl,
    isBookmarked: false,
    rating: product.rating,
    domain: mapDomain(product),
    discountPercentage: product.discountPercentage,
    brand: product.brand,
  };
}

// ─── The Combined Fetch was removed, moved to courseStore.tsx as per instructions ───

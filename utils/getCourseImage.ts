import { imageMap, keywordCategoryMap } from "../constants/imageMap";

export const getCourseImage = (title: string, domain?: string): string => {
  const lowerTitle = title.toLowerCase();

  let matchedKeyword = "none";
  let selectedCategory = "none";

  // Sort keywords by length descending to prioritize more specific/longer keywords (e.g. smartphone before phone)
  const keywords = Object.keys(keywordCategoryMap).sort((a, b) => b.length - a.length);

  for (const keyword of keywords) {
    // For short acronyms/brands like "hp" use word boundaries to avoid partial matches like "php"
    if (keyword.length <= 3) {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(lowerTitle)) {
        matchedKeyword = keyword;
        selectedCategory = keywordCategoryMap[keyword];
        break; // Stop immediately on first good match
      }
    } else if (lowerTitle.includes(keyword)) {
      matchedKeyword = keyword;
      selectedCategory = keywordCategoryMap[keyword];
      break; // Stop immediately on first good match
    }
  }

  // Temporary console log for debugging 
  console.log(`[Thumbnail Debug] Title: "${title}" | Matched Keyword: "${matchedKeyword}" | Selected Category: "${selectedCategory}"`);

  // If a valid category was found, return its corresponding image
  if (selectedCategory !== "none" && imageMap[selectedCategory]) {
    const images = imageMap[selectedCategory];
    const hash = lowerTitle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return images[hash % images.length];
  }

  // Domain-based fallback ONLY if no valid matching keyword was found in title
  if (domain) {
    const lowerDomain = domain.toLowerCase();
    if (lowerDomain.includes("tech")) {
      return "https://images.unsplash.com/photo-1518770660439-4636190af475"; // tech fallback
    }
    if (lowerDomain.includes("health") || lowerDomain.includes("wellness")) {
      return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b"; // wellness fallback
    }
    if (lowerDomain.includes("design")) {
      return "https://images.unsplash.com/photo-1561070791-2526d30994b5"; // design fallback
    }
    if (lowerDomain.includes("lifestyle")) {
      return "https://images.unsplash.com/photo-1511920170033-f8396924c348"; // lifestyle fallback
    }
  }

  // Final fallback image (default)
  return "https://images.unsplash.com/photo-1498050108023-c5249f4df085"; // generic code/laptop
};

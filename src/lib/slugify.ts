/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 80); // Limit length
}

/**
 * Generate article URL path from title and ID
 * @param title - Article title
 * @param id - Article ID (for uniqueness)
 * @returns URL path like /article/titre-de-article-abc12345
 */
export function getArticleUrl(title: string, id: string): string {
  const slug = slugify(title);
  // Use first 8 chars of UUID for short ID
  const shortId = id.replace(/-/g, '').substring(0, 8);
  return `/article/${slug}-${shortId}`;
}

/**
 * Extract article ID prefix from slug
 * @param slug - URL slug containing title and short ID
 * @returns Short article ID prefix (8 characters without dashes)
 */
export function extractArticleId(slug: string): string {
  // The short ID is the last segment after the last hyphen
  const lastDashIndex = slug.lastIndexOf('-');
  if (lastDashIndex === -1) return slug;
  return slug.substring(lastDashIndex + 1);
}

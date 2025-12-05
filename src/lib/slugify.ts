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
 * @returns URL path like /article/titre-de-article-abc123
 */
export function getArticleUrl(title: string, id: string): string {
  const slug = slugify(title);
  const shortId = id.substring(0, 8);
  return `/article/${slug}-${shortId}`;
}

/**
 * Extract article ID from slug
 * @param slug - URL slug containing title and ID
 * @returns Article ID (8 characters)
 */
export function extractArticleId(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1] || '';
}

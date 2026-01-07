/**
 * Utility functions to mask Cloudinary URLs with proxy URLs
 * This prevents exposing CDN URLs directly to clients
 */

/**
 * Get the API base URL for proxy requests
 */
const getApiBase = (): string => {
  // In development, use relative path (Vite proxy handles it)
  // In production, this would be the actual API URL
  return '/api';
};

/**
 * Convert a Cloudinary cover image URL to a proxied URL
 * @param coverImageUrl - The original Cloudinary URL from the backend
 * @param bookId - The book ID to use for the proxy endpoint
 * @returns Proxied URL or original URL if bookId is not available
 */
export const getProxiedCoverUrl = (coverImageUrl: string, bookId?: string): string => {
  // If no bookId provided, we can't proxy - return original
  if (!bookId) {
    return coverImageUrl;
  }

  // Check if it's a Cloudinary URL (contains cloudinary.com)
  if (coverImageUrl.includes('cloudinary.com') || coverImageUrl.includes('res.cloudinary')) {
    return `${getApiBase()}/books/proxy/cover/${bookId}`;
  }

  // If it's not a Cloudinary URL, return as-is
  return coverImageUrl;
};

/**
 * Convert a Cloudinary file URL to a proxied URL
 * @param fileUrl - The original Cloudinary URL from the backend
 * @param bookId - The book ID to use for the proxy endpoint
 * @returns Proxied URL or original URL if bookId is not available
 */
export const getProxiedFileUrl = (fileUrl: string, bookId?: string): string => {
  // If no bookId provided, we can't proxy - return original
  if (!bookId) {
    return fileUrl;
  }

  // Check if it's a Cloudinary URL
  if (fileUrl.includes('cloudinary.com') || fileUrl.includes('res.cloudinary')) {
    return `${getApiBase()}/books/proxy/file/${bookId}`;
  }

  // If it's not a Cloudinary URL, return as-is
  return fileUrl;
};

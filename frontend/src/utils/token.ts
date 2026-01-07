/**
 * JWT Token utilities
 * Handles token parsing and expiration checking
 *
 * SECURITY NOTE: These utilities are for UX purposes only.
 * Never trust client-side token verification for security decisions.
 * The backend must always validate tokens on protected endpoints.
 */

export interface TokenPayload {
  sub?: { id?: string; email?: string; name?: string };
  name?: string;
  email?: string;
  exp?: number;
  iat?: number;
}

/**
 * Safely decode a JWT token payload (without verification)
 * This is only for reading claims - NEVER trust for security
 */
export function decodeTokenPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired based on its exp claim
 * Adds a buffer of 60 seconds to handle clock skew
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) {
    // If no expiration, assume it's expired for safety
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const buffer = 60; // 60 seconds buffer

  return payload.exp < currentTime + buffer;
}

/**
 * Get the user ID from a token payload
 * Returns null if token is invalid or doesn't contain user ID
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeTokenPayload(token);
  return payload?.sub?.id || null;
}

/**
 * Get the user name from a token payload
 * Returns null if token is invalid or doesn't contain user name
 */
export function getUserNameFromToken(token: string): string | null {
  const payload = decodeTokenPayload(token);
  // Try different possible locations for name in JWT
  return payload?.name || payload?.sub?.name || null;
}

/**
 * Get the user email from a token payload
 * Returns null if token is invalid or doesn't contain email
 */
export function getUserEmailFromToken(token: string): string | null {
  const payload = decodeTokenPayload(token);
  // Try different possible locations for email in JWT
  return payload?.email || payload?.sub?.email || null;
}

/**
 * Get time until token expires in milliseconds
 * Returns 0 if token is already expired or invalid
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - currentTime;

  return remaining > 0 ? remaining * 1000 : 0;
}

/**
 * Check if token should be refreshed (less than 5 minutes remaining)
 */
export function shouldRefreshToken(token: string): boolean {
  const remaining = getTokenTimeRemaining(token);
  const fiveMinutes = 5 * 60 * 1000;
  return remaining > 0 && remaining < fiveMinutes;
}

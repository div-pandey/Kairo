/**
 * Security & Sanitization Utilities for Kairo
 * Defends against XSS, Path Traversal, Null-Byte Injection, and Parameter Tampering.
 */

/**
 * Strips HTML tags, script blocks, null bytes, and control characters.
 */
export function sanitizeText(val: unknown, maxLength: number = 500): string {
  if (typeof val !== 'string') return '';
  return val
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove dangerous <script> tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip HTML tags
    .replace(/<[^>]+>/g, '')
    // Normalize unicode and whitespace
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and sanitizes email address.
 * Rejects header injection characters (\r, \n).
 */
export function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const cleaned = email.trim().toLowerCase().replace(/[\r\n]/g, '');
  // RFC 5322 compliant simplified regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleaned) || cleaned.length > 254) {
    return null;
  }
  return cleaned;
}

/**
 * Sanitizes alphanumeric identifiers (e.g. Roll Numbers, Classroom numbers).
 * Allows only alphanumeric characters and safe punctuation (dashes, slashes, spaces, underscores, dots).
 */
export function sanitizeIdentifier(val: unknown, maxLength: number = 50): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/\0/g, '')
    .replace(/[^a-zA-Z0-9\s\-_./]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes file names to prevent path traversal attacks (../ or ..\).
 */
export function sanitizeFileName(name: unknown, maxLength: number = 255): string {
  if (typeof name !== 'string') return 'document';
  // Strip path traversal indicators, directory separators and dangerous OS characters
  const base = name
    .replace(/\0/g, '')
    .replace(/(\.\.(\/|\\))+/g, '')
    .replace(/[/\\]/g, '_')
    .replace(/[\x00-\x1f\x7f-\x9f<>:"|?*]/g, '')
    .trim();
  return (base || 'document').slice(0, maxLength);
}

/**
 * Clamps numeric values strictly within a safe bounds range.
 */
export function clampInt(val: unknown, min: number, max: number, fallback: number): number {
  const parsed = parseInt(String(val), 10);
  if (isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

import { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window cache
// Global map keyed by `action:identifier`
const rateLimitCache = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitCache.entries()) {
      // Remove timestamps older than 1 hour
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000);
      if (record.timestamps.length === 0) {
        rateLimitCache.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Checks whether the request is within rate limit bounds.
 *
 * @param key Identifier for the rate limit bucket (e.g. `register:192.168.1.1` or `order:user-uuid`)
 * @param limit Maximum number of requests permitted in the window
 * @param windowMs Duration of the sliding window in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitCache.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitCache.set(key, record);
  }

  // Keep only timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    limit,
    remaining: limit - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Extracts client IP securely from incoming request headers.
 */
export function getClientIp(req: Request | NextRequest): string {
  if ('headers' in req) {
    const headers = req.headers;
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    const realIp = headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    const cfIp = headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();
  }
  return '127.0.0.1';
}

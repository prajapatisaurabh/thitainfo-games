import { NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Works for single-instance deployments.
 * For multi-instance deployments, replace the store with Redis.
 */

// Global store survives Next.js hot-reload in development
if (!global.__rateLimitStore) {
  global.__rateLimitStore = new Map();
}
const store = global.__rateLimitStore;

/**
 * @param {Request} request
 * @param {{ limit: number, windowMs: number }} options
 * @returns {NextResponse | null} - Returns a 429 response if rate limited, null otherwise
 */
export function rateLimit(request, { limit = 20, windowMs = 60_000 } = {}) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const key = `${request.nextUrl.pathname}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count += 1;

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { success: false, message: "Too many requests, please try again later" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  return null;
}

// Periodically clean up expired entries
if (!global.__rateLimitCleanup) {
  global.__rateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000).unref();
}

/**
 * Simple in-memory sliding window rate limiter.
 * Works per-IP per-route. Resets on server restart.
 * For production, replace with Redis-backed solution.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

type RateLimitStore = Map<string, RateLimitEntry>

declare global {
  var __studyOneRateLimitStore: RateLimitStore | undefined
}

const store = globalThis.__studyOneRateLimitStore ?? new Map<string, RateLimitEntry>()

if (!globalThis.__studyOneRateLimitStore) {
  globalThis.__studyOneRateLimitStore = store
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (entry.resetAt < now) store.delete(key)
    })
  }, 5 * 60 * 1000)
  cleanupTimer.unref?.()
}

interface RateLimitOptions {
  /** Max requests per window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  { limit, windowSec }: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSec * 1000

  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // First request or window expired
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

export function resetRateLimitStore() {
  store.clear()
}

/** Extract real IP from Next.js request headers */
export function getIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

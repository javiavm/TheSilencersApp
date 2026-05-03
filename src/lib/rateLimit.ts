// Rate limiter en memoria (sliding window por key).
// MVP single-instance. Día 14+ con multi-instance: swap a Upstash sin cambiar consumidores.
import { NextResponse } from 'next/server';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Limpieza pasiva — si la entrada expiró, se reescribe en el siguiente acceso.
// Para evitar leak en proceso de larga duración, podamos cada N hits.
let hitCounter = 0;
function maybeGc() {
  if (++hitCounter % 1000 !== 0) return;
  const now = Date.now();
  for (const [key, b] of buckets) if (b.resetAt < now) buckets.delete(key);
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  maybeGc();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, limit, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (bucket.count >= limit) {
    return { ok: false, limit, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { ok: true, limit, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

export function rateLimitKey(req: Request, userId?: string | null): string {
  if (userId) return `u:${userId}`;
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Helper para route handlers — devuelve null si pasa, NextResponse 429 si bloquea.
 *
 * Ejemplo de uso:
 *   const blocked = enforceRateLimit(req, { userId, limit: 30, windowMs: 60_000 });
 *   if (blocked) return blocked;
 */
export function enforceRateLimit(
  req: Request,
  opts: { userId?: string | null; limit: number; windowMs: number; scope?: string },
): NextResponse | null {
  const baseKey = rateLimitKey(req, opts.userId);
  const key = opts.scope ? `${opts.scope}:${baseKey}` : baseKey;
  const result = rateLimit(key, opts.limit, opts.windowMs);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
  };

  if (!result.ok) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Intenta de nuevo en unos segundos.' },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
        },
      },
    );
  }
  return null;
}

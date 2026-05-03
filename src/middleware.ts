// Auth en /admin y /me + CORS estricto en /api.
import { NextResponse, type NextRequest } from 'next/server';
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';

const ALLOWED_ORIGINS = new Set(
  (process.env.NEXTAUTH_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
);

function applyCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.append('Vary', 'Origin');
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Max-Age', '86400');
  return res;
}

const authGate = withAuth(
  function gate(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;
    if (pathname.startsWith('/admin') && role !== 'ADMIN' && role !== 'MODERATOR') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: '/login' },
  },
);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api')) {
    if (req.method === 'OPTIONS') {
      return applyCors(req, new NextResponse(null, { status: 204 }));
    }
    return applyCors(req, NextResponse.next());
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/me')) {
    return authGate(req as NextRequestWithAuth, {} as never);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/me/:path*'],
};

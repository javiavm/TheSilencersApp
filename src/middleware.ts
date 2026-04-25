// Protege /admin (solo MOD/ADMIN) y /me (autenticados) con NextAuth.
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
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

export const config = {
  matcher: ['/admin/:path*', '/me/:path*'],
};

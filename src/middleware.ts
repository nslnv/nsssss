import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Разрешаем саму страницу логина
  if (pathname === '/admin' || pathname === '/admin/') return NextResponse.next();

  // Публичные admin-API
  const publicAdminApi = new Set([
    '/api/admin/auth/login',
    '/api/admin/auth/logout',
    '/api/admin/test-login',
  ]);
  if (publicAdminApi.has(pathname)) return NextResponse.next();

  // Защита остального admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin_session')?.value;
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { ok: false, code: 'UNAUTHORIZED', error: 'Admin authentication required' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin', request.url);
      const resp = NextResponse.redirect(loginUrl);
      resp.cookies.delete('admin_session');
      return resp;
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) throw new Error('Token expired');

      const resp = NextResponse.next();
      resp.headers.set('x-admin-username', (payload as any).username || '');
      resp.headers.set('x-admin-role', (payload as any).role || '');
      return resp;
    } catch {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { ok: false, code: 'INVALID_TOKEN', error: 'Invalid or expired session' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin', request.url);
      const resp = NextResponse.redirect(loginUrl);
      resp.cookies.delete('admin_session');
      return resp;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
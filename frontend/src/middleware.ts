import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  console.log(`[MIDDLEWARE] Path: ${pathname}, Auth token present: ${!!authToken}`);

  // 1. Skip static files and auth APIs
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Auth pages (Login/Signup) logic
  if (pathname === '/login' || pathname === '/signup') {
    if (authToken) {
      // Agar pehle se login hai toh home bhejo
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected Routes logic
  // Yahan se `/(auth)` wala check hata diya hai kyunki URL mein bracket nahi aate
  if (!authToken && pathname !== '/') {
    console.log('[MIDDLEWARE] Redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Matcher ko thora saaf kar diya hai
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
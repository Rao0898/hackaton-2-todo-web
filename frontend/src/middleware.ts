import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware sirf cookies read kar sakta hai
  const authToken = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Add logging to see if middleware is finding the auth-token
  console.log(`[MIDDLEWARE] Path: ${pathname}, Auth token present: ${!!authToken}`);

  // Skip middleware for auth API routes to allow authentication to work
  if (pathname.startsWith('/api/auth')) {
    console.log('[MIDDLEWARE] Skipping auth API routes');
    return NextResponse.next();
  }

  // Don't redirect if we're already on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    console.log('[MIDDLEWARE] On auth page, token present:', !!authToken);
    // If already authenticated, redirect to home instead of dashboard
    if (authToken) {
      console.log('[MIDDLEWARE] Authenticated user on auth page, redirecting to home');
      return NextResponse.redirect(new URL('/home', request.url));
    }
    // Otherwise, allow access to login/signup pages
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access any page except login/signup, redirect to login
  if (!authToken && pathname !== '/' && !pathname.startsWith('/(auth)')) {
    console.log('[MIDDLEWARE] Unauthenticated user trying to access protected path, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    // Original URL save kar lo taake login ke baad wahi bhej saken
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log('[MIDDLEWARE] Allowing access to path:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
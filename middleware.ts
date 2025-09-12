import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Platform', process.env.NEXT_PUBLIC_PLATFORM || 'cms');
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Platform', process.env.NEXT_PUBLIC_PLATFORM || 'cms');
  return response;
}

/**
 * Configure which paths this middleware runs on
 * In this case, run middleware on all routes
 */
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico, robots.txt, sitemap.xml (common static files)
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};

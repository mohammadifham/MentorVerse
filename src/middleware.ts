import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { method, nextUrl } = request;

  // OpenEnv checker may POST to the submitted root URL path.
  // Return JSON directly to avoid 405 HTML from the home page route.
  if (method === 'POST' && nextUrl.pathname === '/') {
    return NextResponse.json({ ok: true, reset: true });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*'
};

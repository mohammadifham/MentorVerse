import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { method, nextUrl } = request;

  // OpenEnv checker may POST to the submitted root URL path.
  // Rewrite root POST to the reset endpoint so it receives JSON, not HTML.
  if (method === 'POST' && nextUrl.pathname === '/') {
    const rewriteUrl = nextUrl.clone();
    rewriteUrl.pathname = '/openenv/reset';
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/']
};

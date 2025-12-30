import { NextResponse, type NextRequest } from 'next/server';

const USER = 'PapTools_development';
const PASS = 'development_papT00ls';
const BASIC = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');

export const config = {
  matcher: [
    '/((?!_next/|static/|assets/|img/|json/|robots\\.txt|sitemap\\.xml|favicon\\.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (auth !== BASIC) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Restricted"' },
    });
  }

  const { pathname } = req.nextUrl;

  // Skip rewrite for assets with extensions
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  if (pathname.endsWith('/')) {
    url.pathname = `${pathname}index.html`;
  } else {
    url.pathname = `${pathname}/index.html`;
  }
  return NextResponse.rewrite(url);
}

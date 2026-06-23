import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'donitalan-dev-secret'
)

// Routes protégées
const PROTECTED_ROUTES = [
  '/admin',
  '/proprietaire',
  '/chauffeur',
  '/client',
  '/reservations',
  '/profil',
  '/paiement',
]

// Routes admin uniquement
const ADMIN_ONLY_ROUTES = ['/admin']

// Routes propriétaire uniquement
const OWNER_ONLY_ROUTES = ['/proprietaire']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('donitalan-token')?.value

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  if (!token) {
    const url = new URL('/connexion', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string
    const userId = payload.userId as string

    // Inject user info into headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', userId)
    requestHeaders.set('x-user-role', role)

    // Admin only routes
    if (ADMIN_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/accueil', request.url))
      }
    }

    // Owner only routes
    if (OWNER_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
      if (role !== 'TRUCK_OWNER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/accueil', request.url))
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } })
  } catch {
    // Invalid token — clear it and redirect to login
    const url = new URL('/connexion', request.url)
    const response = NextResponse.redirect(url)
    response.cookies.delete('donitalan-token')
    return response
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/proprietaire/:path*',
    '/chauffeur/:path*',
    '/client/:path*',
    '/reservations/:path*',
    '/profil/:path*',
    '/paiement/:path*',
  ],
}

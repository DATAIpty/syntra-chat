import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJwt } from 'jose'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get('syntra_chat_accessToken')?.value

  // Define route groups
  const isAuthRoute = pathname.startsWith('/login')
  const isProtectedRoute = !isAuthRoute && pathname !== '/' // Assuming you want to protect all routes except login

  // Case 1: User has no token
  if (!accessToken) {
    // If already on login page, let them through
    if (isAuthRoute) {
      return NextResponse.next()
    }
    // If trying to access protected route, redirect to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  // Case 2: User has token but it's expired
  if (isTokenExpired(accessToken)) {
    // Clear cookies and redirect to login
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.set('syntra_chat_accessToken', '', { maxAge: -1, path: '/' })
    response.cookies.set('syntra_chat_user', '', { maxAge: -1, path: '/' })
    return response
  }

  // Case 3: User has valid token but is on auth routes
  if (isAuthRoute) {
    return NextResponse.redirect(new URL('/chat', req.url))
  }

  if (pathname === '/') {
  if (!accessToken || isTokenExpired(accessToken)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.redirect(new URL('/chat', req.url))
}

  // Case 4: Valid token accessing protected routes
  return NextResponse.next()
}

// Check if token is expired with 5-minute buffer for refresh
function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJwt(token) as { exp?: number }
    if (!decoded.exp) return false
    // Add 5-minute buffer to refresh before actual expiration
    return decoded.exp < (Date.now() / 1000) + (5 * 60)
  } catch (error) {
    return true
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
}
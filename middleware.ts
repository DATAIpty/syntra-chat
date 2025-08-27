import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJwt } from 'jose'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get('syntra_chat_accessToken')?.value

  // Define route groups based on your actual folder structure
  const isAuthRoute = pathname.startsWith('/login') 

  // If no token and trying to access protected routes
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If token exists, check if it's expired
  if (isTokenExpired(accessToken)) {
    // Clear cookies
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.set('syntra_chat_accessToken', '', { maxAge: -1, path: '/' })
    response.cookies.set('syntra_chat_user', '', { maxAge: -1, path: '/' })
    return response
  }

  // If user is authenticated but on auth routes, redirect to chat
  if (isAuthRoute) {
    return NextResponse.redirect(new URL('/chat', req.url))
  }

  

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
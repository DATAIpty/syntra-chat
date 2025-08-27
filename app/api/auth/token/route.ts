// app/api/auth/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('syntra_chat_accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    // Validate token expiration
    try {
      const decoded = decodeJwt(accessToken) as { exp?: number };
      if (decoded.exp && decoded.exp < (Date.now() / 1000)) {
        // Token expired
        const response = NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        );
        
        // Clear expired cookies
        response.cookies.set('syntra_chat_accessToken', '', { maxAge: -1, path: '/' });
        response.cookies.set('syntra_chat_user', '', { maxAge: -1, path: '/' });
        
        return response;
      }
    } catch (decodeError) {
      // Invalid token format
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Return the token for client-side use
    return NextResponse.json({
      access_token: accessToken,
      valid: true
    });
    
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Token validation failed' },
      { status: 500 }
    );
  }
}
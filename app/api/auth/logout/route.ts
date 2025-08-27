// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mainApi } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('syntra_chat_accessToken')?.value;
    
    // Call the backend logout endpoint if token exists
    if (accessToken) {
      try {
        await mainApi.auth.logout(accessToken);
      } catch (error) {
        console.error('Backend logout error:', error);
        // Continue with cookie clearing even if backend call fails
      }
    }

    // Clear cookies regardless of backend call result
    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    response.cookies.set('syntra_chat_accessToken', '', {
      maxAge: -1,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    response.cookies.set('syntra_chat_user', '', {
      maxAge: -1,
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear cookies
    const response = NextResponse.json(
      { error: 'Logout error', message: 'Cookies cleared' },
      { status: 500 }
    );
    
    response.cookies.set('syntra_chat_accessToken', '', { maxAge: -1, path: '/' });
    response.cookies.set('syntra_chat_user', '', { maxAge: -1, path: '/' });
    
    return response;
  }
}
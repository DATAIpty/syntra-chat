// hooks/useTokenManager.ts
import { useState, useEffect } from 'react';

/**
 * Hook for managing access tokens from HTTP-only cookies
 */
export const useTokenManager = () => {
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  // Check token validity on mount
  useEffect(() => {
    checkTokenValidity();
  }, []);

  const checkTokenValidity = async () => {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'GET',
        credentials: 'include',
      });
      
      setIsTokenValid(response.ok);
      
      if (!response.ok && response.status === 401) {
        // Token expired, redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setIsTokenValid(false);
    }
  };

  const refreshTokenValidity = () => {
    checkTokenValidity();
  };

  return {
    isTokenValid,
    checkTokenValidity,
    refreshTokenValidity,
  };
};

/**
 * Server-side token retrieval utility (for API routes)
 */
export const getServerToken = (request: Request): string | null => {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies.syntra_chat_accessToken || null;
  } catch (error) {
    console.error('Failed to extract token from request:', error);
    return null;
  }
};

/**
 * Utility to create an API route that requires authentication
 */
export const withAuth = (handler: (request: Request, token: string) => Promise<Response>) => {
  return async (request: Request): Promise<Response> => {
    const token = getServerToken(request);
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'No access token found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      return await handler(request, token);
    } catch (error) {
      console.error('API route error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error', message: 'Request failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
};